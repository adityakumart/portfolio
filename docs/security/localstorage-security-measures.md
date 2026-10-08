# LocalStorage & Client-Side Session Security Measures

> **Document Version:** 1.0  
> **Target Modules:** User Module (`apps/portfolio`), RR Module (`apps/portfolio/src/app/modules/rr`)  
> **Status:** Recommended Roadmap for Future Implementation  

---

## 1. Executive Summary & Threat Vectors

Storing authentication tokens and user state in browser storage (`localStorage` / `sessionStorage`) introduces specific security considerations. Understanding the threat models enables targeted, defense-in-depth mitigations:

| Threat Vector | Description | Primary Defense |
| :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | Malicious scripts injected into the DOM reading or tampering with client storage. | Strict Content Security Policy (CSP), data minimization, tamper detection. |
| **Malicious Extensions** | Browser extensions with broad host permissions scraping plain credentials. | Key obfuscation, AES storage encryption, device-bound keys. |
| **Physical / Shared Devices** | Unattended laptop or shared terminal allowing someone to inspect DevTools storage. | Inactivity auto-lock, `sessionStorage` preference, short client TTL. |
| **Replay / Session Forgery** | An attacker copying ciphertext from one machine/session and pasting it into another. | Device-bound entropy salting, cryptographic HMAC verification. |

---

## 2. Recommended Security Measures

### Measure 1: Dynamic Device/Browser Fingerprint-Bound Encryption Keys

#### The Risk
If the AES encryption key is a fixed static string embedded in client bundles, an attacker who extracts the ciphertext can decrypt it using the same publicly accessible source code.

#### The Mitigation
Salt or derive the encryption key using client-specific entropy that only exists on that specific browser and device (user agent, screen dimensions, origin, and hardware concurrency). 

#### Implementation Example
```typescript
private getDeviceBoundKey(): string {
  if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
    return this.ENCRYPTION_KEY;
  }

  try {
    const screenWidth = typeof screen !== 'undefined' ? screen.width : 0;
    const screenHeight = typeof screen !== 'undefined' ? screen.height : 0;
    // Normalize screen dimensions so mobile device rotation between portrait and landscape does not invalidate the key
    const screenDim = `${Math.max(screenWidth, screenHeight)}x${Math.min(screenWidth, screenHeight)}`;
    const colorDepth = typeof screen !== 'undefined' ? screen.colorDepth : 24;
    const concurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 2 : 2;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
    const origin = window.location ? window.location.origin : '';

    const deviceEntropy = [
      origin,
      userAgent,
      screenDim,
      colorDepth,
      concurrency,
    ].join('::');

    return `${this.ENCRYPTION_KEY}::${deviceEntropy}`;
  } catch {
    return this.ENCRYPTION_KEY;
  }
}
```
*Result:* Ciphertext copied to another laptop, browser profile, or mobile device will fail decryption immediately, protecting against off-device replay attacks.

---

### Measure 2: Cryptographic Integrity Envelope & Client-Side TTL

> **Status:** **Completed**

#### The Risk
Encryption conceals the contents of data, but without an integrity tag, an attacker can substitute an older valid ciphertext (e.g., when they had admin privileges) into storage to revive expired privileges.

#### The Mitigation
Wrap the stored payload in an envelope containing a generation timestamp, client time-to-live (TTL), and a cryptographic SHA-256 integrity checksum. Discard and wipe storage if the envelope has expired or been modified.

#### Data Contract
```typescript
export interface SecureStorageEnvelope<T> {
  payload: T;
  storedAt: number;        // Epoch timestamp (ms)
  ttlMs: number;           // Maximum client storage lifetime (e.g. 2 hours)
  checksum: string;        // SHA-256 hash of payload + storedAt
}
```

#### Verification Flow
```typescript
private verifyEnvelope<T>(envelope: SecureStorageEnvelope<T>): T | null {
  const now = Date.now();
  // 1. Check client TTL
  if (now - envelope.storedAt > envelope.ttlMs) {
    console.warn('[Security] Client storage envelope expired.');
    return null;
  }

  // 2. Validate cryptographic checksum
  const expectedChecksum = SHA256(JSON.stringify(envelope.payload) + envelope.storedAt).toString();
  if (envelope.checksum !== expectedChecksum) {
    console.warn('[Security] Envelope checksum mismatch. Data modified externally.');
    return null;
  }

  return envelope.payload;
}
```

---

### Measure 3: Data Minimization (Never Store Sensitive PII)

> **Status:** **Completed**

#### The Principle
*What is never stored on the client disk can never be extracted by an attacker.*

#### What to Store in Browser Storage:
- `access_token` (Short-lived JWT)
- `expires_at` (Expiration epoch)
- `userId` / `id` (Opaque identifier)
- `role` (Active verified role)

#### What NOT to Store in Browser Storage:
- Full personal details (phone number, date of birth, home address)
- Passwords or raw credentials (never)
- Financial, payment, or banking information
- Unsanitized identity tokens or internal DB IDs

> Keep full user profiles strictly in **Angular reactive memory** (`signal<User>` or `signal<IRRUser>`), fetched dynamically from the server via `/auth/permissions`. When the browser tab closes or refreshes, sensitive memory state vanishes automatically.

---

### Measure 4: Obfuscate Storage Key Names

> **Status:** **Completed**

#### The Risk
Key names such as `portfolio_auth_session`, `rr_token`, or `loggedInUser` explicitly announce to malicious browser extensions or automated scrapers where credentials reside.

#### The Mitigation
Use non-descriptive, generic key identifiers:

| Old / Clear Key Name | Recommended Obfuscated Key Name |
| :--- | :--- |
| `portfolio_auth_session` | `_app_ctx_sig_v1` |
| `rr_user` | `_rr_state_u` |
| `rr_token` | `_rr_sec_tk` |
| `loggedInUser` | `_rr_pref_meta` |

---

### Measure 5: `sessionStorage` vs. `localStorage` ("Remember Me" Architecture)

> **Status:** **Completed**

#### The Risk
`localStorage` persists permanently on the client’s physical disk until explicitly deleted. If a user logs into a rental desk or workstation and forgets to log out, the session remains accessible.

#### The Best Practice
- **Default to `sessionStorage`**: Session data is automatically destroyed the moment the user closes the browser tab.
- **Opt-In `localStorage`**: Only persist to `localStorage` if the user explicitly checks a **"Remember Me"** checkbox during login.

```typescript
private getPreferredStorage(rememberMe: boolean): Storage {
  return rememberMe && window.localStorage ? localStorage : sessionStorage;
}
```

---

### Measure 6: Strict Content Security Policy (CSP)

> **Status:** **Completed**

#### The Threat
Any script successfully injected via XSS has identical permissions to your own application code and can read storage or hook network calls.

#### The Mitigation
Implement strict Content Security Policy headers (in reverse proxy / server responses or `<head>` meta tags):

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://portfolio-core.vercel.app http://localhost:3000;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
">
```

---

### Measure 7: Console & Audit Logging Hygiene

> **Status:** **Completed**

Ensure production code never dumps raw tokens or credentials into developer consoles, exception handlers, or telemetry:

```typescript
// Mask tokens before logging in debug traces:
export function maskToken(token: string | null | undefined): string {
  if (!token) return 'null';
  if (token.length < 16) return '***';
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

// Example usage:
console.debug(`[Auth] Authenticated session for user with token ${maskToken(token)}`);
```

---

### Measure 8: Architectural Gold Standard: `HttpOnly` Cookies for Refresh Tokens

> **Status:** **Completed**

#### The Concept
Move the long-lived `refresh_token` out of JavaScript storage completely and into an `HttpOnly`, `Secure`, `SameSite=Strict` cookie managed exclusively by the browser and backend.

```text
Set-Cookie: refresh_token=eyJhbGci...; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800
```

#### Benefits
- **XSS Immunity**: JavaScript running in the browser cannot read `HttpOnly` cookies under any circumstance.
- The client only holds the short-lived access token (expires in 15 minutes) in memory or encrypted storage.
- Token refresh happens automatically via browser cookie transmission when hitting `/api/auth/refresh`.

---

## 3. Implementation Priority Matrix

| Phase | Measure | Effort | Impact | Status |
| :---: | :--- | :---: | :---: | :---: |
| **Phase 1** | AES Encryption for Local Storage & Periodic Check | Medium | High | **Completed** |
| **Phase 2** | Obfuscate Storage Key Names | Low | Medium | **Completed** |
| **Phase 3** | Device-Bound Encryption Key Salting | Low | High | **Completed** |
| **Measure 3** | Data Minimization (Never Store Sensitive PII) | Low | High | **Completed** |
| **Measure 5** | `sessionStorage` vs. `localStorage` ("Remember Me") | Low | High | **Completed** |
| **Phase 4** | Signed Storage Envelope with Client TTL | Medium | High | **Completed** |
| **Phase 5** | Strict Content Security Policy (CSP) | Medium | Critical | **Completed** |
| **Measure 7** | Console & Audit Logging Hygiene | Low | Medium | **Completed** |
| **Phase 6** | `HttpOnly` Cookie Migration for Refresh Token | High | Critical | **Completed** |
