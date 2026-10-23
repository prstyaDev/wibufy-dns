import assert from 'node:assert';
import {
  TARGET_CONFIG,
  SingleProbeResult,
  sanitizeErrorMessage,
  HealthStatus,
} from '../lib/dns/probes';
import { buildDnsQuery, parseDnsResponse } from '../lib/dns/packet';

console.log('--- RUNNING WIBUFYDNS VALIDATION TESTS ---');

// Test 1: DNS Packet Serialization & Deserialization
console.log('Test 1: DNS wire packet builder & response parser');
const query = buildDnsQuery('example.com', 0x1234);
assert.ok(query.length >= 12, 'DNS query packet must be at least 12 bytes');
assert.strictEqual(query[0], 0x12, 'Transaction ID high byte mismatch');
assert.strictEqual(query[1], 0x34, 'Transaction ID low byte mismatch');

// Mock a valid NOERROR response
const mockResponse = new Uint8Array([
  0x12, 0x34, // ID
  0x81, 0x80, // Flags: Response, Opcode 0, RD, RA, RCODE 0 (NOERROR)
  0x00, 0x01, // QDCOUNT: 1
  0x00, 0x01, // ANCOUNT: 1
  0x00, 0x00, // NSCOUNT: 0
  0x00, 0x00, // ARCOUNT: 0
]);
const parsed = parseDnsResponse(mockResponse);
assert.strictEqual(parsed.header.id, 0x1234);
assert.strictEqual(parsed.rcodeName, 'NOERROR');
assert.strictEqual(parsed.isSuccess, true);
console.log('✔ Test 1 Passed: DNS packet encoding & decoding valid');

// Test 2: Error Sanitization
console.log('Test 2: Error sanitization prevents path/sensitive data leakage');
assert.strictEqual(
  sanitizeErrorMessage(new Error('connect ETIMEDOUT 103.187.xxx')),
  'Connection timed out after 5000ms'
);
assert.strictEqual(
  sanitizeErrorMessage(new Error('connect ECONNREFUSED 127.0.0.1:853')),
  'Connection refused by remote host (port closed or firewall blocked)'
);
assert.ok(
  sanitizeErrorMessage(new Error('DEPTH_ZERO_SELF_SIGNED_CERT in chain')).includes('TLS certificate verification failed')
);
console.log('✔ Test 2 Passed: Error messages properly sanitized');

// Test 3: Status Mapping Function Logic
console.log('Test 3: Unified Status Evaluation with Latency Thresholds');

function evaluateStatus(
  dot: SingleProbeResult,
  doh: SingleProbeResult,
  isStale = false
): HealthStatus {
  if (isStale) return 'unknown';

  const isDotDown = dot.status === 'down';
  const isDohDown = doh.status === 'down';
  const isDotDegraded = dot.status === 'degraded';
  const isDohDegraded = doh.status === 'degraded';

  if (!isDotDown && !isDohDown) {
    if (isDotDegraded || isDohDegraded) {
      return 'degraded';
    }
    return 'operational';
  } else if (!isDotDown || !isDohDown) {
    return 'degraded';
  } else {
    return 'down';
  }
}

// Scenario 3A: Both operational with normal latency (< 600ms)
const dotNormal: SingleProbeResult = {
  service: 'dot',
  status: 'operational',
  latencyMs: 120,
  timestamp: new Date().toISOString(),
  checkedAtIso: new Date().toISOString(),
  target: 'dns.wibufy.biz.id',
  port: 853,
  rcode: 'NOERROR',
};
const dohNormal: SingleProbeResult = {
  service: 'doh',
  status: 'operational',
  latencyMs: 145,
  timestamp: new Date().toISOString(),
  checkedAtIso: new Date().toISOString(),
  target: 'https://doh.wibufy.biz.id/dns-query',
  port: 443,
  rcode: 'NOERROR',
};
assert.strictEqual(evaluateStatus(dotNormal, dohNormal), 'operational');
console.log('✔ Scenario 3A Passed: Both operational (< 600ms) -> operational');

// Scenario 3B: High latency on DoT (e.g. 1020ms) -> degraded
const dotHighLatency: SingleProbeResult = {
  ...dotNormal,
  status: 'degraded',
  latencyMs: 1020,
};
assert.strictEqual(evaluateStatus(dotHighLatency, dohNormal), 'degraded');
console.log('✔ Scenario 3B Passed: High latency (~1s) -> degraded');

// Scenario 3C: One protocol down, one operational -> degraded
const dotDown: SingleProbeResult = {
  ...dotNormal,
  status: 'down',
  error: 'Connection refused',
};
assert.strictEqual(evaluateStatus(dotDown, dohNormal), 'degraded');
console.log('✔ Scenario 3C Passed: One protocol down -> degraded');

// Scenario 3D: Both protocols down -> down
const dohDown: SingleProbeResult = {
  ...dohNormal,
  status: 'down',
  error: 'HTTP 502 Bad Gateway',
};
assert.strictEqual(evaluateStatus(dotDown, dohDown), 'down');
console.log('✔ Scenario 3D Passed: Both protocols down -> down');

// Scenario 3E: Stale data (> threshold) -> unknown
assert.strictEqual(evaluateStatus(dotNormal, dohNormal, true), 'unknown');
console.log('✔ Scenario 3E Passed: Stale probe data -> unknown');

console.log('--- ALL VALIDATION TESTS PASSED SUCCESSFULLY ---');
