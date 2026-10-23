'use client';

import { RefreshCw, Play, AlertCircle, Clock } from 'lucide-react';
import { TARGET_CONFIG } from '@/lib/dns/constants';
import { useSystemStatus } from './StatusProvider';
import { StatusIndicator } from './StatusIndicator';
import { ServiceCard } from './ServiceCard';

export function LiveCheckTrigger() {
  const {
    summary,
    status,
    lastChecked,
    isLoading,
    cooldown,
    errorMsg,
    hasData,
    isStale,
    runLiveProbe,
  } = useSystemStatus();

  const formattedLastChecked = lastChecked
    ? new Date(lastChecked).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB'
    : null;

  const dotLatency = summary?.dot?.latencyMs;
  const dohLatency = summary?.doh?.latencyMs;

  return (
    <div className="space-y-6">
      {/* Primary Technical Status Summary Card */}
      <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div className="space-y-2.5">
            {/* Unboxed Metadata (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Status Operasional</span>
              <span aria-hidden="true">·</span>
              <span>WibufyDNS Resolver</span>
              <span aria-hidden="true">·</span>
              <span>Backend AdGuard Home</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusIndicator
                status={!hasData ? 'unknown' : isStale ? 'stale' : status}
                size="lg"
                showIcon={true}
                customLabel={
                  !hasData
                    ? 'Pemeriksaan Belum Tersedia'
                    : isStale
                    ? 'Data Kedaluwarsa (Perlu Diperbarui)'
                    : summary?.overallText
                }
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {!hasData ? (
                'Sistem pemantauan aktif. Klik tombol di samping untuk memvalidasi respons jaringan DoT (port 853) dan DoH (port 443).'
              ) : isStale ? (
                'Catatan pemeriksaan terakhir telah melewati ambang batas waktu. Klik tombol periksa untuk mendapatkan status terbaru.'
              ) : (
                'Pemeriksaan menguji kueri DNS wire RFC 7858 (DoT) dan RFC 8484 (DoH) ke domain uji standar (example.com).'
              )}
            </p>
          </div>

          {/* Action Trigger Area */}
          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={runLiveProbe}
              disabled={isLoading || cooldown > 0}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isLoading || cooldown > 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Memeriksa Respons DNS...</span>
                </>
              ) : cooldown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>Jeda Cooldown {cooldown}s</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  <span>Periksa Status Sekarang</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-500 font-mono tabular-nums text-right">
              {formattedLastChecked ? (
                <span>Waktu Cek: {formattedLastChecked}</span>
              ) : (
                <span>Belum ada catatan waktu pemeriksaan</span>
              )}
            </div>
          </div>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-rose-900">Perhatian: </span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Telemetry Metric Strip */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5 border-t border-slate-200/80 text-xs">
          {/* Metric 1: DoT Latency */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Latensi DoT (853)</span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {dotLatency !== undefined ? `${dotLatency}` : '—'}
              </span>
              <span className="text-xs text-slate-500">ms</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Ambang normal: &lt; {TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS}ms
            </span>
          </div>

          {/* Metric 2: DoH Latency */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Latensi DoH (443)</span>
            <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
              <span className="text-base sm:text-lg font-bold text-slate-900">
                {dohLatency !== undefined ? `${dohLatency}` : '—'}
              </span>
              <span className="text-xs text-slate-500">ms</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Ambang normal: &lt; {TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS}ms
            </span>
          </div>

          {/* Metric 3: DNS Wire RCODE */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Hasil Kueri (RCODE)</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-base sm:text-lg font-bold text-emerald-700">
                {summary?.dot?.rcode || summary?.doh?.rcode || 'NOERROR'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Test domain: example.com</span>
          </div>

          {/* Metric 4: Storage Mode */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 block font-medium">Penyimpanan Audit</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {summary?.storageMode === 'supabase-postgres' ? 'Supabase PostgreSQL' : 'Pemeriksaan Langsung'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              {summary?.storageMode === 'supabase-postgres'
                ? 'Retensi log 30 hari aktif'
                : 'Pemeriksaan live memory'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of DoT & DoH cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ServiceCard
          title="DNS-over-TLS (DoT)"
          protocol="DNS-over-TLS (DoT)"
          endpoint="dns.wibufy.biz.id"
          port={853}
          description="Enkripsi kueri DNS langsung melalui TLS port 853 (RFC 7858). Merupakan standar resmi untuk fitur Private DNS pada sistem operasi Android."
          probeResult={summary?.dot}
          clientInstruction="Ketik hostname ini pada menu Private DNS di pengaturan jaringan perangkat Android."
          targetDeviceText="Android 9+, Linux systemd-resolved, Router"
        />

        <ServiceCard
          title="DNS-over-HTTPS (DoH)"
          protocol="DNS-over-HTTPS (DoH)"
          endpoint="https://doh.wibufy.biz.id/dns-query"
          port={443}
          description="Enkripsi kueri DNS di dalam saluran HTTPS port 443 (RFC 8484). Sangat cocok untuk peramban web modern tanpa dipengaruhi pemblokiran port khusus."
          probeResult={summary?.doh}
          clientInstruction="Salin URL ini ke menu Gunakan DNS Aman (Custom) di pengaturan browser Anda."
          targetDeviceText="Chrome, Firefox, Brave, Edge, iOS, Windows 11"
        />
      </div>
    </div>
  );
}
