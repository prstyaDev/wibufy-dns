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
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';

export const metadata: Metadata = {
  title: 'Dokumentasi Teknis & Panduan Lanjutan — WibufyDNS',
  description:
    'Referensi teknis WibufyDNS: spesifikasi protokol DoT & DoH, integrasi parameter lanjutan Android, Windows 11, Apple, router jaringan, serta solusi kendala.',
  openGraph: {
    title: 'Dokumentasi Teknis & Panduan Lanjutan — WibufyDNS',
    description:
      'Referensi teknis WibufyDNS: spesifikasi protokol DoT & DoH, integrasi parameter lanjutan Android, Windows 11, Apple, router jaringan, serta solusi kendala.',
    type: 'article',
  },
};

const DOCS_NAV_ITEMS = [
  { id: 'tentang-wibufy', label: '1. Mengenal WibufyDNS', icon: Lock },
  { id: 'android-dot', label: '2. Private DNS di Android (DoT)', icon: Smartphone },
  { id: 'browser-doh', label: '3. Konfigurasi DoH di Browser', icon: Globe },
  { id: 'windows-doh', label: '4. Windows 11 Encrypted DNS', icon: Monitor },
  { id: 'ios-macos', label: '5. Apple iOS & macOS', icon: Apple },
  { id: 'router-setup', label: '6. Konfigurasi Router Jaringan', icon: Network },
  { id: 'troubleshooting', label: '7. Troubleshooting & Kendala', icon: AlertTriangle },
  { id: 'faq', label: '8. Pertanyaan Umum (FAQ)', icon: HelpCircle },
];

export default function DocsPage() {
  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Header */}
      <header className="space-y-3 border-b border-slate-200 pb-8 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Link href="/" className="hover:underline">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Dokumentasi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Dokumentasi Teknis &amp; Panduan Lanjutan
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Referensi teknis, spesifikasi transport, parameter integrasi mendalam, dan panduan troubleshooting resolver WibufyDNS. Panduan ringkas awal tersedia pada beranda utama.
        </p>
      </header>

      {/* Main Grid: Content + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 lg:gap-12 items-start">
        {/* Main Content Column */}
        <div className="space-y-12 min-w-0">
          {/* Mobile Quick Navigation Box (Hidden on lg because sticky sidebar is visible) */}
          <div className="lg:hidden bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs space-y-3">
            <span className="font-semibold text-slate-900 uppercase tracking-wider block font-mono text-[11px]">
              Daftar Isi Dokumentasi
            </span>
            <nav aria-label="Daftar Isi Mobile" className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-blue-600">
              {DOCS_NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="hover:underline flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <item.icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Section 1: Mengenal WibufyDNS */}
          <section id="tentang-wibufy" className="space-y-4 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Lock className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                1. Mengenal WibufyDNS
              </h2>
            </div>
            
            <div className="text-sm text-slate-600 space-y-3.5 leading-relaxed">
              <p>
                Kueri DNS konvensional (port 53 UDP/TCP) dikirim dalam format teks terbuka (plaintext). Hal ini memungkinkan penyedia jasa internet (ISP), operator Wi-Fi publik, atau penyerang man-in-the-middle menyadap daftar domain yang Anda kunjungi serta melakukan pembelokan rute (DNS spoofing/hijacking).
              </p>
              <p>
                <strong>WibufyDNS</strong> adalah layanan recursive DNS resolver yang mengamankan lalu lintas resolusi nama host melalui dua standar enkripsi transport resmi:
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-blue-600">RFC 7858 · DoT</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600 text-[10px]">
                    Port 853 TCP
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">DNS-over-TLS</h3>
                <p className="text-slate-600 leading-relaxed">
                  Membungkus kueri DNS dalam koneksi TLS 1.3 murni pada port 853. Protokol ini dioptimalkan untuk perlindungan sistem operasi tingkat perangkat seperti Android Private DNS.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Cipher: TLS_AES_128_GCM</span>
                  <span>Port 853</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-blue-600">RFC 8484 · DoH</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600 text-[10px]">
                    Port 443 TCP
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">DNS-over-HTTPS (HTTP/2)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Mengenkapsulasi format pesan DNS (<code>application/dns-message</code>) ke dalam aliran HTTPS port 443. Menggunakan negosiasi ALPN HTTP/2 untuk multiplexing kueri simultan tanpa hambatan firewall lokal.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Protokol: ALPN h2</span>
                  <span>Port 443</span>
                </div>
              </div>
            </div>

            {/* Architecture note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Engine Penyaringan &amp; Mekanisme Sinkhole</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Di backend, WibufyDNS ditenagai oleh engine AdGuard Home. Domain yang teridentifikasi sebagai iklan, skrip telemetri pelacak, atau malware akan dicegat di tingkat resolusi dengan mengembalikan respons null address (<code>0.0.0.0</code> untuk IPv4 dan <code>::</code> untuk IPv6) atau <code>NXDOMAIN</code>. Hal ini menghentikan koneksi data sebelum perangkat Anda mengunduh muatan iklan atau skrip pelacak.
              </p>
            </div>
          </section>

          {/* Section 2: Android Private DNS */}
          <section id="android-dot" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Smartphone className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                2. Private DNS di Android (DoT)
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Android 9 (Pie) ke atas menyediakan fitur sistem bawaan bernama <em>Private DNS</em> berbasis standar DNS-over-TLS (RFC 7858). Fitur ini beroperasi secara sistemik, melindungi kueri DNS dari seluruh aplikasi (termasuk aplikasi latar belakang dan game), baik saat tersambung ke jaringan Wi-Fi maupun Data Seluler.
            </p>

            {/* Endpoint Reference Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                Hostname Private DNS WibufyDNS
              </span>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <code className="font-mono text-sm font-semibold text-slate-900">
                  dns.wibufy.biz.id
                </code>
                <CopyButton text="dns.wibufy.biz.id" label="Salin Hostname" />
              </div>
            </div>

            {/* Technical Detail Cards */}
            <div className="space-y-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Cara Kerja &amp; Validasi Strict Profile di Android
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Ketika Anda mengaktifkan opsi <em>Hostname penyedia DNS pribadi</em>, Android menggunakan mode Strict DoT: sistem mula-mula mengirim kueri resolusi bootstrap untuk mencari alamat IP server <code>dns.wibufy.biz.id</code>, kemudian memverifikasi sertifikat TLS server terhadap root certificate store Android. Setelah valid, seluruh koneksi DNS dikunci secara eksklusif melalui port 853 TLS.
                </p>
                <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-lg text-blue-900 space-y-1">
                  <p className="font-medium">Ketentuan Format Input:</p>
                  <p className="text-slate-600">
                    Masukkan hanya nama host bersih (FQDN): <code>dns.wibufy.biz.id</code>. Jangan menambahkan awalan protokol seperti <code>https://</code> atau <code>tls://</code>, dan jangan menambahkan nomor port (<code>:853</code>). Android tidak menerima alamat IP numerik pada kolom Private DNS.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Lokasi Menu pada Berbagai Antarmuka Produsen (OEM)
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Google Pixel / Motorola / Stock Android:</strong> Pengaturan &gt; Jaringan &amp; internet &gt; DNS Pribadi.
                  </li>
                  <li>
                    <strong>Samsung One UI:</strong> Pengaturan &gt; Koneksi &gt; Pengaturan koneksi lainnya &gt; DNS Pribadi.
                  </li>
                  <li>
                    <strong>Xiaomi MIUI / HyperOS:</strong> Pengaturan &gt; Koneksi &amp; berbagi &gt; DNS Pribadi.
                  </li>
                  <li>
                    <strong>OPPO / Realme (ColorOS / Realme UI):</strong> Pengaturan &gt; Sambungan &amp; berbagi &gt; DNS Pribadi.
                  </li>
                  <li>
                    <strong>Vivo (Funtouch OS):</strong> Pengaturan &gt; Jaringan &amp; internet &gt; DNS Pribadi.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Browser DoH */}
          <section id="browser-doh" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Globe className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                3. Konfigurasi DoH di Browser Web
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              DNS-over-HTTPS (RFC 8484) mengisolasi lalu lintas DNS langsung di dalam peramban web tanpa memerlukan hak akses Administrator pada komputer kerja atau laptop. Karena kueri DoH berjalan melalui port standar HTTPS (443), protokol ini sangat tahan terhadap pemblokiran port yang sering diterapkan pada jaringan kantor atau hotspot umum.
            </p>

            {/* Endpoint Reference Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                  URL Endpoint DoH (RFC 8484)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 font-mono text-blue-700 text-[10px] font-semibold">
                  HTTP/2 Terverifikasi
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <code className="font-mono text-xs sm:text-sm font-semibold text-slate-900 break-all">
                  https://doh.wibufy.biz.id/dns-query
                </code>
                <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
              </div>
            </div>

            {/* Advanced Configuration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Chromium (Chrome, Brave, Edge, Vivaldi)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Pada menu <em>Privacy and Security &gt; Security &gt; Use secure DNS</em>, pilih opsi <strong>With: Custom</strong> dan tempelkan URL DoH di atas.
                </p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1">
                  <span className="font-medium text-slate-900 block">Diagnostik Internal:</span>
                  <p>
                    Buka alamat internal <code>chrome://net-internals/#dns</code> untuk memantau status Secure DNS resolver serta tombol <em>Clear host cache</em> jika ingin mereset cache lokal browser.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Mozilla Firefox (Mode Proteksi)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Firefox menyediakan dua tingkat proteksi DoH pada menu <em>Privacy &amp; Security &gt; DNS over HTTPS</em>:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                  <li>
                    <strong>Increased Protection:</strong> Mengutamakan kueri via DoH WibufyDNS, namun otomatis beralih ke DNS default jika terjadi kendala jaringan sementara.
                  </li>
                  <li>
                    <strong>Max Protection:</strong> Kueri hanya dikirim melalui DoH. Jika koneksi DoH gagal, browser tidak akan membocorkan kueri ke DNS plaintext ISP.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Windows 11 */}
          <section id="windows-doh" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Monitor className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                4. Konfigurasi di Windows 11 (Encrypted DNS)
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Windows 11 menyertakan dukungan native untuk DNS-over-HTTPS. Namun, antarmuka grafis (GUI) Windows 11 secara default hanya mengizinkan pemilihan mode <em>Encrypted only (DNS over HTTPS)</em> untuk daftar IP resolver publik yang sudah memiliki template bawaan di sistem operasi.
            </p>

            {/* Practical Recommendation Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs text-xs">
              <h3 className="font-semibold text-slate-900 text-sm">
                Opsi 1: Melalui Browser Web atau Utility DNS (Rekomendasi Paling Praktis)
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Bagi sebagian besar pengguna Windows, metode termudah dan paling stabil adalah mengaktifkan Secure DNS langsung di peramban web (Chrome/Firefox/Edge), atau menggunakan klien DNS desktop open-source seperti <strong>YogaDNS</strong>, <strong>Simple DNSCrypt</strong>, atau <strong>AdGuard for Windows</strong> dengan memasukkan endpoint DoH:
              </p>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-slate-900 flex items-center justify-between">
                <span>https://doh.wibufy.biz.id/dns-query</span>
                <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
              </div>
            </div>

            {/* Native CLI Registration Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs text-xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Opsi 2: Pendaftaran Template Native Windows 11 via Terminal</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Jika Anda ingin mengaktifkan DoH native pada level adapter kartu jaringan Windows 11, daftarkan template DoH WibufyDNS ke tabel DNS Client menggunakan Command Prompt (jalankan sebagai <em>Administrator</em>):
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs overflow-x-auto space-y-1">
                <div className="text-slate-400"># Daftarkan template DoH untuk IP resolver</div>
                <code>netsh dns add encryption server=103.186.0.0 dohtemplate=&quot;https://doh.wibufy.biz.id/dns-query&quot; autoupgrade=yes udpfallback=no</code>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Setelah template terdaftar, buka <em>Settings &gt; Network &amp; internet &gt; Properties Adapter &gt; DNS server assignment (Edit)</em>, lalu pilih opsi <strong>Encrypted only (DNS over HTTPS)</strong>.
              </p>
            </div>
          </section>

          {/* Section 5: Apple iOS & macOS */}
          <section id="ios-macos" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Apple className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                5. Konfigurasi di Apple iOS &amp; macOS
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Mulai dari iOS 14, iPadOS 14, dan macOS 11 (Big Sur), ekosistem Apple mendukung standar DNS-over-HTTPS dan DNS-over-TLS secara native melalui framework <code>NetworkExtension</code>. Pengaturan ini dapat diterapkan tanpa memerlukan VPN server perantara yang menghabiskan daya baterai.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Metode 1: Aplikasi DNS Manager (DNSecure / AdGuard)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Aplikasi open-source seperti <strong>DNSecure</strong> (tersedia di App Store) bertindak sebagai antarmuka konfigurasi untuk mendaftarkan resolver ke sistem operasi Apple.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                  <li>Buka DNSecure, pilih protokol <strong>DoT</strong> atau <strong>DoH</strong>.</li>
                  <li>Masukkan Hostname: <code>dns.wibufy.biz.id</code> atau URL DoH <code>https://doh.wibufy.biz.id/dns-query</code>.</li>
                  <li>Aktifkan profil di menu <em>Settings &gt; VPN &amp; Device Management &gt; DNS</em>.</li>
                </ul>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Metode 2: Profil Konfigurasi (.mobileconfig)
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Apple mengizinkan instalasi profil konfigurasi bertipe <code>com.apple.dnsSettings.managed</code>. Profil ini langsung dikelola oleh kernel sistem operasi tanpa aplikasi pihak ketiga yang berjalan di latar belakang.
                </p>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                  <span className="font-medium text-slate-900 block mb-0.5">Catatan iCloud Private Relay:</span>
                  Jika Anda menggunakan fitur iCloud Private Relay di Safari, kueri penelusuran Safari akan diprioritaskan melalui relai ganda Apple, sementara aplikasi lain di perangkat Anda tetap menggunakan WibufyDNS.
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Router Setup */}
          <section id="router-setup" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <Network className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                6. Konfigurasi di Router Jaringan Lokal
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Konfigurasi di tingkat router memungkinkan seluruh perangkat di rumah atau kantor (termasuk smart TV, perangkat IoT, dan gawai tamu) mendapatkan perlindungan DNS terenkripsi secara otomatis tanpa konfigurasi individual per perangkat.
            </p>

            {/* Router Syntax Matrix */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs text-xs">
              <h3 className="font-semibold text-slate-900 text-sm">
                Sintaks Upstream untuk Perangkat Router Populer
              </h3>

              <div className="space-y-3 font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-sans font-medium uppercase tracking-wider">
                    AdGuard Home / CoreDNS / dnsmasq (Upstream Server):
                  </div>
                  <div className="text-slate-900 font-semibold select-all">
                    tls://dns.wibufy.biz.id
                  </div>
                  <div className="text-slate-600 select-all">
                    https://doh.wibufy.biz.id/dns-query
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-sans font-medium uppercase tracking-wider">
                    MikroTik RouterOS v7+ (DoH CLI):
                  </div>
                  <div className="text-slate-900 select-all overflow-x-auto whitespace-pre">
                    /ip dns set use-doh-server=&quot;https://doh.wibufy.biz.id/dns-query&quot; verify-doh-cert=yes
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px] font-sans font-medium uppercase tracking-wider">
                    OpenWrt (https-dns-proxy / stubby):
                  </div>
                  <div className="text-slate-900 font-sans text-xs">
                    Gunakan paket <code>https-dns-proxy</code> pada port lokal 5053, lalu arahkan upstream <code>dnsmasq</code> router ke <code>127.0.0.1#5053</code>.
                  </div>
                </div>
              </div>

              {/* Critical Router Requirements */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-slate-600">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Persyaratan Krusial: Sinkronisasi Waktu (NTP)</span>
                </div>
                <p className="leading-relaxed">
                  Enkripsi TLS mewajibkan jam sistem router akurat saat memverifikasi tanggal sertifikat SSL/TLS. Jika router me-reboot dan jam sistem kembali ke 1 Januari 1970 karena kendala NTP, validasi sertifikat DoT/DoH akan gagal dan koneksi terputus. Pastikan service <strong>NTP Client</strong> di router Anda aktif mengarah ke server waktu publik (seperti <code>pool.ntp.org</code>).
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Troubleshooting */}
          <section id="troubleshooting" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-amber-600 border-b border-slate-200/80 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                7. Troubleshooting &amp; Solusi Kendala
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Panduan pemecahan masalah teknis yang sering ditemui saat mengoperasikan DNS terenkripsi pada jaringan yang memiliki pembatasan khusus.
            </p>

            <div className="space-y-4 text-xs">
              {/* Issue 1: Couldn't connect Android */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>Muncul pesan &quot;Couldn&apos;t connect&quot; atau koneksi mati di Android</span>
                </h3>
                <div className="text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>Penyebab:</strong> Jaringan Wi-Fi lokal (terutama di kantor, kafe, atau institusi publik) sering memblokir port outbound 853 (DoT). Penyebab lain adalah kesalahan pengetikan karakter nama host.
                  </p>
                  <p><strong>Langkah Pemulihan:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Periksa kembali ejaan: harus tepat <code>dns.wibufy.biz.id</code> (tanpa spasi dan tanpa tanda kutip).</li>
                    <li>Jika port 853 terblokir oleh firewall Wi-Fi, ubah Private DNS ke <em>Otomatis</em> sementara, lalu gunakan mode <strong>DoH (port 443)</strong> di peramban web Anda. Port 443 HTTPS hampir selalu diizinkan di semua jaringan.</li>
                  </ol>
                </div>
              </div>

              {/* Issue 2: Captive portal */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Halaman Login Wi-Fi Publik (Captive Portal) tidak mau terbuka</span>
                </h3>
                <div className="text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    <strong>Penyebab:</strong> Hotspot hotel, bandara, dan kafe umumnya membajak kueri DNS plaintext lokal untuk mengalihkan peramban ke halaman login persetujuan syarat &amp; ketentuan. Standar DoT yang ketat menolak manipulasi rute ini demi keamanan Anda.
                  </p>
                  <p>
                    <strong>Solusi:</strong> Matikan sementara Private DNS pada menu pengaturan ponsel. Buka peramban untuk menyelesaikan login captive portal. Begitu akses internet terbuka, aktifkan kembali WibufyDNS.
                  </p>
                </div>
              </div>

              {/* Issue 3: False positives & Apps */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span>Aplikasi perbankan, e-commerce, atau link referral gagal dimuat</span>
                </h3>
                <div className="text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    Tautan bersponsor atau tautan afiliasi pada aplikasi belanja daring sering kali melewati domain perantara pihak ketiga (seperti redirect tracker) yang termasuk dalam daftar blokir filter privasi.
                  </p>
                  <p>
                    Jika Anda menemukan domain fungsional yang keliru diblokir (false positive), Anda dapat melaporkan nama domain tersebut secara transparan melalui repositori GitHub agar aturan whitelist dapat disesuaikan.
                  </p>
                </div>
              </div>

              {/* Issue 4: DNS Leak Testing */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cara Memverifikasi DNS Leak (Uji Kebocoran DNS)</span>
                </h3>
                <div className="text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    Untuk memastikan perangkat Anda tidak membocorkan kueri ke resolver plaintext bawaan penyedia internet:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Buka situs uji pihak ketiga independen seperti <code>dnsleaktest.com</code>.</li>
                    <li>Jalankan <strong>Standard Test</strong>.</li>
                    <li>Jika hasil pengujian tidak lagi mencantumkan ISP lokal Anda dan kueri terarah ke upstream WibufyDNS, maka enkripsi DNS Anda telah aktif secara paripurna.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: FAQ */}
          <section id="faq" className="space-y-4 pt-8 border-t border-slate-200 scroll-mt-24">
            <div className="flex items-center gap-2 text-blue-600 border-b border-slate-200/80 pb-3">
              <HelpCircle className="w-5 h-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                8. Pertanyaan Umum (FAQ) &amp; Batasan Teknis
              </h2>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Mengapa sebagian iklan di YouTube dan media sosial masih muncul?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  DNS resolver memproses filter pada tingkat nama host (domain). Pada platform video modern seperti YouTube atau feed media sosial, video konten utama dan klip iklan dikirim dari klaster server dan CDN yang identik (misalnya domain <code>googlevideo.com</code>). Memblokir domain tersebut di level DNS akan merusak fungsi pemutaran video secara keseluruhan. Pemblokiran iklan in-stream semacam itu membutuhkan ekstensi peramban berbasis inspeksi dokumen DOM (seperti uBlock Origin), bukan filter DNS.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Apa perbedaan mendasar antara WibufyDNS dan layanan VPN?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  DNS terenkripsi mengamankan proses translasi alamat domain ke alamat IP dan menyaring domain pelacak, tetapi <strong>tidak</strong> mengubah alamat IP publik Anda ataupun mengenkripsi muatan data konten (payload). Sebaliknya, VPN mengenkripsi seluruh muatan data jaringan dan merutekan seluruh koneksi internet melalui server perantara. WibufyDNS dan VPN dapat digunakan berdampingan.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Apakah WibufyDNS mencatat riwayat penelusuran (Logging Policy)?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  WibufyDNS beroperasi dengan prinsip minimisasi data. Kueri DNS diproses sementara di memori kerja (in-memory) untuk resolusi upstream dan pencocokan aturan filter. Kami tidak mencatat riwayat penelusuran pribadi atau mengaitkan data IP pengguna dengan profil identitas apa pun ke dalam basis data penyimpanan persisten.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Bagaimana cara melakukan benchmark atau pengujian latensi dari terminal?
                </h3>
                <div className="text-slate-600 space-y-2 leading-relaxed font-mono text-[11px]">
                  <p className="font-sans text-xs">Untuk menguji respons DoT secara langsung menggunakan utility <code>kdig</code>:</p>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto">
                    <code>kdig -d @dns.wibufy.biz.id:853 +tls example.com</code>
                  </div>
                  <p className="font-sans text-xs pt-1">Untuk menguji respons DoH binary wireformat menggunakan <code>curl</code>:</p>
                  <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto">
                    <code>curl -v -H &quot;accept: application/dns-message&quot; &quot;https://doh.wibufy.biz.id/dns-query?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB&quot;</code>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Transparency & Community Footer Link */}
          <footer className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p>
              Menemukan kendala teknis atau memiliki usulan konfigurasi tambahan?
            </p>
            <a
              href="https://github.com/prstyaDev/wibufy-dns"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1 shrink-0"
            >
              <span>GitHub Repository WibufyDNS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </footer>
        </div>

        {/* Sticky Table of Contents Sidebar (Desktop lg: Only) */}
        <aside className="hidden lg:block sticky top-24 self-start space-y-4 p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 uppercase tracking-wider text-[11px] font-mono border-b border-slate-200 pb-2">
            <span>Daftar Isi</span>
          </div>

          <nav aria-label="Navigasi Dokumentasi Desktop" className="space-y-1">
            {DOCS_NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-200/50 transition-colors"
              >
                <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 transition-colors" />
                <span className="truncate leading-snug">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-200/80 space-y-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 block font-mono text-[10px] uppercase">
              Endpoint Aktif
            </span>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="truncate text-slate-700 font-medium">DoT: dns.wibufy.biz.id</div>
              <div className="truncate text-slate-700 font-medium">DoH: doh.wibufy.biz.id</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
