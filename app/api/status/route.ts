import { NextRequest, NextResponse } from 'next/server';
import { executeAllProbes } from '@/lib/dns/probes';
import {
  getLatestStatus,
  getProbeHistory,
  saveProbeSummary,
  isSupabaseConfigured,
  checkAndAcquireGlobalRateLimit,
} from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GLOBAL_COOLDOWN_SECONDS = 60;

export async function GET(req: NextRequest) {
  try {
    const hasDb = isSupabaseConfigured();
    const summary = await getLatestStatus();
    const history = await getProbeHistory(10);

    let cooldownRemaining = 0;
    if (hasDb && summary.lastChecked) {
      const elapsed = Math.floor((Date.now() - new Date(summary.lastChecked).getTime()) / 1000);
      if (elapsed < GLOBAL_COOLDOWN_SECONDS) {
        cooldownRemaining = GLOBAL_COOLDOWN_SECONDS - elapsed;
      }
    }

    return NextResponse.json({
      summary,
      history,
      meta: {
        hasSupabase: hasDb,
        storageType: hasDb ? 'Supabase PostgreSQL (Persisten)' : 'Belum Dikonfigurasi (Unknown)',
        retentionPolicy: hasDb ? '30 Hari Otomatis (Trigger + Daily Cron Cleanup)' : 'Nonaktif (Belum Ada DB)',
        cooldownRemainingSeconds: cooldownRemaining,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Status API Error]:', error);
    return NextResponse.json(
      {
        error: 'Gagal mengambil status monitoring dari database.',
      },
      { status: 500 }
    );
  }
}

let inMemoryLastProbe = 0;

/**
 * Trigger on-demand probe check.
 * Protected by ATOMIC Supabase PostgreSQL row-level lock (FOR UPDATE) when DB is connected,
 * or in-memory cooldown rate limiter when DB is unconfigured.
 */
export async function POST(req: NextRequest) {
  const hasDb = isSupabaseConfigured();

  // If Supabase is configured, use atomic database rate limiting
  if (hasDb) {
    const rateLimit = await checkAndAcquireGlobalRateLimit(GLOBAL_COOLDOWN_SECONDS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate Limit Global Terlampaui',
          message: `Pemeriksaan DNS baru saja dilakukan. Mohon tunggu ${rateLimit.remainingSeconds} detik lagi untuk mencegah spam ke resolver WibufyDNS.`,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      );
    }

    try {
      const summary = await executeAllProbes('supabase-postgres');
      const saveResult = await saveProbeSummary(summary);

      if (!saveResult.success) {
        return NextResponse.json(
          {
            error: 'Penyimpanan Gagal',
            message: saveResult.error || 'Gagal menyimpan hasil probe ke database Supabase.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error('[Live Check Error]:', error);
      return NextResponse.json(
        {
          error: 'Pemeriksaan gagal dijalankan.',
        },
        { status: 500 }
      );
    }
  }

  // If Supabase is unconfigured, enforce in-memory rate limit and run live wire probe
  const now = Date.now();
  const elapsed = Math.floor((now - inMemoryLastProbe) / 1000);
  if (elapsed < GLOBAL_COOLDOWN_SECONDS) {
    const remaining = GLOBAL_COOLDOWN_SECONDS - elapsed;
    return NextResponse.json(
      {
        error: 'Rate Limit Terlampaui',
        message: `Pemeriksaan DNS baru saja dilakukan. Mohon tunggu ${remaining} detik lagi untuk mencegah spam ke resolver WibufyDNS.`,
        remainingSeconds: remaining,
      },
      { status: 429 }
    );
  }

  try {
    inMemoryLastProbe = now;
    const summary = await executeAllProbes('unconfigured');
    return NextResponse.json({
      success: true,
      summary,
      notice: 'Pemeriksaan langsung real-time (Database belum dikonfigurasi).',
    });
  } catch (error) {
    console.error('[Live Check Unconfigured Error]:', error);
    return NextResponse.json(
      {
        error: 'Pemeriksaan gagal dijalankan.',
      },
      { status: 500 }
    );
  }
}
