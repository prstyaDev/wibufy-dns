export type ServiceType = 'dot' | 'doh';
export type HealthStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface SingleProbeResult {
  service: ServiceType;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  timestamp: string;
  checkedAtIso: string;
  target: string;
  port: number;
  rcode?: string;
  answersCount?: number;
  error?: string;
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

// Strict whitelist constants to prevent SSRF and define explicit thresholds
export const TARGET_CONFIG = {
  DOT_HOST: 'dns.wibufy.biz.id',
  DOT_PORT: 853,
  DOH_URL: 'https://doh.wibufy.biz.id/dns-query',
  TEST_DOMAIN: 'example.com',
  TIMEOUT_MS: 5000,
  /**
   * Explicit latency threshold in milliseconds.
   * If a probe successfully resolves but takes >= 600ms (e.g. ~1 second),
   * the single probe and overall status are marked as 'degraded' due to high response time.
   */
  LATENCY_DEGRADED_THRESHOLD_MS: 600,
  /**
   * Staleness threshold: if last successful probe check was older than 24 hours,
   * overall status is marked 'unknown' (stale).
   */
  STALE_MINUTES_THRESHOLD: 1440, // 24 hours
} as const;
