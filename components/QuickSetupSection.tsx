'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Smartphone, Globe, Monitor, Apple, Network, ArrowRight } from 'lucide-react';
import { CopyButton } from './CopyButton';

type PlatformTab = 'android' | 'browser' | 'windows' | 'apple' | 'router';

export function QuickSetupSection() {
  const [activeTab, setActiveTab] = useState<PlatformTab>('android');

  return (
    <section id="quick-setup" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            Konfigurasi Klien
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Mulai Pakai WibufyDNS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pilih metode konfigurasi sesuai sistem operasi atau peramban yang Anda gunakan.
          </p>
        </div>

        <Link
          href="/docs"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 shrink-0"
        >
          <span>Dokumentasi lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Segmented Platform Selector Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('android')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'android'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android (DoT)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('browser')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'browser'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Browser Web (DoH)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('windows')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'windows'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Windows 11</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('apple')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'apple'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>Apple iOS &amp; macOS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('router')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'router'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Router Jaringan</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 min-[375px]:p-6 sm:p-8 shadow-xs">
        {/* Android Tab */}
        {activeTab === 'android' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-blue-600">DNS-over-TLS · Port 853</span>
                <h3 className="text-lg font-semibold text-slate-900">Android Private DNS</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mendukung Android 9 (Pie) ke atas secara native tanpa memerlukan aplikasi tambahan.
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <code className="text-xs sm:text-sm font-mono font-semibold text-slate-900">
                  dns.wibufy.biz.id
                </code>
                <CopyButton text="dns.wibufy.biz.id" label="Salin Hostname" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-blue-600 font-mono font-semibold block text-[11px]">LANGKAH 01</span>
                <h4 className="font-semibold text-slate-900 text-sm">Buka Pengaturan</h4>
                <p className="text-slate-600 leading-relaxed">
                  Buka aplikasi <strong>Pengaturan</strong> &gt; pilih <strong>Koneksi &amp; Berbagi</strong> atau <strong>Jaringan &amp; Internet</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-blue-600 font-mono font-semibold block text-[11px]">LANGKAH 02</span>
                <h4 className="font-semibold text-slate-900 text-sm">Pilih Private DNS</h4>
                <p className="text-slate-600 leading-relaxed">
                  Pilih opsi <strong>DNS Pribadi (Private DNS)</strong> &gt; ubah ke <strong>Hostname Penyedia DNS Pribadi</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-blue-600 font-mono font-semibold block text-[11px]">LANGKAH 03</span>
                <h4 className="font-semibold text-slate-900 text-sm">Masukkan &amp; Simpan</h4>
                <p className="text-slate-600 leading-relaxed">
                  Ketik <code>dns.wibufy.biz.id</code> lalu tekan <strong>Simpan</strong>. Kueri DNS di perangkat Anda akan otomatis terenkripsi.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                Jika muncul pesan &quot;Couldn&apos;t connect&quot;, periksa apakah firewall Wi-Fi memblokir port 853.
              </span>
              <Link
                href="/docs#android-dot"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>Panduan troubleshooting Android</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Browser Tab */}
        {activeTab === 'browser' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-blue-600">DNS-over-HTTPS · Port 443</span>
                <h3 className="text-lg font-semibold text-slate-900">Browser Web (Chrome / Brave / Edge / Firefox)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Membungkus kueri DNS di port HTTPS standar, cocok untuk laptop atau komputer kantor.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <code className="text-xs font-mono font-semibold text-slate-900 max-w-[220px] sm:max-w-none truncate">
                  https://doh.wibufy.biz.id/dns-query
                </code>
                <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">Google Chrome, Brave &amp; Microsoft Edge</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Buka <strong>Settings</strong> &gt; <strong>Privacy and Security</strong>.</li>
                  <li>Pilih menu <strong>Security</strong> &gt; gulir ke <strong>Use secure DNS</strong>.</li>
                  <li>Aktifkan opsi, pilih <strong>With: Custom</strong>.</li>
                  <li>Tempelkan URL: <code>https://doh.wibufy.biz.id/dns-query</code></li>
                </ol>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-900 text-sm">Mozilla Firefox</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Buka <strong>Settings</strong> &gt; <strong>Privacy &amp; Security</strong>.</li>
                  <li>Gulir ke bawah ke bagian <strong>DNS over HTTPS</strong>.</li>
                  <li>Pilih <strong>Increased Protection</strong> atau <strong>Max Protection</strong>.</li>
                  <li>Pilih <strong>Custom</strong> pada menu Provider dan masukkan URL DoH WibufyDNS.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">Tidak membutuhkan hak akses Administrator sistem.</span>
              <Link
                href="/docs#browser-doh"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>Detail panduan Browser</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Windows 11 Tab */}
        {activeTab === 'windows' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-blue-600">Windows 11 Built-in DoH</span>
                <h3 className="text-lg font-semibold text-slate-900">Windows 11 Encrypted DNS</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dukungan enkripsi DNS native pada pengaturan adapter jaringan Windows 11.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <code className="text-xs font-mono text-slate-900 font-semibold">https://doh.wibufy.biz.id/dns-query</code>
                <CopyButton text="https://doh.wibufy.biz.id/dns-query" label="Salin URL" />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p className="text-slate-700">
                Windows 11 mendukung DoH secara terintegrasi pada menu Adapter Properties:
              </p>
              <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                <li>Buka <strong>Settings (Win + I)</strong> &gt; pilih <strong>Network &amp; internet</strong>.</li>
                <li>Klik pada koneksi aktif Anda (<strong>Wi-Fi</strong> atau <strong>Ethernet</strong>).</li>
                <li>Cari kolom <strong>DNS server assignment</strong> lalu klik <strong>Edit</strong>.</li>
                <li>Ubah ke <strong>Manual</strong> &gt; aktifkan <strong>IPv4</strong> &gt; pilih <strong>Encrypted only (DNS over HTTPS)</strong>.</li>
              </ol>
            </div>

            <div className="pt-2 flex items-center justify-end text-xs">
              <Link
                href="/docs#windows-doh"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>Lihat petunjuk lengkap Windows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Apple iOS & macOS Tab */}
        {activeTab === 'apple' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-blue-600">iOS 14+ &amp; macOS Big Sur+</span>
                <h3 className="text-lg font-semibold text-slate-900">Apple iOS &amp; macOS</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dukungan profil enkripsi DNS (MobileConfig) atau melalui aplikasi DNS manager.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <code className="text-xs font-mono text-slate-900 font-semibold">dns.wibufy.biz.id</code>
                <CopyButton text="dns.wibufy.biz.id" label="Salin DoT Hostname" />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                Sistem operasi Apple memerlukan aplikasi pembantu atau profil konfigurasi untuk mengaktifkan DNS terenkripsi di seluruh sistem:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Aplikasi DNS Manager:</strong> Gunakan aplikasi tepercaya seperti <em>DNSecure</em> atau <em>AdGuard for iOS/macOS</em> dan masukkan endpoint DoT <code>dns.wibufy.biz.id</code> atau DoH <code>https://doh.wibufy.biz.id/dns-query</code>.
                </li>
                <li>
                  <strong>Browser Mac:</strong> Anda juga dapat mengaktifkan DoH langsung pada pengaturan browser Firefox atau Chrome di Mac tanpa konfigurasi sistem operasi.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end text-xs">
              <Link
                href="/docs#ios-macos"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>Lihat petunjuk lengkap Apple</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Router Tab */}
        {activeTab === 'router' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-medium text-blue-600">OpenWrt / pfSense / MikroTik</span>
                <h3 className="text-lg font-semibold text-slate-900">Router Jaringan Lokal</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enkripsi DNS untuk seluruh perangkat di jaringan lokal melalui router.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 shrink-0">
                <code className="text-xs font-mono text-slate-900 font-semibold">dns.wibufy.biz.id:853</code>
                <CopyButton text="dns.wibufy.biz.id" label="Salin Hostname" />
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                Untuk konfigurasi router jaringan (OpenWrt dengan Stubby/dnsmasq atau MikroTik RouterOS):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Pastikan router mengizinkan koneksi keluar pada <strong>TCP port 853</strong> (DoT) atau <strong>port 443</strong> (DoH).</li>
                <li>Sertakan bundel CA certificate publik pada router agar handshake TLS dapat diverifikasi dengan valid.</li>
                <li>Disarankan mengaktifkan cache lokal pada router untuk meminimalkan latensi kueri berulang.</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-end text-xs">
              <Link
                href="/docs#router-setup"
                className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
              >
                <span>Lihat panduan router</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
