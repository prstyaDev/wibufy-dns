'use client';

import Link from 'next/link';
import { ShieldCheck, Activity } from 'lucide-react';
import { useSystemStatus } from './StatusProvider';
import { StatusIndicator } from './StatusIndicator';

export function Footer() {
  const { status, lastChecked, hasData, isStale } = useSystemStatus();

  const formattedTime = !hasData
    ? 'Pemeriksaan belum tersedia'
    : isStale
    ? lastChecked
      ? `${new Date(lastChecked).toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })} WIB (Kedaluwarsa)`
      : 'Data kedaluwarsa'
    : lastChecked
    ? `${new Date(lastChecked).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })} WIB`
    : 'Pemeriksaan belum tersedia';

  const footerStatus = !hasData ? 'unknown' : isStale ? 'stale' : status;
  const footerLabel = !hasData
    ? 'Belum Tersedia'
    : isStale
    ? 'Kedaluwarsa'
    : status === 'operational'
    ? 'Operasional'
    : status === 'degraded'
    ? 'Degradasi'
    : 'Gangguan';

  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 mt-20 text-slate-600 text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About & Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-900 tracking-tight">
                Wibufy<span className="text-blue-600">DNS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Layanan resolver DNS terenkripsi (DNS-over-TLS &amp; DNS-over-HTTPS) berbasis AdGuard Home dengan penyaringan domain iklan, pelacak telemetri, dan situs berbahaya.
            </p>

            {/* Synchronized status display in footer */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium">Status Sistem:</span>
              </div>
              <StatusIndicator
                status={footerStatus}
                size="sm"
                customLabel={footerLabel}
              />
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Halaman</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Dashboard Status Layanan
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-blue-600 transition-colors">
                  Panduan Konfigurasi (Docs)
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="hover:text-blue-600 transition-colors">
                  Changelog &amp; Riwayat Layanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Protocol Endpoints */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Endpoint Publik</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Private DNS (DoT 853):</span>
                <code className="text-slate-800 font-mono text-xs font-medium select-all">dns.wibufy.biz.id</code>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Secure DNS (DoH 443):</span>
                <code className="text-slate-800 font-mono text-[11px] break-all select-all">
                  https://doh.wibufy.biz.id/dns-query
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} WibufyDNS. Dikelola oleh prstyaDev.</p>
          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
            <span>RFC 7858 (DoT)</span>
            <span aria-hidden="true">·</span>
            <span>RFC 8484 (DoH)</span>
            <span aria-hidden="true">·</span>
            <span>AdGuard Home Filtering</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
