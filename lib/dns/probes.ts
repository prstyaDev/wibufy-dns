import * as tls from 'node:tls';
import * as https from 'node:https';
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
 * Separates connection setup (TCP+TLS handshake) from pure DNS wire query round-trip latency.
 */
export async function probeDoT(): Promise<SingleProbeResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  return new Promise<SingleProbeResult>((resolve) => {
    let timer: NodeJS.Timeout | null = null;
    let socket: tls.TLSSocket | null = null;
    let resolved = false;
    let connectionLatencyMs = 0;
    let queryStartTime = 0;

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
        const total = Date.now() - startTime;
        finish({
          service: 'dot',
          status: 'down',
          latencyMs: total,
          totalLatencyMs: total,
          connectionLatencyMs: connectionLatencyMs || total,
          dnsQueryLatencyMs: queryStartTime > 0 ? Date.now() - queryStartTime : 0,
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
          connectionLatencyMs = Math.max(1, Date.now() - startTime);
          queryStartTime = Date.now();
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
          const endTime = Date.now();
          const totalLatency = Math.max(1, endTime - startTime);
          const dnsQueryLatency = queryStartTime > 0 ? Math.max(1, endTime - queryStartTime) : totalLatency;
          const connLatency = connectionLatencyMs || Math.max(1, totalLatency - dnsQueryLatency);
          const payload = responseBuffer.subarray(2, 2 + expectedLength);

          try {
            const parsed = parseDnsResponse(new Uint8Array(payload));

            if (parsed.header.id !== queryId) {
              finish({
                service: 'dot',
                status: 'down',
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
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
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOT_HOST,
                port: TARGET_CONFIG.DOT_PORT,
                rcode: parsed.rcodeName,
                error: `DNS returned non-success code: ${parsed.rcodeName}`,
              });
              return;
            }

            const isQueryDegraded = dnsQueryLatency >= TARGET_CONFIG.DNS_QUERY_DEGRADED_THRESHOLD_MS;
            const isTransportHigh = totalLatency >= TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS;

            finish({
              service: 'dot',
              status: isQueryDegraded ? 'degraded' : 'operational',
              latencyMs: totalLatency,
              totalLatencyMs: totalLatency,
              connectionLatencyMs: connLatency,
              dnsQueryLatencyMs: dnsQueryLatency,
              timestamp,
              checkedAtIso: timestamp,
              target: TARGET_CONFIG.DOT_HOST,
              port: TARGET_CONFIG.DOT_PORT,
              rcode: parsed.rcodeName,
              answersCount: parsed.header.ancount,
              error: isQueryDegraded
                ? `Waktu respons kueri DNS tinggi (${dnsQueryLatency}ms >= ambang ${TARGET_CONFIG.DNS_QUERY_DEGRADED_THRESHOLD_MS}ms)`
                : isTransportHigh
                ? `Koneksi probe lambat karena jarak geografis (${totalLatency}ms total, kueri DNS normal ${dnsQueryLatency}ms)`
                : undefined,
            });
          } catch (parseErr) {
            finish({
              service: 'dot',
              status: 'down',
              latencyMs: totalLatency,
              totalLatencyMs: totalLatency,
              connectionLatencyMs: connLatency,
              dnsQueryLatencyMs: dnsQueryLatency,
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
        const total = Date.now() - startTime;
        finish({
          service: 'dot',
          status: 'down',
          latencyMs: total,
          totalLatencyMs: total,
          connectionLatencyMs: connectionLatencyMs || total,
          dnsQueryLatencyMs: queryStartTime > 0 ? Date.now() - queryStartTime : 0,
          timestamp,
          checkedAtIso: timestamp,
          target: TARGET_CONFIG.DOT_HOST,
          port: TARGET_CONFIG.DOT_PORT,
          error: sanitizeErrorMessage(err),
        });
      });

      socket.on('close', (hadError) => {
        if (!resolved) {
          const total = Date.now() - startTime;
          finish({
            service: 'dot',
            status: 'down',
            latencyMs: total,
            totalLatencyMs: total,
            connectionLatencyMs: connectionLatencyMs || total,
            dnsQueryLatencyMs: queryStartTime > 0 ? Date.now() - queryStartTime : 0,
            timestamp,
            checkedAtIso: timestamp,
            target: TARGET_CONFIG.DOT_HOST,
            port: TARGET_CONFIG.DOT_PORT,
            error: hadError ? 'Socket closed with transmission error' : 'Socket closed before response received',
          });
        }
      });
    } catch (outerErr) {
      const total = Date.now() - startTime;
      finish({
        service: 'dot',
        status: 'down',
        latencyMs: total,
        totalLatencyMs: total,
        connectionLatencyMs: connectionLatencyMs || total,
        dnsQueryLatencyMs: 0,
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
 * Sends POST request with wire format body and application/dns-message content-type.
 * Measures connection setup (TCP+TLS handshake) and pure DNS query round-trip latency
 * after reading the complete response body.
 */
export async function probeDoH(): Promise<SingleProbeResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const queryId = Math.floor(Math.random() * 0xffff);
  const dnsQuery = buildDnsQuery(TARGET_CONFIG.TEST_DOMAIN, queryId);

  return new Promise<SingleProbeResult>((resolve) => {
    let timer: NodeJS.Timeout | null = null;
    let req: import('node:http').ClientRequest | null = null;
    let resolved = false;
    let connectionLatencyMs = 0;
    let queryStartTime = 0;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (req) {
        try {
          req.removeAllListeners();
          req.destroy();
        } catch {
          // ignore
        }
        req = null;
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
        const total = Date.now() - startTime;
        finish({
          service: 'doh',
          status: 'down',
          latencyMs: total,
          totalLatencyMs: total,
          connectionLatencyMs: connectionLatencyMs || total,
          dnsQueryLatencyMs: queryStartTime > 0 ? Date.now() - queryStartTime : 0,
          timestamp,
          checkedAtIso: timestamp,
          target: TARGET_CONFIG.DOH_URL,
          port: 443,
          error: `HTTP/TLS connection or query timed out (${TARGET_CONFIG.TIMEOUT_MS}ms)`,
        });
      }, TARGET_CONFIG.TIMEOUT_MS);

      const dohUrl = new URL(TARGET_CONFIG.DOH_URL);

      req = https.request(
        {
          hostname: dohUrl.hostname,
          port: dohUrl.port ? Number(dohUrl.port) : 443,
          path: `${dohUrl.pathname}${dohUrl.search}`,
          method: 'POST',
          headers: {
            'Accept': 'application/dns-message',
            'Content-Type': 'application/dns-message',
            'Content-Length': dnsQuery.length,
            'User-Agent': 'WibufyDNS-Probe/1.0 (https://dns.wibufy.biz.id)',
          },
          minVersion: 'TLSv1.2',
          servername: dohUrl.hostname,
          rejectUnauthorized: true,
        },
        (res) => {
          const chunks: Buffer[] = [];

          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });

          res.on('end', () => {
            const endTime = Date.now();
            const totalLatency = Math.max(1, endTime - startTime);
            const dnsQueryLatency = queryStartTime > 0 ? Math.max(1, endTime - queryStartTime) : totalLatency;
            const connLatency = connectionLatencyMs || Math.max(1, totalLatency - dnsQueryLatency);

            if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
              finish({
                service: 'doh',
                status: 'down',
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOH_URL,
                port: 443,
                error: `HTTP ${res.statusCode} ${res.statusMessage || ''}`.trim(),
              });
              return;
            }

            const contentType = (res.headers['content-type'] as string) || '';
            if (!contentType.includes('application/dns-message')) {
              finish({
                service: 'doh',
                status: 'down',
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOH_URL,
                port: 443,
                error: `Unexpected Content-Type: ${contentType.slice(0, 50)} (expected application/dns-message)`,
              });
              return;
            }

            const body = Buffer.concat(chunks);
            try {
              const parsed = parseDnsResponse(new Uint8Array(body));

              if (parsed.header.id !== queryId) {
                finish({
                  service: 'doh',
                  status: 'down',
                  latencyMs: totalLatency,
                  totalLatencyMs: totalLatency,
                  connectionLatencyMs: connLatency,
                  dnsQueryLatencyMs: dnsQueryLatency,
                  timestamp,
                  checkedAtIso: timestamp,
                  target: TARGET_CONFIG.DOH_URL,
                  port: 443,
                  error: `Transaction ID mismatch (expected ${queryId}, got ${parsed.header.id})`,
                });
                return;
              }

              if (!parsed.isSuccess) {
                finish({
                  service: 'doh',
                  status: 'down',
                  latencyMs: totalLatency,
                  totalLatencyMs: totalLatency,
                  connectionLatencyMs: connLatency,
                  dnsQueryLatencyMs: dnsQueryLatency,
                  timestamp,
                  checkedAtIso: timestamp,
                  target: TARGET_CONFIG.DOH_URL,
                  port: 443,
                  rcode: parsed.rcodeName,
                  error: `DNS returned non-success code: ${parsed.rcodeName}`,
                });
                return;
              }

              const isQueryDegraded = dnsQueryLatency >= TARGET_CONFIG.DNS_QUERY_DEGRADED_THRESHOLD_MS;
              const isTransportHigh = totalLatency >= TARGET_CONFIG.LATENCY_DEGRADED_THRESHOLD_MS;

              finish({
                service: 'doh',
                status: isQueryDegraded ? 'degraded' : 'operational',
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOH_URL,
                port: 443,
                rcode: parsed.rcodeName,
                answersCount: parsed.header.ancount,
                error: isQueryDegraded
                  ? `Waktu respons kueri DNS tinggi (${dnsQueryLatency}ms >= ambang ${TARGET_CONFIG.DNS_QUERY_DEGRADED_THRESHOLD_MS}ms)`
                  : isTransportHigh
                  ? `Koneksi probe lambat karena jarak geografis (${totalLatency}ms total, kueri DNS normal ${dnsQueryLatency}ms)`
                  : undefined,
              });
            } catch (parseErr) {
              finish({
                service: 'doh',
                status: 'down',
                latencyMs: totalLatency,
                totalLatencyMs: totalLatency,
                connectionLatencyMs: connLatency,
                dnsQueryLatencyMs: dnsQueryLatency,
                timestamp,
                checkedAtIso: timestamp,
                target: TARGET_CONFIG.DOH_URL,
                port: 443,
                error: `Invalid DNS response payload: ${sanitizeErrorMessage(parseErr)}`,
              });
            }
          });
        }
      );

      req.on('socket', (socket) => {
        socket.on('secureConnect', () => {
          connectionLatencyMs = Math.max(1, Date.now() - startTime);
          queryStartTime = Date.now();
        });
      });

      req.on('error', (err) => {
        const total = Date.now() - startTime;
        finish({
          service: 'doh',
          status: 'down',
          latencyMs: total,
          totalLatencyMs: total,
          connectionLatencyMs: connectionLatencyMs || total,
          dnsQueryLatencyMs: queryStartTime > 0 ? Date.now() - queryStartTime : 0,
          timestamp,
          checkedAtIso: timestamp,
          target: TARGET_CONFIG.DOH_URL,
          port: 443,
          error: sanitizeErrorMessage(err),
        });
      });

      req.write(Buffer.from(dnsQuery));
      req.end();
    } catch (err) {
      const total = Date.now() - startTime;
      finish({
        service: 'doh',
        status: 'down',
        latencyMs: total,
        totalLatencyMs: total,
        connectionLatencyMs: connectionLatencyMs || total,
        dnsQueryLatencyMs: 0,
        timestamp,
        checkedAtIso: timestamp,
        target: TARGET_CONFIG.DOH_URL,
        port: 443,
        error: sanitizeErrorMessage(err),
      });
    }
  });
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
        overallText = `Layanan Mengalami Degradasi (Waktu Kueri DoT ${dotResult.dnsQueryLatencyMs ?? dotResult.latencyMs}ms & DoH ${dohResult.dnsQueryLatencyMs ?? dohResult.latencyMs}ms)`;
      } else if (isDotDegraded) {
        overallText = `Layanan Mengalami Degradasi (Waktu Kueri DoT: ${dotResult.dnsQueryLatencyMs ?? dotResult.latencyMs}ms)`;
      } else {
        overallText = `Layanan Mengalami Degradasi (Waktu Kueri DoH: ${dohResult.dnsQueryLatencyMs ?? dohResult.latencyMs}ms)`;
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
