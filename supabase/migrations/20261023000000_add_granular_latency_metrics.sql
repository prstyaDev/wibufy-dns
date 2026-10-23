-- ==============================================================================
-- WIBUFYDNS — Non-destructive Migration: Granular Latency Metrics
-- ==============================================================================
-- Migration file: 20261023000000_add_granular_latency_metrics.sql
-- Description:
-- Adds optional columns for connectionLatencyMs (TCP+TLS setup time)
-- and dnsQueryLatencyMs (pure DNS query RTT) to distinguish connection setup
-- from DNS resolver processing time without affecting existing data.
-- ==============================================================================

-- 1. Tambahkan metrik latensi granular pada tabel ringkasan status terkini
ALTER TABLE public.dns_status_summary
    ADD COLUMN IF NOT EXISTS dot_query_latency INTEGER,
    ADD COLUMN IF NOT EXISTS dot_connect_latency INTEGER,
    ADD COLUMN IF NOT EXISTS doh_query_latency INTEGER,
    ADD COLUMN IF NOT EXISTS doh_connect_latency INTEGER;

COMMENT ON COLUMN public.dns_status_summary.dot_query_latency IS 'Latensi kueri DNS murni (DoT) dalam milidetik';
COMMENT ON COLUMN public.dns_status_summary.dot_connect_latency IS 'Latensi setup koneksi TCP dan handshake TLS (DoT) dalam milidetik';
COMMENT ON COLUMN public.dns_status_summary.doh_query_latency IS 'Latensi kueri DNS murni (DoH) dalam milidetik';
COMMENT ON COLUMN public.dns_status_summary.doh_connect_latency IS 'Latensi setup koneksi TCP dan handshake TLS (DoH) dalam milidetik';

-- 2. Tambahkan metrik latensi granular pada tabel riwayat log pemeriksaan
ALTER TABLE public.dns_probe_logs
    ADD COLUMN IF NOT EXISTS dns_query_latency_ms INTEGER,
    ADD COLUMN IF NOT EXISTS connection_latency_ms INTEGER;

COMMENT ON COLUMN public.dns_probe_logs.dns_query_latency_ms IS 'Waktu dari pengiriman kueri DNS sampai seluruh body respons DNS selesai dibaca (ms)';
COMMENT ON COLUMN public.dns_probe_logs.connection_latency_ms IS 'Waktu pembentukan koneksi TCP dan handshake TLS sebelum kueri dikirim (ms)';
