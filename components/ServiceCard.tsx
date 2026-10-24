'use client';

import { Clock } from 'lucide-react';
import { SingleProbeResult, TARGET_CONFIG } from '@/lib/dns/constants';
import { StatusIndicator } from './StatusIndicator';
import { CopyButton } from './CopyButton';

interface ServiceCardProps {
  title: string;
  protocol: 'DNS-over-TLS (DoT)' | 'DNS-over-HTTPS (DoH)';
  endpoint: string;
  port: number;
  description: string;
  probeResult?: SingleProbeResult | null;
  clientInstruction: string;
  targetDeviceText: string;
  verifiedTlsInfo?: string;
  httpVersion?: string;
}

export function ServiceCard({
  title,
  protocol,
  endpoint,
  port,
  description,
  probeResult,
  clientInstruction,
  targetDeviceText,
  verifiedTlsInfo,
  httpVersion,
}: ServiceCardProps) {
  const hasResult = Boolean(probeResult);
  const status = probeResult?.status ?? 'unknown';
  const isDegraded = status === 'degraded';
  const isOperational = status === 'operational';

  const dnsQueryLatency = probeResult?.dnsQueryLatencyMs;
  const connectionLatency = probeResult?.connectionLatencyMs;
  const totalLatency = probeResult?.totalLatencyMs ?? probeResult?.latencyMs;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 min-[375px]:p-6 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        {/* Header with Protocol & Status Indicator */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Port {port}
              </span>
              <span className="text-xs text-slate-500 font-normal">{protocol}</span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Terverifikasi melalui audit TLS di VPS">
                TLS 1.3
              </span>
              {httpVersion && (
                <span
                  className="text-[11px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                  title="Terverifikasi via ALPN h2 pada endpoint DoH VPS"
                >
                  {httpVersion}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>
          </div>

          <div className="shrink-0 pt-0.5">
            <StatusIndicator
              status={status}
              size="sm"
              customLabel={
                !hasResult
                  ? 'Belum Diperiksa'
                  : isOperational
                  ? 'Operasional'
                  : isDegraded
                  ? 'Degradasi'
                  : 'Gangguan'
              }
            />
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-3.5 sm:mb-4 leading-relaxed">{description}</p>

        {/* Target address box */}
        <div className="bg-slate-50 rounded-lg p-3 sm:p-3.5 border border-slate-200 mb-3.5 sm:mb-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Endpoint Konfigurasi
            </span>
            <CopyButton text={endpoint} label="Salin Alamat" />
          </div>
          <code className="text-xs sm:text-sm font-mono font-semibold text-slate-900 break-all select-all block bg-white p-2 rounded border border-slate-200">
            {endpoint}
          </code>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="text-blue-600 font-medium">Penggunaan:</span>
            <span>{clientInstruction}</span>
          </p>
        </div>
      </div>

      {/* Telemetry & Probe Metrics Footer */}
      <div className="pt-3 border-t border-slate-100 mt-2 space-y-2.5 text-xs">
        {/* Primary Latency Metric: Pure DNS Query Time */}
        <div className="flex items-start justify-between gap-2 text-slate-600">
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Respon Kueri DNS</span>
            </span>
            <span className="text-[10px] text-slate-400 block">
              Waktu proses &amp; transmisi kueri DNS oleh probe
            </span>
          </div>

          <div className="font-mono tabular-nums text-right shrink-0">
            {hasResult && dnsQueryLatency !== undefined ? (
              <span
                className={`text-sm sm:text-base font-bold ${
                  dnsQueryLatency >= TARGET_CONFIG.DNS_QUERY_DEGRADED_THRESHOLD_MS
                    ? 'text-amber-700'
                    : status === 'down'
                    ? 'text-rose-700'
                    : 'text-slate-900'
                }`}
              >
                {dnsQueryLatency} ms
              </span>
            ) : hasResult && totalLatency !== undefined ? (
              <span className="text-xs font-semibold text-slate-800">
                {totalLatency} ms <span className="text-[10px] text-slate-400 font-normal">(total probe)</span>
              </span>
            ) : (
              <span className="text-slate-400 font-sans text-xs">Belum tersedia</span>
            )}
          </div>
        </div>

        {/* Secondary Metric: Probe Connection / Handshake Time */}
        <div className="flex items-center justify-between gap-2 text-slate-600 pt-1 border-t border-slate-100/70">
          <span className="text-slate-500 text-[11px] shrink-0">Koneksi &amp; Handshake TLS</span>
          <span className="font-mono tabular-nums text-[11px] text-slate-800 font-medium text-right">
            {hasResult && connectionLatency !== undefined ? (
              `${connectionLatency} ms`
            ) : (
              <span className="text-slate-400 font-sans">Belum tersedia</span>
            )}
          </span>
        </div>

        {/* Diagnostic Metric: Total Probe Round-Trip */}
        <div className="flex items-center justify-between gap-2 text-slate-500 text-[11px]">
          <span className="text-slate-400 shrink-0">Total Waktu Siklus Probe</span>
          <span className="font-mono tabular-nums text-slate-600 text-right">
            {hasResult && totalLatency !== undefined ? (
              `${totalLatency} ms`
            ) : (
              <span className="text-slate-400 font-sans">Belum tersedia</span>
            )}
          </span>
        </div>

        {/* DNS Wire RCODE Result */}
        <div className="flex items-center justify-between gap-2 text-slate-600 pt-1 border-t border-slate-100/70">
          <span className="text-slate-500 shrink-0">Hasil Kueri DNS</span>
          <span className="font-mono text-xs text-right">
            {probeResult?.rcode ? (
              <span className="text-emerald-700 font-medium">
                {probeResult.rcode} {probeResult.answersCount !== undefined ? `(${probeResult.answersCount} ans)` : ''}
              </span>
            ) : probeResult?.error ? (
              <span
                className="text-rose-700 font-medium text-[11px] max-w-[130px] sm:max-w-[200px] truncate block text-right"
                title={probeResult.error}
              >
                {probeResult.error}
              </span>
            ) : (
              <span className="text-slate-400 font-sans">Menunggu Probe</span>
            )}
          </span>
        </div>

        {/* Verified Protocol Audit Detail */}
        {verifiedTlsInfo && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="shrink-0">Enkripsi Transport</span>
            <span className="font-mono text-[10px] text-slate-600 text-right">{verifiedTlsInfo}</span>
          </div>
        )}

        {/* Target Recommended Device */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-4 text-[11px] text-slate-500">
          <span className="shrink-0 text-slate-500">Perangkat Rekomendasi</span>
          <span className="text-slate-700 font-medium text-right leading-snug">
            {targetDeviceText}
          </span>
        </div>

        {probeResult?.checkedAtIso && (
          <div className="flex items-center justify-between gap-2 text-slate-400 text-[11px] pt-1 border-t border-slate-100">
            <span className="shrink-0">Waktu Cek</span>
            <span className="font-mono tabular-nums text-slate-500 text-right">
              {new Date(probeResult.checkedAtIso).toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}{' '}
              WIB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
