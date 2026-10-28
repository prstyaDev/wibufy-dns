import Link from 'next/link';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

export function SunsetNoticeBanner() {
  return (
    <aside
      aria-label="Pemberitahuan Akhir Fase Eksperimen"
      className="relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row items-start gap-3.5 sm:gap-4">
        {/* Appreciation & Warning Icon Badge */}
        <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5 border border-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-700" />
        </div>

        {/* Content Body */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-200/80 text-amber-900 uppercase tracking-wide">
              <AlertTriangle className="w-3 h-3 text-amber-800" />
              Fase Eksperimen Berakhir
            </span>
            <span className="text-xs font-mono font-medium text-amber-800/80">
              Efektif: 29 Oktober 2026
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Eksperimen WibufyDNS Sampai di Penghujungnya — Terima Kasih!
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
            Fase uji coba resolver DoT (<code className="px-1 py-0.5 rounded bg-amber-100/80 text-amber-900 font-mono text-[11px] sm:text-xs">dns.wibufy.biz.id</code>) dan DoH dijadwalkan berakhir pada 29 Oktober 2026. Terima kasih banyak untuk semua yang sudah mencoba, memakai, dan ikut memberi masukan.
            <strong className="font-semibold text-slate-900 ml-1">
              Harap segera kembalikan setelan DNS perangkat Anda ke &ldquo;Otomatis&rdquo; atau beralih ke resolver alternatif agar akses internet tidak terputus.
            </strong>
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-4 decoration-amber-400 hover:decoration-amber-700 transition-colors"
            >
              <span>Baca catatan penutupan eksperimen &amp; panduan di Changelog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
