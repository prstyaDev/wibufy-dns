import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export function SunsetNoticeBanner() {
  return (
    <aside
      aria-label="Pemberitahuan Akhir Fase Eksperimen"
      className="relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50/95 p-3.5 sm:p-4 shadow-xs"
    >
      <div className="flex items-start gap-2.5 sm:gap-3.5">
        {/* Compact Icon Badge pinned to top-left */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 border border-amber-200/90 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
        </div>

        {/* Content Body */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Status & Date row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-200/90 text-amber-900 tracking-wide uppercase">
              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-800" />
              Fase Selesai
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-medium text-amber-900/80">
              29 Oktober 2026
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
            Eksperimen WibufyDNS Berakhir — Terima Kasih untuk Semua!
          </h2>

          {/* Concise explanation */}
          <p className="text-[11px] sm:text-xs text-slate-700 leading-relaxed text-pretty">
            Fase uji coba resolver DoT (<code className="px-1 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] sm:text-[11px]">dns.wibufy.biz.id</code>) berakhir besok.
            <strong className="font-semibold text-slate-900 ml-1">
              Harap kembalikan DNS perangkat Anda ke &ldquo;Otomatis&rdquo; agar koneksi internet tetap aktif.
            </strong>
          </p>

          {/* Action Link */}
          <div className="pt-0.5">
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 decoration-amber-400 hover:decoration-amber-700 transition-colors"
            >
              <span>Baca panduan migrasi &amp; rincian di Changelog</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
