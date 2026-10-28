'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Sparkles,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import {
  CHANGELOG_ITEMS,
  IMPROVEMENT_PLANS,
  ChangelogCategory,
  IMPACT_LABELS,
} from '@/lib/changelog-data';

const CATEGORIES = ['Semua', 'Pembaruan', 'Peningkatan', 'Pemeliharaan', 'Gangguan', 'Selesai'] as const;

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const filteredItems = CHANGELOG_ITEMS.filter((item) => {
    if (selectedCategory === 'Semua') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (cat: ChangelogCategory) => {
    switch (cat) {
      case 'Pembaruan':
      case 'Peningkatan':
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      case 'Pemeliharaan':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'Gangguan':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      case 'Selesai':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  const getCategoryColor = (cat: ChangelogCategory) => {
    switch (cat) {
      case 'Pembaruan':
      case 'Peningkatan':
        return 'text-blue-700';
      case 'Pemeliharaan':
        return 'text-amber-700';
      case 'Gangguan':
        return 'text-rose-700';
      case 'Selesai':
        return 'text-emerald-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 pb-8">
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium">
          <Link href="/" className="hover:underline">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600">Changelog &amp; Riwayat Layanan</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Changelog &amp; Riwayat Layanan
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          Riwayat pembaruan, pemeliharaan, dan insiden WibufyDNS. Halaman ini mencatat perkembangan layanan serta perubahan yang relevan bagi pengguna.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200/80 rounded-xl w-fit">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 font-semibold border border-slate-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {cat === 'Semua' ? 'Semua Catatan' : cat}
              </button>
            );
          })}
        </div>

        {/* Timeline Entries */}
        <div className="relative pl-6 sm:pl-8 border-l border-slate-200 space-y-10 pt-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center sm:text-left text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-5">
              {selectedCategory === 'Gangguan'
                ? 'Tidak ada catatan gangguan atau insiden layanan yang tercatat.'
                : selectedCategory === 'Selesai'
                ? 'Tidak ada catatan penyelesaian insiden pada riwayat saat ini.'
                : `Tidak ada riwayat untuk kategori "${selectedCategory}".`}
            </div>
          ) : (
            filteredItems.map((item) => (
              <article key={item.id} className="relative group space-y-2.5">
                {/* Timeline marker node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-300 group-hover:border-blue-600 transition-colors" />

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {getCategoryIcon(item.category)}
                    <span>{item.category}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300">
                    ·
                  </span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {new Date(item.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {item.impact && item.impact !== 'none' && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">
                        ·
                      </span>
                      <span
                        className={
                          item.impact === 'critical'
                            ? 'inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]'
                            : 'text-amber-700 font-medium'
                        }
                      >
                        {IMPACT_LABELS[item.impact] || `Dampak: ${item.impact}`}
                      </span>
                    </>
                  )}
                </div>

                {/* Entry Title */}
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                  {item.title}
                </h2>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {item.summary}
                </p>

                {/* Bulleted details */}
                {item.details && item.details.length > 0 && (
                  <div
                    className={`border rounded-xl p-4 text-xs shadow-xs space-y-3 ${
                      item.impact === 'critical'
                        ? 'bg-rose-50/40 border-rose-200/80 text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ul className="space-y-1.5 list-disc pl-4 leading-relaxed">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="text-slate-700">
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {item.note && (
                      <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/80 leading-relaxed">
                        <strong className="text-slate-800 font-medium">Catatan Penting:</strong> {item.note}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {/* Bagian Rencana Peningkatan Berikutnya */}
      <section className="pt-8 border-t border-slate-200 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Agenda Pengembangan (Diarsipkan)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Rencana Peningkatan Layanan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Daftar roadmap dan agenda teknis yang dipersiapkan selama masa eksplorasi WibufyDNS. Seluruh rencana berikut diarsipkan sebagai dokumentasi pembelajaran dan referensi untuk fase selanjutnya.
          </p>
        </div>

        {/* Notice of archive status */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 shrink-0">Status Eksperimen:</span>
          <span>Fase eksperimen pertama telah selesai dengan sukses. Dokumentasi arsitektur dan repositori konfigurasi tetap terbuka sebagai referensi publik.</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {IMPROVEMENT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                    {plan.category}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {plan.status || 'Diarsipkan'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {plan.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {plan.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Note about Transparency & Repository Link */}
      <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p>
          Ada kendala, anomali, atau saran yang belum tercatat? Anda dapat menyampaikan issue secara transparan via{' '}
          <a
            href="https://github.com/prstyaDev/wibufy-dns"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5"
          >
            <span>GitHub prstyaDev/wibufy-dns</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>.
        </p>
      </div>
    </div>
  );
}
