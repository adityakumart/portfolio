/**
 * Masks sensitive authorization tokens for debug/audit logging hygiene.
 * Keeps the first 6 and last 4 characters visible, replacing the sensitive core with ellipsis.
 */
export function maskToken(token: string | null | undefined): string {
  if (!token) return 'null';
  if (token.length < 16) return '***';
  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}
