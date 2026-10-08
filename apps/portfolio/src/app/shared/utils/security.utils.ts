import SHA256 from 'crypto-js/sha256';

/**
 * Masks sensitive authorization tokens for debug/audit logging hygiene.
 * Keeps the first 6 and last 4 characters visible, replacing the sensitive core with ellipsis.
 */
export function maskToken(token: string | null | undefined): string {
  if (!token) return 'null';
  if (token.length < 16) return '***';
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

/**
 * Measure 2 & Phase 4: Signed Storage Envelope with Client TTL
 * Protects stored payloads against replay attacks and unauthorized client-side tampering.
 */
export interface SecureStorageEnvelope<T> {
  payload: T;
  storedAt: number;        // Epoch timestamp (ms)
  ttlMs: number;           // Maximum client storage lifetime (e.g. 2 hours or 7 days)
  checksum: string;        // SHA-256 hash of payload JSON + storedAt
}

/**
 * Computes deterministic SHA-256 integrity checksum for a payload and timestamp.
 */
export function generateStorageChecksum<T>(payload: T, storedAt: number): string {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return SHA256(serialized + storedAt).toString();
}

/**
 * Creates a cryptographically signed storage envelope.
 *
 * @param payload The raw or minimized data object/string to protect
 * @param ttlMs Client-side time-to-live in milliseconds (default: 2 hours)
 */
export function createStorageEnvelope<T>(
  payload: T,
  ttlMs: number = 2 * 60 * 60 * 1000,
): SecureStorageEnvelope<T> {
  const storedAt = Date.now();
  const checksum = generateStorageChecksum(payload, storedAt);
  return {
    payload,
    storedAt,
    ttlMs,
    checksum,
  };
}

/**
 * Verifies a storage envelope's client-side TTL and SHA-256 cryptographic checksum.
 * Returns the unwrapped payload if valid, or null if expired/tampered.
 */
export function verifyStorageEnvelope<T>(
  envelope: unknown,
): T | null {
  if (!envelope || typeof envelope !== 'object') {
    return null;
  }

  const candidate = envelope as Partial<SecureStorageEnvelope<T>>;
  if (
    typeof candidate.storedAt !== 'number' ||
    typeof candidate.ttlMs !== 'number' ||
    typeof candidate.checksum !== 'string' ||
    candidate.payload === undefined
  ) {
    return null;
  }

  const now = Date.now();

  // 1. Check client TTL
  if (now - candidate.storedAt > candidate.ttlMs) {
    console.warn('[Security] Client storage envelope expired.');
    return null;
  }

  // 2. Validate cryptographic checksum
  const expectedChecksum = generateStorageChecksum(candidate.payload, candidate.storedAt);
  if (candidate.checksum !== expectedChecksum) {
    console.warn('[Security] Envelope checksum mismatch. Data modified externally.');
    return null;
  }

  return candidate.payload as T;
}

/**
 * Unwraps data which may be either enveloped or legacy raw format.
 * Returns null if an envelope was present but invalid/expired/tampered.
 */
export function unwrapStoragePayload<T>(
  data: unknown,
): { payload: T; wasEnveloped: boolean } | null {
  if (data === null || data === undefined) return null;

  if (
    typeof data === 'object' &&
    'payload' in data &&
    'storedAt' in data &&
    'ttlMs' in data &&
    'checksum' in data
  ) {
    const verified = verifyStorageEnvelope<T>(data);
    if (verified === null) {
      return null;
    }
    return { payload: verified, wasEnveloped: true };
  }

  // Legacy pre-envelope format pass-through
  return { payload: data as T, wasEnveloped: false };
}
