export type ChangelogCategory = 'Pembaruan' | 'Peningkatan' | 'Pemeliharaan' | 'Gangguan' | 'Selesai';

export interface ChangelogItem {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  category: ChangelogCategory;
  impact?: 'none' | 'minor' | 'major' | 'critical';
  summary: string;
  details: string[];
  note?: string;
}

export interface ImprovementPlanItem {
  id: string;
  title: string;
  summary: string;
  category: string;
}

export const IMPACT_LABELS: Record<string, string> = {
  none: 'Tanpa Gangguan',
  minor: 'Dampak Ringan',
  major: 'Dampak Signifikan',
  critical: 'Dampak Kritis',
};

export const CHANGELOG_ITEMS: ChangelogItem[] = [
  {
    id: 'ch-007',
    date: '2026-10-23',
    title: 'Peningkatan Akurasi Monitoring Latensi DNS',
    category: 'Peningkatan',
    impact: 'none',
    summary:
      'Pembaruan sistem monitoring untuk memberikan gambaran latensi layanan DNS yang lebih terperinci. Pengukuran DoT dan DoH kini memisahkan waktu pembentukan koneksi dari waktu penyelesaian kueri DNS.',
    details: [
      'Menambahkan metrik waktu koneksi (connectionLatencyMs) untuk mengukur proses setup koneksi, termasuk TCP dan TLS.',
      'Menambahkan metrik waktu kueri DNS (dnsQueryLatencyMs) hingga respons DNS lengkap diterima.',
      'Mempertahankan latensi total (totalLatencyMs) untuk memantau keseluruhan proses probe.',
      'Menyempurnakan pengukuran respons DoH agar mencakup pembacaan seluruh body respons DNS.',
      'Memperbarui kartu status layanan dan riwayat probe agar rincian latensi dapat ditampilkan jika tersedia.',
      'Memisahkan evaluasi status kesehatan resolver (dnsQueryLatencyMs) dari latensi transport probe agar jarak serverless tidak menandai resolver operasional sebagai degraded.',
      'Mempertahankan kompatibilitas dengan data probe lama melalui fallback pada penyimpanan.',
    ],
    note: 'Pembaruan ini meningkatkan transparansi pengukuran dan membantu membedakan waktu koneksi dari waktu kueri DNS. Status kesehatan mencerminkan responsivitas resolver murni.',
  },
  {
    id: 'ch-006',
    date: '2026-10-22',
    title: 'Peluncuran Portal Status dan Dokumentasi',
    category: 'Pembaruan',
    impact: 'none',
    summary:
      'Portal WibufyDNS diperkenalkan sebagai pusat informasi layanan, panduan konfigurasi, dan pemantauan ketersediaan resolver DNS terenkripsi.',
    details: [
      'Penyediaan halaman monitoring DoT dan DoH.',
      'Penambahan dokumentasi konfigurasi dan troubleshooting.',
      'Penyediaan changelog untuk mencatat perkembangan layanan.',
      'Penanganan status monitoring yang belum tersedia atau kedaluwarsa.',
    ],
  },
  {
    id: 'ch-005',
    date: '2026-10-18',
    title: 'Peninjauan Konfigurasi Filter DNS',
    category: 'Pemeliharaan',
    impact: 'none',
    summary:
      'Peninjauan konfigurasi penyaringan domain pada backend AdGuard Home untuk menjaga keseimbangan antara pemblokiran domain yang tidak diinginkan dan akses ke domain yang sah.',
    details: [
      'Evaluasi daftar filter iklan, tracker, dan domain berbahaya.',
      'Pemeriksaan aturan yang berpotensi tumpang tindih.',
      'Peninjauan kemungkinan false positive pada domain yang dibutuhkan pengguna.',
    ],
  },
  {
    id: 'ch-004',
    date: '2026-10-16',
    title: 'Evaluasi Kesehatan Resolver',
    category: 'Pemeliharaan',
    impact: 'none',
    summary:
      'Pemeriksaan kondisi layanan AdGuard Home dan konektivitas resolver pada server.',
    details: [
      'Pemeriksaan status service dan listener DNS.',
      'Pengujian resolusi domain melalui resolver lokal.',
      'Peninjauan koneksi DNS terenkripsi dari sisi klien.',
    ],
  },
  {
    id: 'ch-003',
    date: '2026-10-10',
    title: 'Validasi Koneksi TLS',
    category: 'Pemeliharaan',
    impact: 'none',
    summary:
      'Pemeriksaan koneksi terenkripsi pada endpoint WibufyDNS untuk memastikan konfigurasi TLS sesuai dengan hostname layanan.',
    details: [
      'Pemeriksaan sertifikat dan validasi hostname.',
      'Pengujian koneksi DoT pada port 853.',
      'Pengujian endpoint DoH melalui HTTPS.',
    ],
  },
  {
    id: 'ch-002',
    date: '2026-10-05',
    title: 'Peninjauan Upstream DNS',
    category: 'Pemeliharaan',
    impact: 'none',
    summary:
      'Evaluasi konfigurasi upstream resolver yang digunakan AdGuard Home.',
    details: [
      'Peninjauan keberhasilan resolusi domain.',
      'Pengamatan waktu respons dan kegagalan kueri.',
      'Evaluasi kebutuhan upstream alternatif untuk meningkatkan ketahanan layanan.',
    ],
  },
  {
    id: 'ch-001',
    date: '2026-09-28',
    title: 'Inisialisasi Resolver DNS Terenkripsi',
    category: 'Pembaruan',
    impact: 'none',
    summary:
      'WibufyDNS mulai menyediakan layanan DNS terenkripsi berbasis AdGuard Home dengan penyaringan domain berdasarkan konfigurasi filter yang aktif.',
    details: [
      'DoT: "dns.wibufy.biz.id"',
      'DoH: "https://doh.wibufy.biz.id/dns-query"',
      'Penyaringan domain iklan, tracker, dan domain berbahaya sesuai filter yang digunakan.',
    ],
  },
];

export const IMPROVEMENT_PLANS: ImprovementPlanItem[] = [
  {
    id: 'plan-01',
    title: 'Evaluasi Upstream',
    summary: 'Meninjau keandalan dan waktu respons resolver.',
    category: 'Resolver & Konektivitas',
  },
  {
    id: 'plan-02',
    title: 'Penyempurnaan Monitoring',
    summary: 'Memperjelas status layanan, waktu pemeriksaan, dan penanganan data kedaluwarsa.',
    category: 'Pemantauan & Audit',
  },
  {
    id: 'plan-03',
    title: 'Evaluasi Filter',
    summary: 'Meninjau efektivitas pemblokiran dan potensi false positive.',
    category: 'Penyaringan Domain',
  },
  {
    id: 'plan-04',
    title: 'Peningkatan Dokumentasi',
    summary: 'Memperjelas panduan konfigurasi untuk perangkat yang didukung.',
    category: 'Dokumentasi Panduan',
  },
];
