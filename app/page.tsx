import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { LiveCheckTrigger } from '@/components/LiveCheckTrigger';
import { QuickSetupSection } from '@/components/QuickSetupSection';
import { PrivacyProtectionSection } from '@/components/PrivacyProtectionSection';
import { RecentProbesHistory } from '@/components/RecentProbesHistory';
import { SunsetNoticeBanner } from '@/components/SunsetNoticeBanner';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Sunset / EOL Notice Banner */}
      <SunsetNoticeBanner />

      {/* Hero Section */}
      <section className="max-w-4xl pb-0 sm:pb-2">
        {/* Concise Hierarchical Kicker (20-24px to title) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-500 mb-5 sm:mb-6">
          <span className="font-semibold text-blue-600">WibufyDNS</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span>Resolver DoT &amp; DoH Publik</span>
        </div>

        {/* Title with responsive clamp & intentional line-height */}
        <h1 className="text-[clamp(1.5rem,5.8vw,1.875rem)] sm:text-4xl lg:text-[3rem] font-bold tracking-tight text-slate-900 leading-[1.18] sm:leading-[1.14] text-balance max-w-3xl">
          DNS Terenkripsi. Lebih Privat. Lebih Terkontrol.
        </h1>

        {/* Harmonized Readable Description (20-24px from title) */}
        <p className="mt-5 sm:mt-6 text-[13px] sm:text-base lg:text-[1.05rem] text-slate-600 leading-relaxed max-w-2xl text-pretty">
          Resolver DNS publik dengan protokol <strong>DNS-over-TLS (DoT)</strong> dan <strong>DNS-over-HTTPS (DoH)</strong>. Dilengkapi penyaringan domain iklan, pelacak, dan malware berbasis konfigurasi filter AdGuard Home.
        </p>

        {/* Action CTAs (28-32px from description, 12-16px gap between buttons) */}
        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
          <a
            href="#quick-setup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs active:scale-[0.98]"
          >
            <span>Mulai Pakai WibufyDNS</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </a>

          <Link
            href="/docs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-medium transition-colors border border-slate-200 shadow-xs active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Lihat Dokumentasi</span>
          </Link>
        </div>
      </section>

      {/* Section 1: Live Status Dashboard & DoT/DoH Cards (48-56px from hero buttons) */}
      <section id="status" className="scroll-mt-6 sm:scroll-mt-8">
        <span id="monitoring" aria-hidden="true" />
        {/* Status Section Header (24-28px to card below) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-slate-200 pb-3 mb-6 sm:mb-7">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
              Status Operasional
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Monitoring Ketersediaan Resolver
            </h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline font-mono">
            RFC 7858 &amp; RFC 8484 Wire Probe
          </span>
        </div>

        <LiveCheckTrigger />
      </section>

      {/* Section 2: Quick Setup */}
      <QuickSetupSection />

      {/* Section 3: Privacy, Scope & Technical Limitations */}
      <PrivacyProtectionSection />

      {/* Section 4: Audit History */}
      <RecentProbesHistory />
    </div>
  );
}
