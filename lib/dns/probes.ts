import * as tls from 'node:tls';
import { buildDnsQuery, parseDnsResponse } from './packet';
import {
  ServiceType,
  HealthStatus,
  SingleProbeResult,
  SystemStatusSummary,
  TARGET_CONFIG,
} from './constants';

export type {
  ServiceType,
  HealthStatus,
  SingleProbeResult,
  SystemStatusSummary,
};
export { TARGET_CONFIG };

/**
 * Sanitizes internal technical errors to prevent leakage of server paths or sensitive details
 */
export function sanitizeErrorMessage(err: unknown): string {
  if (!err) return 'Unknown error';
  const msg = err instanceof Error ? err.message : String(err);
  
  if (msg.includes('ETIMEDOUT') || msg.includes('timeout') || msg.includes('aborted')) {
    return 'Connection timed out after 5000ms';
  }
  if (msg.includes('ECONNREFUSED')) {
    return 'Connection refused by remote host (port closed or firewall blocked)';
  }
  if (msg.includes('CERT_') || msg.includes('certificate') || msg.includes('DEPTH_ZERO_SELF_SIGNED_CERT')) {
    return `TLS certificate verification failed: ${msg.slice(0, 100)}`;
  }
  if (msg.includes('ENOTFOUND')) {
    return 'Hostname resolution failed (DNS unresolvable)';
  }
  if (msg.includes('EHOSTUNREACH')) {
    return 'Host unreachable';
  }
  return msg.slice(0, 120);
}

/**
 * Executes DNS-over-TLS (DoT) probe via RFC 7858
 * Connects securely to dns.wibufy.biz.id:853 with TLS verification, sends wire query with 2-byte prefix.
 */
export async function probeDoT(): Promise<SingleProbeResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  return new Promise<SingleProbeResult>((resolve) => {
    let timer: NodeJS.Timeout | null = null;
    let socket: tls.TLSSocket | null = null;
    let resolved = false;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (socket) {
        try {
          socket.removeAllListeners();
          socket.destroy();
        } catch {
          // ignore cleanup errors
        }
        socket = null;
      }
    };

    const finish = (result: SingleProbeResult) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(result);
    };

    try {
      timer = setTimeout(() => {
        finish({
          service: 'dot',
          status: 'down',
          latencyMs: Date.now() - startTime,
          timestamp,
          checkedAtIso: timestamp,
          target: TARGET_CONFIG.DOT_HOST,
          port: TARGET_CONFIG.DOT_PORT,
          error: `Handshake / query timed out (${TARGET_CONFIG.TIMEOUT_MS}ms)`,
        });
      }, TARGET_CONFIG.TIMEOUT_MS);

      // Build DNS query for example.com
      const queryId = Math.floor(Math.random() * 0xffff);
      const dnsQuery = buildDnsQuery(TARGET_CONFIG.TEST_DOMAIN, queryId);

      // RFC 7858 Section 3.3: In DoT over TCP, message is prefixed with a two-octet length field
      const prefixedQuery = new Uint8Array(2 + dnsQuery.length);
      prefixedQuery[0] = (dnsQuery.length >> 8) & 0xff;
      prefixedQuery[1] = dnsQuery.length & 0xff;
      prefixedQuery.set(dnsQuery, 2);

      socket = tls.connect(
        {
          host: TARGET_CONFIG.DOT_HOST,
          port: TARGET_CONFIG.DOT_PORT,
          servername: TARGET_CONFIG.DOT_HOST, // SNI for proper certificate validation
          rejectUnauthorized: true,           // Enforce strict TLS certificate validation
          minVersion: 'TLSv1.2',
        },
        () => {
          // Connected & TLS Handshake completed successfully
          if (!socket) return;
          socket.write(Buffer.from(prefixedQuery));
        }
      );

      let responseBuffer = Buffer.alloc(0);
      let expectedLength: number | null = null;

      socket.on('data', (chunk: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, chunk]);

        if (expectedLength === null && responseBuffer.length >= 2) {
          expectedLength = (responseBuffer[0] << 8) | responseBuffer[1];
        }

        if (expectedLength !== null && responseBuffer.length >= 2 + expectedLength) {
          const latency = Date.now() - startTime;
          const payload = responseBuffer.subarray(2, 2 + expectedLength);

          try {
            const parsed = parseDnsResponse(new Uint8Array(payload));

            if (parsed.header.id !== queryId) {
              finish({
                service: 'dot',
                status: 'down',
                latencyMs: latency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOT_HOST,
                port: TARGET_CONFIG.DOT_PORT,
                error: `Transaction ID mismatch (expected ${queryId}, got ${parsed.header.id})`,
              });
              return;
            }

            if (!parsed.isSuccess) {
              finish({
                service: 'dot',
                status: 'down',
                latencyMs: latency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOT_HOST,
                port: TARGET_CONFIG.DOT_PORT,
                rcode: parsed.rcodeName,
                error: `DNS returned non-success code: ${parsed.rcodeName}`,
              });
              return;
            }

            const isDegraded = latency >= TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS;

            finish({
              service: 'dot',
              status: isDegraded ? 'degraded' : 'operational',
              latencyMs: latency,
              timestamp,
              checkedAtIso: timestamp,
              target: TARGET_CONFIG.DOT_HOST,
              port: TARGET_CONFIG.DOT_PORT,
              rcode: parsed.rcodeName,
              answersCount: parsed.header.ancount,
              error: isDegraded ? `Latensi tinggi (${latency}ms >= ambang ${TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS}ms)` : undefined,
            });
          } catch (parseErr) {
            finish({
              service: 'dot',
              status: 'down',
              latencyMs: latency,
              timestamp,
              checkedAtIso: timestamp,
              target: TARGET_CONFIG.DOT_HOST,
              port: TARGET_CONFIG.DOT_PORT,
              error: `Invalid DNS response payload: ${sanitizeErrorMessage(parseErr)}`,
            });
          }
        }
      });

      socket.on('error', (err) => {
        finish({
          service: 'dot',
          status: 'down',
          latencyMs: Date.now() - startTime,
          timestamp,
          checkedAtIso: timestamp,
          target: TARGET_CONFIG.DOT_HOST,
          port: TARGET_CONFIG.DOT_PORT,
          error: sanitizeErrorMessage(err),
        });
      });

      socket.on('close', (hadError) => {
        if (!resolved) {
          finish({
            service: 'dot',
            status: 'down',
            latencyMs: Date.now() - startTime,
            timestamp,
            checkedAtIso: timestamp,
            target: TARGET_CONFIG.DOT_HOST,
            port: TARGET_CONFIG.DOT_PORT,
            error: hadError ? 'Socket closed with transmission error' : 'Socket closed before response received',
          });
        }
      });
    } catch (outerErr) {
      finish({
        service: 'dot',
        status: 'down',
        latencyMs: Date.now() - startTime,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOT_HOST,
        port: TARGET_CONFIG.DOT_PORT,
        error: sanitizeErrorMessage(outerErr),
      });
    }
  });
}

/**
 * Executes DNS-over-HTTPS (DoH) probe via RFC 8484
 * Sends POST request with wire format body and application/dns-message content-type
 */
export async function probeDoH(): Promise<SingleProbeResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const queryId = Math.floor(Math.random() * 0xffff);
  const dnsQuery = buildDnsQuery(TARGET_CONFIG.TEST_DOMAIN, queryId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TARGET_CONFIG.TIMEOUT_MS);

  try {
    const res = await fetch(TARGET_CONFIG.DOH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/dns-message',
        'Content-Type': 'application/dns-message',
        'User-Agent': 'WibufyDNS-Probe/1.0 (https://dns.wibufy.biz.id)',
      },
      body: Buffer.from(dnsQuery),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!res.ok) {
      return {
        service: 'doh',
        status: 'down',
        latencyMs: latency,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOH_URL,
        port: 443,
        error: `HTTP ${res.status} ${res.statusText}`,
      };
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/dns-message')) {
      return {
        service: 'doh',
        status: 'down',
        latencyMs: latency,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOH_URL,
        port: 443,
        error: `Unexpected Content-Type: ${contentType.slice(0, 50)} (expected application/dns-message)`,
      };
    }

    const arrayBuffer = await res.arrayBuffer();
    const parsed = parseDnsResponse(new Uint8Array(arrayBuffer));

    if (parsed.header.id !== queryId) {
      return {
        service: 'doh',
        status: 'down',
        latencyMs: latency,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOH_URL,
        port: 443,
        error: `Transaction ID mismatch (expected ${queryId}, got ${parsed.header.id})`,
      };
    }

    if (!parsed.isSuccess) {
      return {
        service: 'doh',
        status: 'down',
        latencyMs: latency,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOH_URL,
        port: 443,
        rcode: parsed.rcodeName,
        error: `DNS returned non-success code: ${parsed.rcodeName}`,
      };
    }

    const isDegraded = latency >= TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS;

    return {
      service: 'doh',
      status: isDegraded ? 'degraded' : 'operational',
      latencyMs: latency,
      timestamp,
      checkedAtIso: timestamp,
      target: TARGET_CONFIG.DOH_URL,
      port: 443,
      rcode: parsed.rcodeName,
      answersCount: parsed.header.ancount,
      error: isDegraded ? `Latensi tinggi (${latency}ms >= ambang ${TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS}ms)` : undefined,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      service: 'doh',
      status: 'down',
      latencyMs: Date.now() - startTime,
      timestamp,
      checkedAtIso: timestamp,
      target: TARGET_CONFIG.DOH_URL,
      port: 443,
      error: sanitizeErrorMessage(err),
    };
  }
}

/**
 * Runs both DoT and DoH probes concurrently and calculates unified status:
 * - Operational: Both probes succeeded and latency is within threshold (< 600ms).
 * - Degraded: Probes succeeded but latency exceeded threshold, or one protocol failed while other succeeded.
 * - Down: Both protocols failed.
 * - Unknown: No valid probe data or data is older than staleness threshold.
 */
export async function executeAllProbes(
  storageMode: 'supabase-postgres' | 'unconfigured' = 'supabase-postgres'
): Promise<SystemStatusSummary> {
  const [dotResult, dohResult] = await Promise.all([
    probeDoT(),
    probeDoH(),
  ]);

  let status: HealthStatus = 'unknown';
  let overallText = 'Status Belum Diketahui';

  const isDotDown = dotResult.status === 'down';
  const isDohDown = dohResult.status === 'down';
  const isDotDegraded = dotResult.status === 'degraded';
  const isDohDegraded = dohResult.status === 'degraded';

  if (!isDotDown && !isDohDown) {
    if (isDotDegraded || isDohDegraded) {
      status = 'degraded';
      if (isDotDegraded && isDohDegraded) {
        overallText = `Layanan Mengalami Degradasi (Latensi Tinggi pada DoT ${dotResult.latencyMs}ms & DoH ${dohResult.latencyMs}ms)`;
      } else if (isDotDegraded) {
        overallText = `Layanan Mengalami Degradasi (Latensi Tinggi pada DoT: ${dotResult.latencyMs}ms)`;
      } else {
        overallText = `Layanan Mengalami Degradasi (Latensi Tinggi pada DoH: ${dohResult.latencyMs}ms)`;
      }
    } else {
      status = 'operational';
      overallText = 'Semua Layanan Beroperasi Normal';
    }
  } else if (!isDotDown || !isDohDown) {
    status = 'degraded';
    if (isDotDown) {
      overallText = 'Layanan Mengalami Degradasi (DoT Port 853 Terganggu)';
    } else {
      overallText = 'Layanan Mengalami Degradasi (DoH Port 443 Terganggu)';
    }
  } else {
    status = 'down';
    overallText = 'Gangguan Total pada DoT & DoH';
  }

  const lastChecked = new Date().toISOString();

  return {
    status,
    overallText,
    lastChecked,
    isStale: false,
    staleAfterMinutes: TARGET_CONFIG.STALE_MINUTES_THRESHOLD,
    dot: dotResult,
    doh: dohResult,
    storageMode,
  };
}
