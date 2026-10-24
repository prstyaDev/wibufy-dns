export type ServiceType = 'dot' | 'doh';
export type HealthStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface SingleProbeResult {
  service: ServiceType;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  totalLatencyMs?: number;
  connectionLatencyMs?: number;
  dnsQueryLatencyMs?: number;
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
   * DNS Query degradation threshold in milliseconds.
   * If pure DNS query processing time exceeds this threshold,
   * the resolver is considered degraded.
   */
  DNS_QUERY_DEGRADED_THRESHOLD_MS: 350,
  /**
   * Transport latency advisory threshold in milliseconds.
   * Total probe duration >= this threshold indicates cross-continent or slow probe transport,
   * logged diagnostically without falsely degrading a healthy resolver.
   */
  LATENCY_DEGRADED_THRESHOLD_MS: 600,
  /**
   * Staleness threshold: if last successful probe check was older than 24 hours,
   * overall status is marked 'unknown' (stale).
   */
  STALE_MINUTES_THRESHOLD: 1440, // 24 hours
} as const;

