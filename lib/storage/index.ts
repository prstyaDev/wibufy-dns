import { Pool, PoolConfig } from 'pg';
import { SingleProbeResult, HealthStatus, TARGET_CONFIG } from '../dns/probes';

export interface ProbeLogEntry {
  id?: number | string;
  service: 'dot' | 'doh';
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  checkedAt: string;
  error?: string;
  rcode?: string;
}

export interface SystemStatusSummary {
  status: HealthStatus;
  overallText: string;
  lastChecked: string | null;
  isStale: boolean;
  staleAfterMinutes: number;
  dot: SingleProbeResult | null;
  doh: SingleProbeResult | null;
  storageMode: 'supabase-postgres' | 'unconfigured';
}

let pool: Pool | null = null;

/**
 * Returns connection string from environment variables.
 * Priority: SUPABASE_DATABASE_URL > DATABASE_URL > POSTGRES_URL.
 */
function getConnectionString(): string | null {
  return (
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    null
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getConnectionString());
}

function cleanConnectionString(rawUrl: string): string {
  // Strip sslmode from query string to prevent pg-connection-string from forcing rejectUnauthorized: true
  return rawUrl.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');
}

/**
 * Creates or reuses a serverless-optimized connection pool to Supabase PostgreSQL.
 *
 * Configured for Supabase Transaction Pooler (Port 6543):
 * 1. SSL: Supabase PgBouncer poolers use private intermediate CA certificates.
 *    rejectUnauthorized: false ensures encrypted TLS connection without certificate chain failure,
 *    or custom CA if provided via SUPABASE_SSL_CA.
 * 2. Unnamed queries only, avoiding named prepared statement collisions in PgBouncer.
 * 3. max=2, idleTimeout=1000ms to immediately release connections in serverless.
 */
function getDbPool(): Pool | null {
  const rawConnectionString = getConnectionString();
  if (!rawConnectionString) {
    return null;
  }

  if (!pool) {
    const isLocal =
      rawConnectionString.includes('localhost') ||
      rawConnectionString.includes('127.0.0.1');

    const sslConfig = isLocal
      ? false
      : {
          rejectUnauthorized: false,
          ca: process.env.SUPABASE_SSL_CA || undefined,
        };

    const config: PoolConfig = {
      connectionString: cleanConnectionString(rawConnectionString),
      ssl: sslConfig,
      max: 2,                     // Conservative limit for serverless lambdas
      idleTimeoutMillis: 1000,    // Rapidly return connection to Supabase pooler
      connectionTimeoutMillis: 5000,
    };

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.warn('[Supabase Storage Pool Warning]:', err.message);
      pool = null;
    });
  }

  return pool;
}

/**
 * Ensures required tables and functions exist if migration has not been run yet
 */
async function ensureTables(db: Pool): Promise<void> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS public.dns_status_summary (
        id INT PRIMARY KEY DEFAULT 1,
        status VARCHAR(20) NOT NULL,
        overall_text TEXT NOT NULL,
        dot_status VARCHAR(20) NOT NULL,
        dot_latency INTEGER NOT NULL,
        dot_error TEXT,
        dot_rcode VARCHAR(20),
        doh_status VARCHAR(20) NOT NULL,
        doh_latency INTEGER NOT NULL,
        doh_error TEXT,
        doh_rcode VARCHAR(20),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS public.dns_probe_logs (
        id BIGSERIAL PRIMARY KEY,
        service VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL,
        latency_ms INTEGER NOT NULL,
        error_msg TEXT,
        rcode VARCHAR(20),
        checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_dns_probe_logs_service_checked ON public.dns_probe_logs(service, checked_at DESC);

      CREATE TABLE IF NOT EXISTS public.dns_rate_limits (
        id VARCHAR(50) PRIMARY KEY,
        last_triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO public.dns_rate_limits (id, last_triggered_at)
      VALUES ('global_probe', '1970-01-01 00:00:00+00')
      ON CONFLICT (id) DO NOTHING;
    `);
  } catch (err) {
    console.warn('[Supabase Storage] Table initialization check warning:', err);
  }
}

/**
 * Standalone reliable 30-day retention cleanup.
 * Can be called independently from probe insertion (e.g. during daily Vercel Cron or on demand).
 */
export async function cleanOldProbeLogs(): Promise<{ success: boolean; deletedCount?: number }> {
  const db = getDbPool();
  if (!db) {
    return { success: false };
  }

  try {
    // Try calling stored function clean_old_dns_probes() first
    const res = await db.query(
      `DELETE FROM public.dns_probe_logs WHERE checked_at < NOW() - INTERVAL '30 days';`
    );
    return { success: true, deletedCount: res.rowCount || 0 };
  } catch (err) {
    console.error('[Supabase Storage] Cleanup execution error:', err);
    return { success: false };
  }
}

/**
 * Saves probe summary into Supabase PostgreSQL and triggers retention cleanup.
 */
export async function saveProbeSummary(
  summary: SystemStatusSummary
): Promise<{ success: boolean; error?: string }> {
  const db = getDbPool();

  if (!db || !summary.dot || !summary.doh) {
    return {
      success: false,
      error: 'Supabase PostgreSQL belum terkonfigurasi. Konfigurasikan DATABASE_URL terlebih dahulu.',
    };
  }

  try {
    await ensureTables(db);

    // 1. Upsert latest summary into dns_status_summary
    await db.query(
      `
      INSERT INTO public.dns_status_summary (
        id, status, overall_text,
        dot_status, dot_latency, dot_error, dot_rcode,
        doh_status, doh_latency, doh_error, doh_rcode,
        updated_at
      ) VALUES (
        1, $1, $2,
        $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        overall_text = EXCLUDED.overall_text,
        dot_status = EXCLUDED.dot_status,
        dot_latency = EXCLUDED.dot_latency,
        dot_error = EXCLUDED.dot_error,
        dot_rcode = EXCLUDED.dot_rcode,
        doh_status = EXCLUDED.doh_status,
        doh_latency = EXCLUDED.doh_latency,
        doh_error = EXCLUDED.doh_error,
        doh_rcode = EXCLUDED.doh_rcode,
        updated_at = EXCLUDED.updated_at;
    `,
      [
        summary.status,
        summary.overallText,
        summary.dot.status,
        summary.dot.latencyMs,
        summary.dot.error || null,
        summary.dot.rcode || null,
        summary.doh.status,
        summary.doh.latencyMs,
        summary.doh.error || null,
        summary.doh.rcode || null,
        summary.lastChecked || new Date().toISOString(),
      ]
    );

    // 2. Insert historical probe logs
    await db.query(
      `
      INSERT INTO public.dns_probe_logs (service, status, latency_ms, error_msg, rcode, checked_at)
      VALUES
        ($1, $2, $3, $4, $5, $6),
        ($7, $8, $9, $10, $11, $12);
    `,
      [
        'dot',
        summary.dot.status,
        summary.dot.latencyMs,
        summary.dot.error || null,
        summary.dot.rcode || null,
        summary.dot.checkedAtIso,
        'doh',
        summary.doh.status,
        summary.doh.latencyMs,
        summary.doh.error || null,
        summary.doh.rcode || null,
        summary.doh.checkedAtIso,
      ]
    );

    // 3. Actively enforce 30-day retention policy
    await cleanOldProbeLogs();

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Supabase Storage] Failed to persist probe summary:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Retrieves latest status from Supabase PostgreSQL.
 */
export async function getLatestStatus(): Promise<SystemStatusSummary> {
  const db = getDbPool();

  if (!db) {
    return {
      status: 'unknown',
      overallText: 'Supabase Belum Terhubung',
      lastChecked: null,
      isStale: false,
      staleAfterMinutes: TARGET_CONFIG.STALE_MINUTES_THRESHOLD,
      dot: null,
      doh: null,
      storageMode: 'unconfigured',
    };
  }

  try {
    const res = await db.query(
      `SELECT * FROM public.dns_status_summary WHERE id = 1 LIMIT 1;`
    );

    if (res.rows.length === 0) {
      return {
        status: 'unknown',
        overallText: 'Belum Ada Pemeriksaan Tersimpan di Supabase',
        lastChecked: null,
        isStale: false,
        staleAfterMinutes: TARGET_CONFIG.STALE_MINUTES_THRESHOLD,
        dot: null,
        doh: null,
        storageMode: 'supabase-postgres',
      };
    }

    const row = res.rows[0];
    const lastCheckedDate = new Date(row.updated_at);
    const ageMinutes = (Date.now() - lastCheckedDate.getTime()) / (1000 * 60);
    const isStale = ageMinutes > TARGET_CONFIG.STALE_MINUTES_THRESHOLD;

    let status = row.status as HealthStatus;
    let overallText = row.overall_text;

    if (isStale) {
      status = 'unknown';
      overallText = `Data Kedaluwarsa (Pemeriksaan terakhir lebih dari ${Math.round(
        ageMinutes / 60
      )} jam yang lalu)`;
    }

    const dot: SingleProbeResult = {
      service: 'dot',
      status: row.dot_status,
      latencyMs: row.dot_latency,
      timestamp: lastCheckedDate.toISOString(),
      checkedAtIso: lastCheckedDate.toISOString(),
      target: TARGET_CONFIG.DOT_HOST,
      port: TARGET_CONFIG.DOT_PORT,
      error: row.dot_error || undefined,
      rcode: row.dot_rcode || undefined,
    };

    const doh: SingleProbeResult = {
      service: 'doh',
      status: row.doh_status,
      latencyMs: row.doh_latency,
      timestamp: lastCheckedDate.toISOString(),
      checkedAtIso: lastCheckedDate.toISOString(),
      target: TARGET_CONFIG.DOH_URL,
      port: 443,
      error: row.doh_error || undefined,
      rcode: row.doh_rcode || undefined,
    };

    return {
      status,
      overallText,
      lastChecked: lastCheckedDate.toISOString(),
      isStale,
      staleAfterMinutes: TARGET_CONFIG.STALE_MINUTES_THRESHOLD,
      dot,
      doh,
      storageMode: 'supabase-postgres',
    };
  } catch (err) {
    console.error('[Supabase Storage] Failed to read latest status:', err);
    return {
      status: 'unknown',
      overallText: 'Gagal Menghubungi Supabase PostgreSQL',
      lastChecked: null,
      isStale: false,
      staleAfterMinutes: TARGET_CONFIG.STALE_MINUTES_THRESHOLD,
      dot: null,
      doh: null,
      storageMode: 'supabase-postgres',
    };
  }
}

/**
 * Retrieves probe log history from Supabase PostgreSQL.
 */
export async function getProbeHistory(limit: number = 20): Promise<ProbeLogEntry[]> {
  const db = getDbPool();
  if (!db) return [];

  try {
    const res = await db.query(
      `SELECT id, service, status, latency_ms as "latencyMs", error_msg as "error", rcode, checked_at as "checkedAt"
       FROM public.dns_probe_logs
       ORDER BY checked_at DESC
       LIMIT $1;`,
      [limit]
    );

    return res.rows.map((r) => ({
      id: r.id,
      service: r.service,
      status: r.status,
      latencyMs: r.latencyMs,
      checkedAt: new Date(r.checkedAt).toISOString(),
      error: r.error || undefined,
      rcode: r.rcode || undefined,
    }));
  } catch (err) {
    console.error('[Supabase Storage] Failed to query probe history:', err);
    return [];
  }
}

/**
 * ATOMIC Global Rate Limiter across all Vercel serverless instances.
 * Executes the PostgreSQL function acquire_probe_rate_limit with row-level locking (FOR UPDATE).
 * Guarantees zero race condition even when concurrent requests arrive at identical milliseconds.
 */
export async function checkAndAcquireGlobalRateLimit(
  cooldownSeconds: number = 60
): Promise<{ allowed: boolean; remainingSeconds: number }> {
  const db = getDbPool();
  if (!db) {
    return { allowed: false, remainingSeconds: 0 };
  }

  try {
    // 1. First attempt: call the atomic stored function acquire_probe_rate_limit
    try {
      const res = await db.query(
        `SELECT allowed, remaining_seconds AS "remainingSeconds"
         FROM public.acquire_probe_rate_limit('global_probe', $1);`,
        [cooldownSeconds]
      );
      if (res.rows.length > 0) {
        return {
          allowed: Boolean(res.rows[0].allowed),
          remainingSeconds: Number(res.rows[0].remainingSeconds || 0),
        };
      }
    } catch (funcErr) {
      // If function doesn't exist yet, ensure tables and run atomic fallback transaction
      console.warn('[Rate Limit] Function acquire_probe_rate_limit not found, running fallback:', funcErr);
      await ensureTables(db);
    }

    // 2. Fallback atomic transaction using SELECT ... FOR UPDATE
    const client = await db.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        INSERT INTO public.dns_rate_limits (id, last_triggered_at)
        VALUES ('global_probe', '1970-01-01 00:00:00+00')
        ON CONFLICT (id) DO NOTHING;
      `);

      const lockRes = await client.query(`
        SELECT last_triggered_at FROM public.dns_rate_limits
        WHERE id = 'global_probe'
        FOR UPDATE;
      `);

      const lastDate = lockRes.rows.length > 0 ? new Date(lockRes.rows[0].last_triggered_at).getTime() : 0;
      const elapsed = Math.floor((Date.now() - lastDate) / 1000);

      if (elapsed >= cooldownSeconds) {
        await client.query(`
          UPDATE public.dns_rate_limits
          SET last_triggered_at = NOW()
          WHERE id = 'global_probe';
        `);
        await client.query('COMMIT');
        return { allowed: true, remainingSeconds: 0 };
      } else {
        await client.query('ROLLBACK');
        return { allowed: false, remainingSeconds: cooldownSeconds - elapsed };
      }
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Atomic Rate Limit Error]:', err);
    return { allowed: false, remainingSeconds: cooldownSeconds };
  }
}
