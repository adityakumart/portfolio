/**
 * Utility to safely escape user input for regular expressions, preventing ReDoS
 * (Regular Expression Denial of Service) attacks and invalid syntax exceptions.
 */
export function escapeRegex(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function safeRegex(input: string, flags = 'i'): RegExp {
  return new RegExp(escapeRegex(input), flags);
}
