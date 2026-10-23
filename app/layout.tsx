import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StatusProvider } from '@/components/StatusProvider';
import { getLatestStatus } from '@/lib/storage';

export const metadata: Metadata = {
  title: {
    default: 'WibufyDNS — Status Layanan & Dokumentasi DNS Terenkripsi',
    template: '%s | WibufyDNS',
  },
  description:
    'Portal publik status monitoring real-time, panduan konfigurasi DoT (dns.wibufy.biz.id) & DoH (doh.wibufy.biz.id), dan riwayat pemeliharaan WibufyDNS.',
  keywords: [
    'WibufyDNS',
    'DoT',
    'DoH',
    'DNS over TLS',
    'DNS over HTTPS',
    'AdGuard Home',
    'Private DNS Android',
    'Anti Iklan DNS',
    'DNS Indonesia',
  ],
  authors: [{ name: 'WibufyDNS' }],
  creator: 'WibufyDNS',
  openGraph: {
    title: 'WibufyDNS — Status & Dokumentasi Layanan DNS Terenkripsi',
    description:
      'Status monitoring ketersediaan DoT & DoH WibufyDNS, panduan instalasi Private DNS Android dan browser, serta riwayat pemeliharaan.',
    siteName: 'WibufyDNS',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WibufyDNS — Status & Dokumentasi Layanan DNS Terenkripsi',
    description:
      'Status monitoring ketersediaan DoT & DoH WibufyDNS, panduan instalasi Private DNS Android dan browser.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialSummary = null;
  try {
    initialSummary = await getLatestStatus();
  } catch {
    // Graceful fallback if database read fails at build/render time
  }

  return (
    <html lang="id" className="scroll-smooth bg-white text-slate-900 antialiased">
      <body className="min-h-screen flex flex-col justify-between bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <StatusProvider initialSummary={initialSummary}>
          <Header />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <Footer />
        </StatusProvider>
      </body>
    </html>
  );
}
