import { Pipe, PipeTransform } from '@angular/core';

/**
 * Masks an Aadhaar number so that only the last 4 digits are visible,
 * while the first 8 digits are masked (e.g., 'XXXX XXXX 1234').
 */
export function maskAadhar(
  value: string | number | null | undefined,
  maskChar = 'X'
): string {
  if (value === null || value === undefined) return '';
  const strVal = String(value).trim();
  if (
    !strVal ||
    strVal === '________' ||
    strVal === '____' ||
    strVal === 'N/A' ||
    strVal === '-'
  ) {
    return strVal;
  }

  // Extract only numeric digits
  const rawDigits = strVal.replace(/\D/g, '');
  if (!rawDigits) return strVal;

  if (rawDigits.length <= 4) {
    return rawDigits;
  }

  const last4 = rawDigits.slice(-4);
  if (rawDigits.length === 12) {
    return `${maskChar.repeat(4)} ${maskChar.repeat(4)} ${last4}`;
  }

  const maskedPrefix = maskChar.repeat(rawDigits.length - 4);
  const chunks = maskedPrefix.match(/.{1,4}/g) || [maskedPrefix];
  return [...chunks, last4].join(' ');
}

/**
 * Formats full 12-digit Aadhaar with spacing for readability (e.g., '1234 5678 9012').
 */
export function formatAadharVisible(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined) return '';
  const strVal = String(value).trim();
  const rawDigits = strVal.replace(/\D/g, '').slice(0, 12);
  if (!rawDigits) return '';

  const chunks = rawDigits.match(/.{1,4}/g) || [rawDigits];
  return chunks.join(' ');
}

@Pipe({
  name: 'aadharMask',
  standalone: true,
})
export class AadharMaskPipe implements PipeTransform {
  transform(
    value: string | number | null | undefined,
    maskChar = 'X'
  ): string {
    return maskAadhar(value, maskChar);
  }
}
