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

/**
 * Generic KYC provider client identification.
 */
export function getKycClientId(): string {
  return (
    process.env['KYC_CLIENT_ID'] ||
    process.env['CASHFREE_CLIENT_ID'] ||
    process.env['CASHFREE_APP_ID'] ||
    ''
  );
}

/**
 * Generic KYC provider client authentication secret.
 */
export function getKycClientSecret(): string {
  return (
    process.env['KYC_CLIENT_SECRET'] ||
    process.env['CASHFREE_CLIENT_SECRET'] ||
    ''
  );
}

/**
 * Generic KYC provider base gateway URL.
 */
export function getKycBaseUrl(): string {
  if (process.env['KYC_BASE_URL']) {
    return process.env['KYC_BASE_URL'].replace(/\/+$/, '');
  }
  if (process.env['CASHFREE_BASE_URL']) {
    return process.env['CASHFREE_BASE_URL'].replace(/\/+$/, '');
  }
  return isKycSandbox()
    ? 'https://sandbox.cashfree.com/verification'
    : 'https://api.cashfree.com/verification';
}

/**
 * Determines whether KYC operates in mock/sandbox mode.
 */
export function isKycSandbox(): boolean {
  if (
    process.env['KYC_SANDBOX_MODE'] === 'true' ||
    process.env['CASHFREE_SANDBOX_MODE'] === 'true' ||
    process.env['SUREPASS_SANDBOX_MODE'] === 'true'
  ) {
    return true;
  }
  const clientId = getKycClientId();
  const clientSecret = getKycClientSecret();
  if (!clientId || !clientSecret) {
    return true;
  }
  return (
    clientId === 'sandbox' ||
    clientId === 'mock' ||
    clientSecret === 'sandbox' ||
    clientSecret === 'mock'
  );
}

/**
 * @deprecated Use generic `getKycClientId()` instead.
 */
export function getSurepassToken(): string {
  return process.env['SUREPASS_API_TOKEN'] || getKycClientId();
}

/**
 * @deprecated Use generic `getKycBaseUrl()` instead.
 */
export function getSurepassBaseUrl(): string {
  return (process.env['SUREPASS_BASE_URL'] || getKycBaseUrl()).replace(/\/+$/, '');
}

/**
 * @deprecated Use generic `isKycSandbox()` instead.
 */
export function isSurepassSandbox(): boolean {
  return isKycSandbox();
}
