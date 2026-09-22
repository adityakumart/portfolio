import * as crypto from 'crypto';

/**
 * Enterprise-grade KYC Cryptographic Utility.
 * 
 * Implements AES-256-GCM authenticated encryption at rest for sensitive KYC records
 * (Aadhaar, Driving License). Includes HMAC-SHA256 blind indexing to enable duplicate
 * checking and indexing without exposing or searching plaintext data.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag
const PREFIX = 'enc:v1:';

// Derive 256-bit key deterministically from master secret and salt
const MASTER_SECRET = process.env['KYC_ENCRYPTION_KEY'] || process.env['JWT_SECRET'] || 'supersecretlocaljwtkey1234567890!';
const SALT = 'portfolio_rr_kyc_salt_2026';
const DERIVED_KEY = crypto.scryptSync(MASTER_SECRET, SALT, 32);
const BLIND_INDEX_KEY = crypto.scryptSync(MASTER_SECRET, 'portfolio_blind_index_salt', 32);

/**
 * Encrypts a sensitive KYC field using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptKYC(text: string): string {
  if (!text || text.startsWith(PREFIX)) {
    return text; // Idempotent: already encrypted or empty
  }

  // Handle mock placeholder explicitly
  if (text === '[Aadhaar Redacted]' || text === '[DL Redacted]') {
    return text;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, DERIVED_KEY, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM ciphertext payload back to plaintext.
 * Returns the original string if not in encrypted format.
 */
export function decryptKYC(encryptedText: string): string {
  if (!encryptedText || !encryptedText.startsWith(PREFIX)) {
    return encryptedText;
  }

  try {
    const payload = encryptedText.slice(PREFIX.length);
    const [ivHex, tagHex, cipherHex] = payload.split(':');

    if (!ivHex || !tagHex || !cipherHex) {
      throw new Error('Invalid KYC ciphertext format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, DERIVED_KEY, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: unknown) {
    console.error('KYC Decryption error:', (err as Error).message);
    return '****';
  }
}

/**
 * Generates an HMAC-SHA256 blind index hash for duplicate querying.
 * Normalizes digits/characters before hashing to ensure consistent lookups.
 */
export function generateBlindIndex(rawText: string): string {
  if (!rawText) return '';
  // Normalize: remove non-alphanumeric, convert to uppercase
  const normalized = rawText.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return crypto.createHmac('sha256', BLIND_INDEX_KEY).update(normalized).digest('hex');
}

/**
 * Masks an Aadhaar number to strictly display only the final 4 digits:
 * e.g., 'XXXX-XXXX-1234'
 */
export function maskAadhaar(rawOrEncrypted: string): string {
  if (!rawOrEncrypted) return '';
  if (rawOrEncrypted === '[Aadhaar Redacted]') return 'XXXX-XXXX-XXXX';

  const plain = decryptKYC(rawOrEncrypted);
  const digits = plain.replace(/\D/g, '');
  if (digits.length < 4) return 'XXXX-XXXX-XXXX';
  const last4 = digits.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

/**
 * Masks a Driving License string to strictly display only the final 4 characters:
 * e.g., 'XXXXXXXXXXXX-5678'
 */
export function maskDL(rawOrEncrypted: string): string {
  if (!rawOrEncrypted) return '';
  if (rawOrEncrypted === '[DL Redacted]') return 'XXXXXXXXXXXX-XXXX';

  const plain = decryptKYC(rawOrEncrypted);
  const clean = plain.trim();
  if (clean.length <= 4) return 'XXXX-XXXX-XXXX';
  const last4 = clean.slice(-4);
  const prefixLength = Math.max(8, clean.length - 4);
  return `${'X'.repeat(prefixLength)}-${last4}`;
}
