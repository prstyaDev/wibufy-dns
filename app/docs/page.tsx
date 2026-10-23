import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  Globe,
  Monitor,
  Apple,
  Network,
  HelpCircle,
  AlertTriangle,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'Dokumentasi Konfigurasi WibufyDNS — Panduan DoT & DoH',
  description:
    'Panduan teknis cara mengaktifkan DNS Pribadi di Android, Windows 11, iOS/macOS, dan browser web menggunakan WibufyDNS beserta solusi kendala.',
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Link href="/" className="hover:underline">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Dokumentasi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Dokumentasi Konfigurasi WibufyDNS
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Panduan langkah demi langkah untuk mengintegrasikan WibufyDNS (DoT &amp; DoH) pada perangkat Android, peramban web, Windows 11, Apple iOS/macOS, router, serta panduan troubleshooting.
        </p>
      </div>

      {/* Quick Navigation Anchor Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs space-y-3">
        <span className="font-semibold text-slate-900 uppercase tracking-wider block font-mono text-[11px]">
          Daftar Isi Dokumentasi
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-blue-600">
          <a href="#tentang-wibufy" className="hover:underline flex items-center gap-1.5">
            <span>1. Mengenal WibufyDNS</span>
          </a>
          <a href="#android-dot" className="hover:underline flex items-center gap-1.5">
            <span>2. Private DNS di Android (DoT)</span>
          </a>
          <a href="#browser-doh" className="hover:underline flex items-center gap-1.5">
            <span>3. Konfigurasi DoH di Browser</span>
          </a>
          <a href="#windows-doh" className="hover:underline flex items-center gap-1.5">
            <span>4. Windows 11 Encrypted DNS</span>
          </a>
          <a href="#ios-macos" className="hover:underline flex items-center gap-1.5">
            <span>5. Apple iOS &amp; macOS</span>
          </a>
          <a href="#router-setup" className="hover:underline flex items-center gap-1.5">
            <span>6. Konfigurasi Router Jaringan</span>
          </a>
          <a href="#troubleshooting" className="hover:underline flex items-center gap-1.5">
            <span>7. Troubleshooting &amp; Kendala</span>
          </a>
          <a href="#faq" className="hover:underline flex items-center gap-1.5">
            <span>8. Pertanyaan Umum (FAQ)</span>
          </a>
        </div>
      </div>

      {/* Section 1: Mengenal WibufyDNS */}
      <section id="tentang-wibufy" className="space-y-4 pt-4 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Lock className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">1. Mengenal WibufyDNS</h2>
        </div>
        <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
          <p>
            Kueri DNS konvensional (port 53 UDP/TCP) dikirim dalam format teks terbuka (plaintext). Hal ini memungkinkan penyedia jasa internet (ISP) atau administrator jaringan lokal melihat setiap nama domain yang Anda hubungi serta berpotensi melakukan pembelokan rute (DNS hijacking).
          </p>
          <p>
            <strong>WibufyDNS</strong> adalah layanan recursive DNS resolver yang diamankan dengan standar enkripsi transport:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              <strong>DNS-over-TLS (DoT):</strong> Mengenkripsi kueri DNS dalam koneksi TLS khusus pada port 853 (RFC 7858).
            </li>
            <li>
              <strong>DNS-over-HTTPS (DoH):</strong> Membungkus kueri DNS di dalam sesi HTTPS port 443 (RFC 8484), sehingga menyatu dengan lalu lintas web reguler.
            </li>
            <li>
              <strong>Backend AdGuard Home:</strong> Dilengkapi engine pemblokir berbasis blocklist domain iklan, pop-up, malware, dan pelacak telemetri sebelum koneksi terjalin ke perangkat Anda.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Android Private DNS */}
      <section id="android-dot" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Smartphone className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            2. Cara Mengaktifkan Private DNS di Android (DoT)
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Android 9 (Pie) ke atas memiliki dukungan bawaan untuk DNS-over-TLS (DoT) melalui menu <em>Private DNS</em>. Konfigurasi ini melindungi koneksi internet di ponsel Anda (baik jaringan Wi-Fi maupun Data Seluler).
        </p>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <ol className="list-decimal pl-5 space-y-2.5 text-sm text-slate-700">
            <li>
              Buka aplikasi <strong>Pengaturan (Settings)</strong> pada ponsel Android Anda.
            </li>
            <li>
              Pilih menu <strong>Koneksi &amp; Berbagi</strong> atau <strong>Jaringan &amp; Internet</strong>.
            </li>
            <li>
              Cari opsi <strong>DNS Pribadi (Private DNS)</strong>.
            </li>
            <li>
              Ubah dari <em>Otomatis</em> ke <strong>Hostname Penyedia DNS Pribadi (Private DNS provider hostname)</strong>.
            </li>
            <li>
              Ketikkan hostname berikut:
              <div className="mt-2 flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <code className="font-mono text-sm font-semibold text-slate-900">
                  dns.wibufy.biz.id
                </code>
                <CopyButton text="dns.wibufy.biz.id" label="Salin Hostname" />
              </div>
            </li>
            <li>
              Tekan tombol <strong>Simpan (Save)</strong>.
            </li>
          </ol>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <strong>Indikator Keberhasilan:</strong> Jika tersambung dengan sukses, label status di bawah menu Private DNS akan berubah menampilkan <code>dns.wibufy.biz.id</code> tanpa ada notifikasi peringatan <em>&quot;Couldn&apos;t connect&quot;</em>.
          </div>
        </div>
      </section>

      {/* Section 3: Browser DoH */}
      <section id="browser-doh" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Globe className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            3. Cara Menggunakan DoH di Browser Web
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          DNS-over-HTTPS (DoH) sangat cocok untuk peramban web pada komputer kantor atau laptop tanpa memerlukan hak akses Administrator sistem operasi.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1 font-mono">
            Endpoint DoH WibufyDNS (RFC 8484)
          </span>
          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
            <code className="font-mono text-xs sm:text-sm font-semibold text-slate-900 break-all">
              https://doh.wibufy.biz.id/dns-query
            </code>
            <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm">Google Chrome, Brave &amp; Microsoft Edge</h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
              <li>Buka <strong>Settings &gt; Privacy and Security</strong>.</li>
              <li>Pilih opsi <strong>Security</strong>.</li>
              <li>Gulir ke bagian <strong>Use secure DNS</strong>.</li>
              <li>Pilih <strong>With: Custom</strong>.</li>
              <li>Tempelkan URL: <code>https://doh.wibufy.biz.id/dns-query</code></li>
            </ol>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm">Mozilla Firefox</h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
              <li>Buka <strong>Settings &gt; Privacy &amp; Security</strong>.</li>
              <li>Gulir ke bawah ke bagian <strong>DNS over HTTPS</strong>.</li>
              <li>Pilih <strong>Increased Protection</strong> atau <strong>Max Protection</strong>.</li>
              <li>Pilih <strong>Custom</strong> pada menu Provider dan masukkan URL DoH WibufyDNS.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Section 4: Windows 11 */}
      <section id="windows-doh" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Monitor className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            4. Konfigurasi di Windows 11 (Encrypted DNS)
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Windows 11 memiliki fitur enkripsi DNS bawaan pada adapter jaringan:
        </p>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-700 leading-relaxed shadow-xs">
          <ol className="list-decimal pl-5 space-y-2 text-slate-600">
            <li>Buka <strong>Settings (Win + I) &gt; Network &amp; internet</strong>.</li>
            <li>Pilih jenis koneksi Anda (<strong>Wi-Fi</strong> atau <strong>Ethernet</strong>), lalu klik properti jaringan yang aktif.</li>
            <li>Cari bagian <strong>DNS server assignment</strong> lalu klik <strong>Edit</strong>.</li>
            <li>Ubah dari <em>Automatic (DHCP)</em> ke <strong>Manual</strong> dan aktifkan tombol <strong>IPv4</strong>.</li>
            <li>Pada kolom <em>DNS encryption</em>, pilih <strong>Encrypted only (DNS over HTTPS)</strong> jika didukung, atau gunakan browser DoH untuk konfigurasi yang fleksibel.</li>
          </ol>
        </div>
      </section>

      {/* Section 5: Apple iOS & macOS */}
      <section id="ios-macos" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Apple className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            5. Konfigurasi di Apple iOS &amp; macOS
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pada iOS 14+ dan macOS Big Sur ke atas, Apple mendukung protokol DoH dan DoT melalui format profil konfigurasi terenkripsi (<code>.mobileconfig</code>) atau aplikasi pembantu:
        </p>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-700 leading-relaxed shadow-xs">
          <p>
            <strong>Metode Rekomendasi:</strong> Gunakan aplikasi DNS manager terpercaya seperti <em>DNSecure</em> atau <em>AdGuard for iOS/macOS</em> dan masukkan endpoint DoT <code>dns.wibufy.biz.id</code> atau URL DoH:
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-slate-900 flex items-center justify-between">
            <span>https://doh.wibufy.biz.id/dns-query</span>
            <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
          </div>
        </div>
      </section>

      {/* Section 6: Router Setup */}
      <section id="router-setup" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <Network className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            6. Konfigurasi di Router Jaringan Lokal
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Untuk melindungi seluruh perangkat di rumah tanpa menyetel satu per satu, Anda dapat mengonfigurasi router (misal OpenWrt, MikroTik, pfSense):
        </p>
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-xs text-slate-700 leading-relaxed shadow-xs">
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>
              <strong>OpenWrt (Stubby / dnsmasq / AdGuard Home):</strong> Arahkan upstream TLS ke <code>dns.wibufy.biz.id:853</code>.
            </li>
            <li>
              <strong>Firewall WAN:</strong> Pastikan koneksi keluar TCP port 853 (DoT) dan TCP port 443 (DoH) diizinkan tanpa pemblokiran oleh provider internet (ISP) upstream.
            </li>
            <li>
              <strong>Waktu Router (NTP):</strong> Pastikan jam sistem router akurat agar validasi tanggal sertifikat TLS tidak gagal.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 7: Troubleshooting */}
      <section id="troubleshooting" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            7. Troubleshooting &amp; Solusi Kendala
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          {/* Issue 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Muncul pesan &quot;Couldn&apos;t connect&quot; atau koneksi internet mati di Android</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Penyebab:</strong> Port 853 diblokir oleh router Wi-Fi lokal (sering terjadi pada jaringan Wi-Fi kantor, kampus, atau kafe), atau terjadi kesalahan pengetikan nama host.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Solusi:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Pastikan hostname ditulis tepat: <code>dns.wibufy.biz.id</code> (tanpa spasi dan tanpa https://).</li>
              <li>Jika berada di jaringan Wi-Fi yang memblokir port 853, ubah Private DNS ke mode <em>Automatic</em> atau <em>Off</em> sementara, dan gunakan mode <strong>DoH (port 443)</strong> di browser.</li>
            </ul>
          </div>

          {/* Issue 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Halaman Login Wi-Fi Publik (Captive Portal) tidak mau muncul</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              <strong>Penyebab:</strong> Hotspot hotel, bandara, atau kafe memerlukan intersepsi DNS lokal untuk mengarahkan pengguna ke halaman login/persetujuan sebelum akses internet dibuka.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Solusi:</strong> Matikan sementara Private DNS pada perangkat Anda hingga proses login Wi-Fi berhasil, kemudian aktifkan kembali <code>dns.wibufy.biz.id</code>.
            </p>
          </div>

          {/* Issue 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Aplikasi tertentu mengalami kendala koneksi</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Sebagian kecil aplikasi keuangan atau game memiliki modul telemetri yang menganggap penolakan domain pelacak sebagai kegagalan jaringan. Laporkan nama domain terkait agar dapat ditinjau pengecualian yang aman.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: FAQ */}
      <section id="faq" className="space-y-4 pt-6 border-t border-slate-200 scroll-mt-20">
        <div className="flex items-center gap-2 text-blue-600">
          <HelpCircle className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            8. Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              Mengapa sebagian iklan di YouTube dan feed media sosial masih muncul?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              DNS hanya memproses resolusi nama domain (seperti <code>googlevideo.com</code>). Pada platform video seperti YouTube, video konten utama dan iklan dikirim dari klaster server dan CDN yang sama persis. Jika domain tersebut diblokir pada tingkat DNS, maka video konten utama pun ikut rusak. Pemblokiran iklan semacam itu membutuhkan inspeksi konten (ekstensi browser seperti uBlock Origin), bukan resolusi DNS.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              Apakah WibufyDNS mempercepat kuota atau bandwidth internet saya?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              DNS tidak menaikkan batas kapasitas bandwidth langganan internet Anda. Namun, dengan dicegahnya ratusan permintaan ke domain pelacak dan skrip analitik eksternal, halaman dapat dimuat lebih efisien dan penggunaan data menjadi lebih hemat.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-xs">
            <h4 className="font-semibold text-slate-900 text-sm">
              Bagaimana cara menguji apakah WibufyDNS sudah aktif di perangkat saya?
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Buka situs pengujian adblocker seperti <code>adblock-tester.com</code>. Jika skor proteksi meningkat dan banner iklan di situs berita berkurang, berarti WibufyDNS telah aktif pada koneksi perangkat Anda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
