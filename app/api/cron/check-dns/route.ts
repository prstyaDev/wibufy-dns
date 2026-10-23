import { NextRequest, NextResponse } from 'next/server';
import { executeAllProbes } from '@/lib/dns/probes';
import { saveProbeSummary, isSupabaseConfigured, cleanOldProbeLogs } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Validate authorization
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';

  // If CRON_SECRET is configured, enforce strict token verification
  if (cronSecret) {
    const bearerToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
    const isValidToken = bearerToken === cronSecret;

    if (!isValidToken && !isVercelCron) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Permintaan ditolak. Header Authorization Bearer token tidak valid atau tidak disertakan.',
        },
        { status: 401 }
      );
    }
  } else if (process.env.NODE_ENV === 'production' && !isVercelCron) {
    // In production without CRON_SECRET configured, restrict execution
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'CRON_SECRET belum dikonfigurasi di environment variables server.',
      },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const cleanupOnly = url.searchParams.get('cleanup_only') === 'true';

  try {
    const hasDb = isSupabaseConfigured();

    // If standalone cleanup requested
    if (cleanupOnly) {
      const cleanupResult = hasDb ? await cleanOldProbeLogs() : { success: false, deletedCount: 0 };
      return NextResponse.json({
        success: true,
        action: 'standalone_retention_cleanup',
        timestamp: new Date().toISOString(),
        hasDatabase: hasDb,
        deletedRows: cleanupResult.deletedCount ?? 0,
        retentionPolicy: '30 days',
      });
    }

    const storageMode = hasDb ? 'supabase-postgres' : 'unconfigured';
    const summary = await executeAllProbes(storageMode);

    let saveResult: { success: boolean; error?: string } = {
      success: false,
      error: 'Database Supabase belum terkonfigurasi',
    };
    let cleanupCount = 0;

    if (hasDb) {
      saveResult = await saveProbeSummary(summary);
      // Independent guarantee: always run cleanOldProbeLogs() as part of daily cron
      const cleanup = await cleanOldProbeLogs();
      cleanupCount = cleanup.deletedCount ?? 0;
    }

    return NextResponse.json({
      success: true,
      timestamp: summary.lastChecked,
      status: summary.status,
      overallText: summary.overallText,
      storage: {
        mode: summary.storageMode,
        persisted: saveResult.success,
        error: saveResult.error,
        retentionPolicy: '30-day active retention (Trigger + Daily Cron Cleanup)',
        cleanedRowsThisRun: cleanupCount,
      },
      results: {
        dot: summary.dot
          ? {
              status: summary.dot.status,
              latencyMs: summary.dot.latencyMs,
              rcode: summary.dot.rcode,
              error: summary.dot.error,
            }
          : null,
        doh: summary.doh
          ? {
              status: summary.doh.status,
              latencyMs: summary.doh.latencyMs,
              rcode: summary.doh.rcode,
              error: summary.doh.error,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('[Cron Error] Failed to execute DNS probe:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menjalankan pemantauan DNS.',
        message: 'Terjadi kesalahan internal saat mengeksekusi probe.',
      },
      { status: 500 }
    );
  }
}

// Support POST with same security rules
export async function POST(req: NextRequest) {
  return GET(req);
}
