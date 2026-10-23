# WibufyDNS Status & Documentation (prstya.web.id)

Portal status publik, pemantauan ketersediaan berkala, dan dokumentasi resmi layanan DNS terenkripsi **WibufyDNS** (DoT & DoH) yang dikelola oleh **prstyaDev** dengan database **Supabase PostgreSQL**.

---

## 1. Arsitektur & Hasil Audit Keamanan

- **Domain Publik:** `prstya.web.id`
- **Framework:** Next.js 15+ (App Router) + TypeScript + Tailwind CSS.
- **Hosting Target:** Vercel (Paket Hobby).
- **Database Utama:** **Supabase PostgreSQL** via Transaction Pooler (Port 6543).

### Tiga Pilar Audit Keamanan & Keandalan:

1. **Global Rate Limit Atomik & Anti-Konkurensi:**
   - Menggunakan fungsi PostgreSQL `public.acquire_probe_rate_limit('global_probe', 60)` dengan penguncian baris eksklusif (`SELECT ... FOR UPDATE`).
   - Mencegah *race condition* atau *probe stampede* saat beberapa request tiba bersamaan pada instance serverless Vercel yang berbeda. Hanya satu request yang memperoleh izin eksekusi; request lainnya menerima `HTTP 429 Too Many Requests` dengan informasi sisa detik secara presisi.
2. **Retensi 30 Hari yang Andal (Multi-Mekanisme):**
   - **Jalur 1 (Vercel Cron Harian 00:00 UTC):** Endpoint `/api/cron/check-dns` mengeksekusi fungsi pembersihan `cleanOldProbeLogs()` secara mandiri pada setiap jadwal cron, bahkan jika probe jaringan mengalami kendala.
   - **Jalur 2 (Trigger PostgreSQL):** Trigger `trigger_cleanup_old_probes` memicu `clean_old_dns_probes()` setiap kali log baru dimasukkan.
   - **Jalur 3 (Supabase Native pg_cron - Opsional):** Skema menyediakan penjadwalan mandiri di dalam Supabase setiap hari jam `03:00 UTC` (`0 3 * * *`).
3. **Konfigurasi SSL Ketat & PgBouncer Transaction Pooler:**
   - **SSL Valid:** Menghilangkan `rejectUnauthorized: false`. Koneksi memvalidasi sertifikat TLS server Supabase (`rejectUnauthorized: true`) menggunakan root CA tepercaya sistem/Node.js, dengan opsi penambahan `SUPABASE_SSL_CA` jika diperlukan.
   - **Kompatibilitas Transaction Pooler (Port 6543):** Seluruh query menggunakan *unnamed parameterized queries* (`$1, $2, ...`) yang didukung penuh oleh PgBouncer dalam mode transaksi. Tidak ada *named prepared statement* yang dapat menyebabkan *state leakage* atau error lintas koneksi.
   - **Siklus Hidup Serverless:** Batas koneksi ditetapkan konservatif (`max: 2`, `idleTimeoutMillis: 1000`) agar koneksi langsung dikembalikan ke pool Supabase setelah fungsi serverless selesai.

---

## 2. Struktur Repositori

```
├── app/
│   ├── api/
│   │   ├── cron/check-dns/    # Endpoint Vercel Cron (dilindungi CRON_SECRET)
│   │   └── status/            # Endpoint status publik & atomic rate-limited live check
│   ├── changelog/             # Riwayat pembaruan, pemeliharaan & insiden
│   ├── docs/                  # Dokumentasi teknis & panduan pasang klien
│   ├── globals.css            # Tailwind CSS styling
│   ├── layout.tsx             # Root Layout, Metadata, Header, Footer
│   ├── not-found.tsx          # Halaman 404
│   └── page.tsx               # Halaman Beranda & ringkasan operasional
├── components/
│   ├── CopyButton.tsx         # Salin cepat clipboard
│   ├── Footer.tsx             # Informasi hak cipta & credit prstyaDev
│   ├── Header.tsx             # Navigasi & identitas brand
│   ├── LiveCheckTrigger.tsx   # Panel status & panduan koneksi Supabase
│   ├── ServiceCard.tsx        # Spesifikasi DoT & DoH terpisah
│   └── StatusIndicator.tsx    # Penanda status zero-pill compliant
├── lib/
│   ├── changelog-data.ts      # Data terstruktur changelog
│   ├── dns/
│   │   ├── packet.ts          # Encoder & decoder DNS wire-format RFC 1035 murni
│   │   └── probes.ts          # Active Probers: DoT (TLS:853) & DoH (HTTPS:443)
│   └── storage/
│       └── index.ts           # Koneksi Supabase PostgreSQL pooler, SSL ketat, atomic rate limit
├── supabase/
│   ├── migrations/
│   │   └── 20261022000000_create_dns_monitoring_tables.sql
│   └── schema.sql             # Skrip SQL siap tempel di Supabase SQL Editor
├── .env.example               # Panduan variabel lingkungan
├── vercel.json                # Jadwal Vercel Cron
└── package.json
```

---

## 3. Langkah Menyiapkan Supabase PostgreSQL

### Langkah 1: Buat Project Supabase
1. Kunjungi [supabase.com](https://supabase.com) dan buat project baru.
2. Simpan password database dan catat Project Reference ID.

### Langkah 2: Jalankan Skema SQL & Migration
1. Buka menu **SQL Editor** pada sidebar kiri dashboard Supabase.
2. Tempelkan seluruh isi file [`supabase/schema.sql`](supabase/schema.sql).
3. Klik tombol **Run**.
4. Skrip ini membuat:
   - Tabel `dns_status_summary`, `dns_probe_logs`, dan `dns_rate_limits`.
   - Fungsi atomik `acquire_probe_rate_limit(p_key, p_cooldown_seconds)` dengan row lock `FOR UPDATE`.
   - Fungsi mandiri `clean_old_dns_probes()` dan trigger otomatis pembersihan 30 hari.
   - Row Level Security (RLS) aktif dengan kebijakan read-only untuk publik.

### Langkah 3: Dapatkan Connection String Pooler
1. Buka **Project Settings** > **Database**.
2. Pada bagian **Connection string**, pilih tab **URI** dan ubah mode ke **Transaction (Port 6543)**.
3. Salin URL koneksi:
   ```
   postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
   ```

---

## 4. Konfigurasi Environment Variables di Vercel

Pada dashboard proyek Vercel Anda (**Settings > Environment Variables**), tambahkan:

| Nama Variabel | Wajib? | Contoh Nilai | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | **Ya** | `postgres://postgres.[ref]:[pass]@...:6543/postgres?sslmode=require` | Connection string Transaction Pooler Supabase (Server-side). |
| `CRON_SECRET` | **Ya** | `a9f24...c81e` *(string acak 32 karakter)* | Mengamankan endpoint `/api/cron/check-dns`. |
| `NEXT_PUBLIC_APP_URL` | **Ya** | `https://prstya.web.id` | Domain publik website. |
| `SUPABASE_SSL_CA` | Opsional | `-----BEGIN CERTIFICATE-----...` | Sertifikat CA custom jika jaringan memerlukan pinning sertifikat. |

> **PERINGATAN KEAMANAN:** Jangan menambahkan `NEXT_PUBLIC_` pada `DATABASE_URL` atau `CRON_SECRET`.

---

## 5. Menjalankan & Menguji di Lingkungan Lokal

1. Salin `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Jalankan server lokal:
   ```bash
   npm run dev
   ```
3. Buka peramban di `http://localhost:3000`.

---

## 6. Verifikasi & Pengujian Monitoring

### A. Uji Endpoint Status Publik
```bash
curl -i http://localhost:3000/api/status
```
Jika database belum terhubung, server secara jujur merespons `status: "unknown"` dan `hasSupabase: false` tanpa membuat riwayat palsu.

### B. Uji Rate Limiter Atomik Antar-Instance
Jalankan live probe:
```bash
curl -i -X POST http://localhost:3000/api/status
```
Jika ada request berikutnya dalam kurun waktu 60 detik (baik dari instance yang sama maupun instance serverless lain):
Server mengembalikan status `HTTP 429 Too Many Requests` beserta sisa detik yang dihitung secara atomik dari baris `dns_rate_limits`.

### C. Uji Vercel Cron Endpoint & Pembersihan 30 Hari
```bash
curl -i -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/check-dns
```
- Menjalankan probe DoT (port 853) dan DoH (port 443).
- Memperbarui `dns_status_summary` dan menambahkan baris ke `dns_probe_logs`.
- Menjalankan pembersihan retensi 30 hari secara independen dan mengembalikan jumlah baris yang dibersihkan (`cleanedRowsThisRun`).

### D. Uji Khusus Pembersihan Retensi Saja (Opsional)
```bash
curl -i -H "Authorization: Bearer <CRON_SECRET>" "http://localhost:3000/api/cron/check-dns?cleanup_only=true"
```
Mengeksekusi pembersihan baris lama > 30 hari tanpa memicu kueri probe jaringan ke resolver DNS.

---

## 7. Ketentuan Batasan Jadwal Vercel Hobby

File `vercel.json` dikonfigurasi:
```json
{
  "crons": [
    {
      "path": "/api/cron/check-dns",
      "schedule": "0 0 * * *"
    }
  ]
}
```
Vercel Hobby membatasi cron job maksimal **satu kali per hari**. Jika menginginkan pemeriksaan berkala lebih sering (misalnya setiap 10 menit):
Gunakan layanan penjadwal gratis pihak ketiga (seperti **Cron-Job.org** atau **GitHub Actions Scheduled Workflow**) yang melakukan ping ke:
`GET https://prstya.web.id/api/cron/check-dns` dengan header `Authorization: Bearer <CRON_SECRET>`.
