import { Shield, EyeOff, Lock, AlertTriangle, Layers } from 'lucide-react';

export function PrivacyProtectionSection() {
  return (
    <section className="space-y-6 pt-4">
      <div>
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
          Karakteristik & Batasan Teknis
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Privasi, Keamanan &amp; Batasan Resolusi DNS
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Penjelasan faktual mengenai proteksi yang disediakan oleh WibufyDNS serta batasan teknis yang berlaku pada resolusi tingkat DNS.
        </p>
      </div>

      {/* 4 Technical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Transport Encryption */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Lock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Enkripsi Saluran Kueri (DoT &amp; DoH)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Kueri DNS tradisional (port 53 UDP) dikirim dalam bentuk teks terbuka (plaintext). DoT dan DoH mengenkripsi jalur transmisi antara perangkat Anda dan server resolver WibufyDNS menggunakan TLS, mencegah pihak di jaringan lokal atau ISP melihat nama domain kueri saat transit.
          </p>
        </div>

        {/* Card 2: Filter List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Penyaringan Domain Sesuai Blocklist
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Resolver AdGuard Home menggunakan filter blocklist terkurasi untuk menolak resolusi domain iklan pop-up, tracker telemetri, dan situs berbahaya yang terdaftar. Permintaan ke domain yang diblokir akan dijawab dengan alamat loopback/NXDOMAIN.
          </p>
        </div>

        {/* Card 3: DNS vs VPN */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <EyeOff className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            DNS Terenkripsi Bukan Layanan VPN
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Enkripsi DNS hanya melindungi pencarian nama domain (resolusi nama ke IP). Setelah alamat IP didapatkan, pertukaran data web berjalan langsung antara perangkat Anda dan server tujuan. Alamat IP publik Anda tetap terlihat oleh situs web yang Anda kunjungi.
          </p>
        </div>

        {/* Card 4: Architecture */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2.5 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Pemisahan Website &amp; Server DNS
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Website status publik ini terpisah dari server resolver AdGuard Home. Pengukuran latensi dan ketersediaan dilakukan melalui probe wire sintetis independen ke domain uji (<code>example.com</code>) tanpa mengakses riwayat kueri pengguna.
          </p>
        </div>
      </div>

      {/* Ad-blocking reality callout */}
      <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-5 sm:p-6 text-slate-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-amber-900">
              Batasan Pemblokiran Iklan di Tingkat DNS
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Pemblokiran DNS tidak menjamin semua iklan bersih 100%. Iklan yang disajikan dari subdomain atau server video yang sama dengan konten utama (seperti iklan video YouTube, feed bersponsor di Instagram, atau TikTok) tidak dapat diblokir murni pada tingkat DNS tanpa memutus streaming konten utama itu sendiri.
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Untuk perlindungan lebih lanjut dari iklan video first-party pada browser desktop, Anda dapat mengombinasikan WibufyDNS dengan ekstensi browser seperti uBlock Origin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
