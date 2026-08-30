import { Injectable } from '@angular/core';

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
  [key: string]: unknown;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
  signatureRaw: string;
}

export interface ClaimInfo {
  key: string;
  name: string;
  value: unknown;
  formattedValue: string;
  description: string;
  isRegistered: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {
  // Dictionary of standard JWT Registered Claims and common public claims
  private readonly CLAIMS_DICTIONARY: Record<string, { name: string; description: string }> = {
    iss: { name: 'Issuer', description: 'Identifies the principal that issued the JWT.' },
    sub: { name: 'Subject', description: 'Identifies the principal that is the subject of the JWT.' },
    aud: { name: 'Audience', description: 'Identifies the recipients that the JWT is intended for.' },
    exp: { name: 'Expiration Time', description: 'Identifies the expiration time on or after which the JWT must not be accepted for processing.' },
    nbf: { name: 'Not Before', description: 'Identifies the time before which the JWT must not be accepted for processing.' },
    iat: { name: 'Issued At', description: 'Identifies the time at which the JWT was issued.' },
    jti: { name: 'JWT ID', description: 'Provides a unique identifier for the JWT.' },
    email: { name: 'Email', description: 'The user\'s email address.' },
    email_verified: { name: 'Email Verified', description: 'Indicates whether the user\'s email address has been verified.' },
    name: { name: 'Full Name', description: 'The user\'s full name.' },
    given_name: { name: 'Given Name', description: 'The given name(s) or first name(s) of the user.' },
    family_name: { name: 'Family Name', description: 'The surname(s) or last name(s) of the user.' },
    picture: { name: 'Picture URL', description: 'URL of the user\'s profile picture.' },
    locale: { name: 'Locale', description: 'The user\'s locale/language setting.' },
    roles: { name: 'Roles', description: 'The roles assigned to the user.' },
    role: { name: 'Role', description: 'The role assigned to the user.' },
    scope: { name: 'Scope', description: 'The scope of permissions granted to the token.' },
    scp: { name: 'Scope (Abbreviation)', description: 'The abbreviated scope of permissions granted.' },
    auth_time: { name: 'Authentication Time', description: 'The time when the user authentication occurred.' },
    acr: { name: 'Authentication Context Class Reference', description: 'Identifies the authentication context class reference.' },
    amr: { name: 'Authentication Methods References', description: 'Identifies the authentication methods references used.' },
    azp: { name: 'Authorized Party', description: 'Identifies the party to which the ID token was issued.' },
    nonce: { name: 'Nonce', description: 'A string value used to associate a client session with an ID Token, and to mitigate replay attacks.' }
  };

  /**
   * Decodes a JWT token string into structured JSON objects for the Header and Payload,
   * along with the raw signature string.
   * 
   * @param token Raw JWT string
   * @returns Decoded header, payload, and raw signature segments
   */
  decodeToken(token: string): DecodedJwt {
    if (!token) {
      throw new Error('Token is empty.');
    }

    const trimmedToken = token.trim();
    const parts = trimmedToken.split('.');

    // A valid JWT consists of exactly three parts separated by periods
    if (parts.length !== 3) {
      throw new Error(`Invalid token format. A JWT must contain exactly 3 dot-separated parts. Found ${parts.length} part(s).`);
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let headerJson: JwtHeader;
    let payloadJson: JwtPayload;

    try {
      const decodedHeader = this.base64UrlDecode(headerB64);
      headerJson = JSON.parse(decodedHeader) as JwtHeader;
    } catch (error) {
      throw new Error(`Failed to decode/parse Header segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      const decodedPayload = this.base64UrlDecode(payloadB64);
      payloadJson = JSON.parse(decodedPayload) as JwtPayload;
    } catch (error) {
      throw new Error(`Failed to decode/parse Payload segment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      header: headerJson,
      payload: payloadJson,
      signature: signatureB64,
      headerRaw: headerB64,
      payloadRaw: payloadB64,
      signatureRaw: signatureB64
    };
  }

  /**
   * Safely decodes a Base64Url-encoded string.
   * Uses the decodeURIComponent(escape(window.atob(...))) sequence to support UTF-8 (Unicode) correctly.
   * 
   * CRITICAL EXPLANATION:
   * - window.atob() decodes base64 strings byte-by-byte into a binary string where each character represents a single byte.
   * - If the original string had multi-byte UTF-8 characters, direct character conversion would result in corruption or errors.
   * - escape() converts the binary string characters into percent-encoded hex sequences (%xx).
   * - decodeURIComponent() translates the percent-encoded sequences back to the native UTF-8 representation safely.
   */
  private base64UrlDecode(str: string): string {
    // 1. Replace base64url specific characters back to standard base64 (+ and /)
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // 2. Pad base64 string with '=' so its length is a multiple of 4
    const padLength = (4 - (base64.length % 4)) % 4;
    base64 += '='.repeat(padLength);

    try {
      // 3. Decode base64 to binary string
      const binaryString = window.atob(base64);
      // 4. Safely escape non-ASCII bytes to percent-encoded values
      const percentEncoded = escape(binaryString);
      // 5. Safely decode as UTF-8 string
      return decodeURIComponent(percentEncoded);
    } catch {
      throw new Error('Invalid Base64Url character encoding or padding.');
    }
  }

  /**
   * Maps claims found in the JWT payload to their corresponding descriptions,
   * and formats values (especially timestamps) into user-friendly strings.
   * 
   * @param payload Decoded JWT Payload object
   * @returns List of claims mapped to names and descriptions
   */
  getClaims(payload: JwtPayload): ClaimInfo[] {
    const claims: ClaimInfo[] = [];

    if (!payload || typeof payload !== 'object') {
      return claims;
    }

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      const registeredClaim = this.CLAIMS_DICTIONARY[key];
      
      const name = registeredClaim ? registeredClaim.name : key;
      const description = registeredClaim ? registeredClaim.description : 'Custom public/private claim.';
      const isRegistered = !!registeredClaim;
      const formattedValue = this.formatClaimValue(key, value);

      claims.push({
        key,
        name,
        value,
        formattedValue,
        description,
        isRegistered
      });
    });

    // Sort registered claims first, then alphabetically
    return claims.sort((a, b) => {
      if (a.isRegistered && !b.isRegistered) return -1;
      if (!a.isRegistered && b.isRegistered) return 1;
      return a.key.localeCompare(b.key);
    });
  }

  /**
   * Formats a claim value to a human-readable string representation.
   * Unix epoch timestamps (seconds since 1970) for date-specific fields
   * are translated to readable calendar strings.
   */
  private formatClaimValue(key: string, value: unknown): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    const dateKeys = ['exp', 'iat', 'nbf', 'auth_time'];
    if (dateKeys.includes(key) && typeof value === 'number') {
      try {
        const date = new Date(value * 1000);
        return `${value} (${date.toLocaleString()})`;
      } catch {
        return String(value);
      }
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}
