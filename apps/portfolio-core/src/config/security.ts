/**
 * Centralized security configuration and secret validator.
 * Prevents execution with missing or insecure default secrets in production.
 */

const INSECURE_DEFAULT_SECRETS = [
  'your-super-secret-jwt-key',
  'supersecretlocaljwtkey1234567890!',
  'secret',
  'jwtsecret',
];

export function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET'];
  const isProd = process.env['NODE_ENV'] === 'production' || process.env['VERCEL'] === '1';

  if (!secret) {
    if (isProd) {
      throw new Error('[SECURITY FATAL] JWT_SECRET environment variable is missing in production!');
    }
    console.warn('[SECURITY WARNING] JWT_SECRET is not set. Using temporary local dev secret. DO NOT USE IN PRODUCTION.');
    return 'dev-only-local-secret-key-32-chars-minimum-needed!';
  }

  if (isProd && INSECURE_DEFAULT_SECRETS.includes(secret)) {
    throw new Error('[SECURITY FATAL] Insecure default JWT_SECRET detected in production! Please provide a strong random secret.');
  }

  return secret;
}

export function getRefreshSecret(): string {
  return process.env['REFRESH_SECRET'] || getJwtSecret();
}

export function getKycSecret(): string {
  return process.env['KYC_ENCRYPTION_KEY'] || getJwtSecret();
}
