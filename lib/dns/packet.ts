/**
 * Pure TypeScript DNS Wire Format Packet Encoder and Decoder (RFC 1035 & RFC 7858)
 * Designed for standard A record queries without external heavy dependencies.
 */

export interface DnsHeader {
  id: number;
  qr: number;     // 0 = query, 1 = response
  opcode: number; // 0 = standard query
  aa: number;     // Authoritative answer
  tc: number;     // TrunCation
  rd: number;     // Recursion Desired
  ra: number;     // Recursion Available
  z: number;      // Reserved
  rcode: number;  // Response code (0: NOERROR, 1: FORMERR, 2: SERVFAIL, 3: NXDOMAIN, 5: REFUSED)
  qdcount: number;
  ancount: number;
  nscount: number;
  arcount: number;
}

export interface DnsParsedResponse {
  header: DnsHeader;
  rcodeName: string;
  isSuccess: boolean;
  rawLength: number;
}

const RCODE_MAP: Record<number, string> = {
  0: 'NOERROR',
  1: 'FORMERR',
  2: 'SERVFAIL',
  3: 'NXDOMAIN',
  4: 'NOTIMP',
  5: 'REFUSED',
  6: 'YXDOMAIN',
  7: 'YXRRSET',
  8: 'NXRRSET',
  9: 'NOTAUTH',
  10: 'NOTZONE',
};

/**
 * Encodes a standard DNS query (Type A, Class IN, RD=1) for a given hostname
 */
export function buildDnsQuery(hostname: string = 'example.com', queryId: number = 0x5a3c): Uint8Array {
  // Normalize hostname
  const cleanHost = hostname.trim().replace(/\.+$/, '');
  const labels = cleanHost.split('.');

  // Calculate length: 12 bytes header + labels length + 1 (null byte) + 4 (qtype + qclass)
  let qnameLen = 0;
  for (const label of labels) {
    qnameLen += 1 + new TextEncoder().encode(label).length;
  }
  qnameLen += 1; // null root byte

  const totalLength = 12 + qnameLen + 4;
  const buffer = new Uint8Array(totalLength);
  const view = new DataView(buffer.buffer);

  // 1. Transaction ID
  view.setUint16(0, queryId, false);

  // 2. Flags: 0x0100 (Standard query, Recursion Desired = 1)
  view.setUint16(2, 0x0100, false);

  // 3. QDCOUNT = 1
  view.setUint16(4, 1, false);
  // ANCOUNT = 0
  view.setUint16(6, 0, false);
  // NSCOUNT = 0
  view.setUint16(8, 0, false);
  // ARCOUNT = 0
  view.setUint16(10, 0, false);

  // 4. QNAME
  let offset = 12;
  const encoder = new TextEncoder();
  for (const label of labels) {
    const encodedLabel = encoder.encode(label);
    buffer[offset++] = encodedLabel.length;
    buffer.set(encodedLabel, offset);
    offset += encodedLabel.length;
  }
  buffer[offset++] = 0; // null root byte

  // 5. QTYPE = 1 (A Record)
  view.setUint16(offset, 1, false);
  offset += 2;

  // 6. QCLASS = 1 (IN - Internet)
  view.setUint16(offset, 1, false);

  return buffer;
}

/**
 * Parses raw DNS wire response buffer and extracts header status
 */
export function parseDnsResponse(buffer: Uint8Array): DnsParsedResponse {
  if (buffer.length < 12) {
    throw new Error(`DNS wire response is too short (${buffer.length} bytes, minimum 12 bytes required)`);
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const id = view.getUint16(0, false);
  const flags = view.getUint16(2, false);
  const qdcount = view.getUint16(4, false);
  const ancount = view.getUint16(6, false);
  const nscount = view.getUint16(8, false);
  const arcount = view.getUint16(10, false);

  const qr = (flags >> 15) & 0x01;
  const opcode = (flags >> 11) & 0x0f;
  const aa = (flags >> 10) & 0x01;
  const tc = (flags >> 9) & 0x01;
  const rd = (flags >> 8) & 0x01;
  const ra = (flags >> 7) & 0x01;
  const z = (flags >> 4) & 0x07;
  const rcode = flags & 0x0f;

  const rcodeName = RCODE_MAP[rcode] || `UNKNOWN(${rcode})`;

  // A successful response has QR=1 (it is a response) and RCODE is 0 (NOERROR) or 3 (NXDOMAIN is also a valid response from server)
  const isSuccess = qr === 1 && (rcode === 0 || rcode === 3);

  return {
    header: {
      id,
      qr,
      opcode,
      aa,
      tc,
      rd,
      ra,
      z,
      rcode,
      qdcount,
      ancount,
      nscount,
      arcount,
    },
    rcodeName,
    isSuccess,
    rawLength: buffer.length,
  };
}
