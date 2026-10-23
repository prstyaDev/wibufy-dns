import Link from 'next/link';
import { ShieldAlert, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-200 shadow-xs">
        <ShieldAlert className="w-6 h-6" />
      </div>

      <span className="text-xs font-mono font-medium text-blue-600 mb-2">404 — HALAMAN TIDAK DITEMUKAN</span>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
        Alamat yang Anda Cari Tidak Tersedia
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-8 leading-relaxed">
        Halaman yang Anda tuju mungkin telah dipindahkan, dinonaktifkan, atau URL yang dimasukkan kurang tepat.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda Status</span>
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors border border-slate-200 shadow-xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span>Buka Dokumentasi DNS</span>
        </Link>
      </div>
    </div>
  );
}
