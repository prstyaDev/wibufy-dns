'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, ArrowUpRight } from 'lucide-react';
import { useSystemStatus } from './StatusProvider';
import { StatusIndicator } from './StatusIndicator';

const NAV_LINKS = [
  { href: '/', label: 'Status Layanan' },
  { href: '/docs', label: 'Dokumentasi' },
  { href: '/changelog', label: 'Changelog' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { status, hasData, isStale } = useSystemStatus();

  const headerStatus = !hasData ? 'unknown' : isStale ? 'stale' : status;
  const headerLabel = !hasData
    ? 'Belum Tersedia'
    : isStale
    ? 'Kedaluwarsa'
    : status === 'operational'
    ? 'Semua Layanan Normal'
    : status === 'degraded'
    ? 'Layanan Terdegradasi'
    : 'Gangguan Layanan';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone: 1-line clean wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight text-base whitespace-nowrap">
            Wibufy<span className="text-blue-600">DNS</span>
          </span>
        </Link>

        {/* Center Zone: clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs sm:text-sm ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action / Live Status Zone */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <StatusIndicator
            status={headerStatus}
            size="sm"
            customLabel={headerLabel}
          />

          <Link
            href="/docs"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
          >
            <span>Panduan Pasang</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <StatusIndicator
            status={headerStatus}
            size="sm"
            showText={false}
          />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-3 py-1">
              <span>Status Sistem:</span>
              <StatusIndicator
                status={headerStatus}
                size="sm"
                customLabel={
                  !hasData
                    ? 'Belum Tersedia'
                    : isStale
                    ? 'Kedaluwarsa'
                    : status === 'operational'
                    ? 'Operasional'
                    : status === 'degraded'
                    ? 'Degradasi'
                    : 'Gangguan'
                }
              />
            </div>
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center w-full py-2.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Buka Dokumentasi DNS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
