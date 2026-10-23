-- ==============================================================================
-- WIBUFYDNS (prstya.web.id) — Supabase PostgreSQL Schema & Security Hardening
-- ==============================================================================
-- File: supabase/schema.sql
-- Revisi Keamanan:
-- 1. Hak EXECUTE acquire_probe_rate_limit dicabut dari PUBLIC/anon/authenticated,
--    dan hanya diberikan kepada service_role (server-side only).
-- 2. Fungsi SECURITY DEFINER diamankan dengan 'SET search_path = public, pg_temp'.
-- 3. Trigger DELETE pada setiap INSERT dihapus untuk efisiensi beban database.
--    Pembersihan 30 hari dijalankan secara terjadwal berkala via Vercel Cron/pg_cron.
-- 4. RLS aktif: Publik hanya dapat membaca (SELECT) status dan log tampilan.
--    Tidak ada hak tulis publik (INSERT/UPDATE/DELETE) pada tabel manapun.
-- ==============================================================================

-- 1. Tabel Ringkasan Status Terkini (Satu baris status global)
CREATE TABLE IF NOT EXISTS public.dns_status_summary (
    id INT PRIMARY KEY DEFAULT 1,
    status VARCHAR(20) NOT NULL CHECK (status IN ('operational', 'degraded', 'down', 'unknown')),
    overall_text TEXT NOT NULL,
    dot_status VARCHAR(20) NOT NULL CHECK (dot_status IN ('operational', 'degraded', 'down')),
    dot_latency INTEGER NOT NULL,
    dot_error TEXT,
    dot_rcode VARCHAR(20),
    doh_status VARCHAR(20) NOT NULL CHECK (doh_status IN ('operational', 'degraded', 'down')),
    doh_latency INTEGER NOT NULL,
    doh_error TEXT,
    doh_rcode VARCHAR(20),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT single_row_check CHECK (id = 1)
);

COMMENT ON TABLE public.dns_status_summary IS 'Status ketersediaan terkini DoT & DoH WibufyDNS untuk domain prstya.web.id';

-- 2. Tabel Riwayat Log Pemeriksaan
CREATE TABLE IF NOT EXISTS public.dns_probe_logs (
    id BIGSERIAL PRIMARY KEY,
    service VARCHAR(10) NOT NULL CHECK (service IN ('dot', 'doh')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('operational', 'degraded', 'down')),
    latency_ms INTEGER NOT NULL,
    error_msg TEXT,
    rcode VARCHAR(20),
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dns_probe_logs IS 'Riwayat log probe berkala dengan retensi 30 hari';

-- 3. Tabel Rate Limit Global Terdistribusi (Multi-instance safe)
CREATE TABLE IF NOT EXISTS public.dns_rate_limits (
    id VARCHAR(50) PRIMARY KEY,
    last_triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dns_rate_limits IS 'Pencatatan kunci jeda waktu probe yang aman terhadap konkurensi serverless Vercel';

-- Inisialisasi baris kunci default jika belum ada
INSERT INTO public.dns_rate_limits (id, last_triggered_at)
VALUES ('global_probe', '1970-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- 4. Indexes untuk optimasi query time-series
CREATE INDEX IF NOT EXISTS idx_dns_probe_logs_service_checked ON public.dns_probe_logs (service, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_dns_probe_logs_checked_at ON public.dns_probe_logs (checked_at DESC);

-- ==============================================================================
-- 5. Fungsi Pembersihan Retensi 30 Hari (Mekanisme Terjadwal Berkala)
-- ==============================================================================
-- Catatan Performa: Trigger DELETE per-INSERT sengaja dihapus agar operasi tulis probe
-- ringan dan cepat. Pembersihan dipanggil terjadwal melalui Cron harian atau pg_cron.
DROP TRIGGER IF EXISTS trigger_cleanup_old_probes ON public.dns_probe_logs;
DROP FUNCTION IF EXISTS public.clean_old_dns_probes_trigger();

CREATE OR REPLACE FUNCTION public.clean_old_dns_probes()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.dns_probe_logs
    WHERE checked_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- 6. Fungsi Pengecekan Rate Limit Atomik (Aman terhadap request bersamaan)
-- ==============================================================================
-- Menggunakan SELECT ... FOR UPDATE untuk mengunci baris kunci secara atomik.
-- Mencegah kondisi race condition jika beberapa request tiba bersamaan pada instance Vercel berbeda.
CREATE OR REPLACE FUNCTION public.acquire_probe_rate_limit(
    p_key VARCHAR(50) DEFAULT 'global_probe',
    p_cooldown_seconds INT DEFAULT 60
)
RETURNS TABLE (allowed BOOLEAN, remaining_seconds INT) AS $$
DECLARE
    v_last TIMESTAMPTZ;
    v_now TIMESTAMPTZ := NOW();
    v_elapsed INT;
BEGIN
    -- Pastikan baris target tersedia
    INSERT INTO public.dns_rate_limits (id, last_triggered_at)
    VALUES (p_key, '1970-01-01 00:00:00+00')
    ON CONFLICT (id) DO NOTHING;

    -- Kunci baris secara eksklusif (FOR UPDATE) selama transaksi berjalan
    SELECT last_triggered_at INTO v_last
    FROM public.dns_rate_limits
    WHERE id = p_key
    FOR UPDATE;

    v_elapsed := EXTRACT(EPOCH FROM (v_now - v_last))::INT;

    IF v_elapsed >= p_cooldown_seconds THEN
        -- Jeda waktu terpenuhi: perbarui timestamp kunci secara atomik
        UPDATE public.dns_rate_limits
        SET last_triggered_at = v_now
        WHERE id = p_key;

        RETURN QUERY SELECT true, 0;
    ELSE
        -- Masih dalam jeda waktu: tolak dan kembalikan sisa detik
        RETURN QUERY SELECT false, (p_cooldown_seconds - v_elapsed);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- 7. Row Level Security (RLS) & Kontrol Hak Akses (Zero Public Write / RPC)
-- ==============================================================================
ALTER TABLE public.dns_status_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_probe_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dns_rate_limits ENABLE ROW LEVEL SECURITY;

-- A. Hak baca publik (anon & authenticated) hanya untuk tabel tampilan
DROP POLICY IF EXISTS "Allow public read access on dns_status_summary" ON public.dns_status_summary;
CREATE POLICY "Allow public read access on dns_status_summary"
ON public.dns_status_summary
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public read access on dns_probe_logs" ON public.dns_probe_logs;
CREATE POLICY "Allow public read access on dns_probe_logs"
ON public.dns_probe_logs
FOR SELECT
TO anon, authenticated
USING (true);

-- Tabel dns_rate_limits TIDAK memiliki policy publik. Akses baca/tulis publik tertutup total.

-- B. Pencabutan hak eksekusi publik pada fungsi keamanan & pemeliharaan:
REVOKE EXECUTE ON FUNCTION public.clean_old_dns_probes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clean_old_dns_probes() FROM anon;
REVOKE EXECUTE ON FUNCTION public.clean_old_dns_probes() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.clean_old_dns_probes() TO service_role;

-- C. Pembatasan hak eksekusi acquire_probe_rate_limit hanya untuk backend (service_role):
REVOKE EXECUTE ON FUNCTION public.acquire_probe_rate_limit(VARCHAR, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.acquire_probe_rate_limit(VARCHAR, INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.acquire_probe_rate_limit(VARCHAR, INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_probe_rate_limit(VARCHAR, INT) TO service_role;

-- ==============================================================================
-- 8. [Opsional] Jadwal Pembersihan Otomatis via Supabase pg_cron
-- ==============================================================================
-- Jika ingin pembersihan berjalan langsung di server Supabase setiap hari
-- jam 03:00 UTC (tanpa bergantung pada panggilan Vercel Cron), aktifkan:
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('daily-cleanup-old-dns-probes', '0 3 * * *', 'SELECT public.clean_old_dns_probes()');
