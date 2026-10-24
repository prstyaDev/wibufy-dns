'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { ProbeLogEntry } from '@/lib/storage';
import { StatusIndicator } from './StatusIndicator';

export function RecentProbesHistory() {
  const [history, setHistory] = useState<ProbeLogEntry[]>([]);
  const [hasSupabase, setHasSupabase] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (Array.isArray(data.history)) {
            setHistory(data.history);
          }
          if (data.meta) {
            setHasSupabase(Boolean(data.meta.hasSupabase));
          }
        }
      } catch {
        // network error handled silently
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-4 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">
            Riwayat Audit
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Catatan Probe &amp; Riwayat Insiden
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Hasil pemeriksaan historis untuk memantau stabilitas dan anomali protokol secara transparan.
          </p>
        </div>

        <Link
          href="/changelog"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 shrink-0"
        >
          <span>Buka Changelog &amp; Riwayat Layanan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Memuat riwayat telemetri probe...
        </div>
      ) : history.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-mono">
                  <th className="py-3 px-4 font-semibold">Waktu (WIB)</th>
                  <th className="py-3 px-4 font-semibold">Protokol</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Kueri DNS / RTT</th>
                  <th className="py-3 px-4 font-semibold">Hasil Kueri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {new Date(log.checkedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZone: 'Asia/Jakarta',
                      })}{' '}
                      WIB
                    </td>
                    <td className="py-2.5 px-4 font-mono uppercase text-blue-700 font-medium">
                      {log.service === 'dot' ? 'DoT (853)' : 'DoH (443)'}
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusIndicator status={log.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-right whitespace-nowrap">
                      {log.dnsQueryLatencyMs !== undefined ? (
                        <>
                          <div className="font-semibold text-slate-900">
                            {log.dnsQueryLatencyMs} ms{' '}
                            <span className="text-[10px] text-slate-500 font-sans font-normal">kueri</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal font-mono">
                            TLS: {log.connectionLatencyMs ?? '—'}ms · Total: {log.latencyMs}ms
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium text-slate-900">
                            {log.latencyMs} ms{' '}
                            <span className="text-[10px] text-slate-400 font-sans font-normal">(total probe)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans font-normal">
                            Rincian kueri belum ada
                          </div>
                        </>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      {log.error ? (
                        <span className="text-rose-700" title={log.error}>
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">
                          {log.rcode || 'NOERROR'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500">
            <span>Menampilkan {history.length} catatan probe terakhir dari Supabase PostgreSQL.</span>
            <span>Retensi log aktif: 30 Hari</span>
          </div>
        </div>
      ) : (
        /* Transparent empty state when no historical database logs exist */
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sm:p-8 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center mx-auto border border-slate-200 shadow-xs">
            <Info className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">
              {hasSupabase === false
                ? 'Penyimpanan Riwayat Database Belum Dikonfigurasi'
                : 'Belum Ada Riwayat Insiden Tercatat'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {hasSupabase === false
                ? 'Pemeriksaan status saat ini berjalan secara live in-memory. Riwayat audit akan tersimpan otomatis saat DATABASE_URL Supabase dikonfigurasi.'
                : 'Tidak ada gangguan atau insiden operasional yang tercatat pada rentang pemeriksaan terkini.'}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-xs"
            >
              <span>Lihat Riwayat &amp; Pemeliharaan di Changelog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
