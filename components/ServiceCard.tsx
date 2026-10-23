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
}: ServiceCardProps) {
  const hasResult = Boolean(probeResult);
  const status = probeResult?.status ?? 'unknown';
  const isDegraded = status === 'degraded';
  const isOperational = status === 'operational';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        {/* Header with Protocol & Status Indicator */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Port {port}
              </span>
              <span className="text-xs text-slate-500 font-normal">{protocol}</span>
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
      <div className="pt-3 border-t border-slate-100 mt-2 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Latensi Terakhir</span>
          </span>
          <div className="flex items-center gap-1.5 font-mono tabular-nums">
            {hasResult && probeResult?.latencyMs !== undefined ? (
              <>
                <span
                  className={`font-semibold ${
                    isDegraded
                      ? 'text-amber-700'
                      : status === 'down'
                      ? 'text-rose-700'
                      : 'text-slate-900'
                  }`}
                >
                  {probeResult.latencyMs} ms
                </span>
                {probeResult.latencyMs >= TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS && (
                  <span className="text-[10px] text-amber-800 font-sans px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                    &ge; {TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS}ms
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
        </div>

        {hasResult && probeResult?.dnsQueryLatencyMs !== undefined && (
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono">
            <span>Rincian Waktu</span>
            <span>
              Kueri: <span className="font-semibold text-slate-800">{probeResult.dnsQueryLatencyMs}ms</span>
              {probeResult.connectionLatencyMs !== undefined && (
                <> · TLS: <span className="font-semibold text-slate-800">{probeResult.connectionLatencyMs}ms</span></>
              )}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600">
          <span className="text-slate-500">Hasil Query DNS</span>
          <span className="font-mono text-xs">
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
              <span className="text-slate-400">Menunggu Probe</span>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500 text-[11px]">
          <span>Perangkat Rekomendasi</span>
          <span className="text-slate-700 font-medium">{targetDeviceText}</span>
        </div>

        {probeResult?.checkedAtIso && (
          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-100">
            <span>Waktu Cek</span>
            <span className="font-mono tabular-nums text-slate-500">
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
