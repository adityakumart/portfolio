import { Pipe, PipeTransform } from '@angular/core';

export type IndianDateInput = Date | string | number | null | undefined;

export interface IndianDateOptions {
  includeTime?: boolean;
  timeFormat?: '12h' | '24h';
  fallback?: string;
  timezone?: string;
}

/**
 * Pads single-digit numbers with a leading zero.
 */
function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Parses a date input into a valid Date object without timezone drift for date-only strings (YYYY-MM-DD).
 */
export function parseDateInput(value: IndianDateInput): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(value).trim();
  if (!str || str === '________' || str === 'N/A' || str === '—') {
    return null;
  }

  // Handle dd-MM-yyyy or dd/MM/yyyy
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
    const parsed = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Handle yyyy-MM-dd (plain date string, avoid UTC midnight shift)
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const parsed = new Date(year, month, day);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // General ISO or parseable date string
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Pure helper function to format any date into the Indian format (dd-MM-yyyy).
 * Provides a single source of truth across components, pipes, and services.
 */
export function formatToIndianDate(
  value: IndianDateInput,
  options?: IndianDateOptions
): string {
  const fallback = options?.fallback ?? '';
  const date = parseDateInput(value);
  if (!date) {
    return fallback;
  }

  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = date.getFullYear();
  const dateFormatted = `${day}-${month}-${year}`;

  if (!options?.includeTime) {
    return dateFormatted;
  }

  let hours = date.getHours();
  const minutes = padZero(date.getMinutes());

  if (options.timeFormat === '24h') {
    return `${dateFormatted}, ${padZero(hours)}:${minutes}`;
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  const formattedHours = padZero(hours);

  return `${dateFormatted}, ${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Parses user text entered in dd-MM-yyyy (or dd/MM/yyyy) into a Date object.
 */
export function parseIndianDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== 'string') {
    return null;
  }
  return parseDateInput(value);
}

/**
 * Formats a Date or date string to backend-standard ISO format (yyyy-MM-dd).
 * Preserves backend contract compatibility with zero backend modifications.
 */
export function toISODateString(value: IndianDateInput): string {
  const date = parseDateInput(value);
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date or date string to backend-standard datetime-local format (yyyy-MM-ddTHH:mm).
 */
export function toISODateTimeString(value: IndianDateInput): string {
  const date = parseDateInput(value);
  if (!date) {
    return '';
  }
  const ymd = toISODateString(date);
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${ymd}T${hours}:${minutes}`;
}

/**
 * Standalone Angular custom pipe to format dates according to the Indian standard (dd-MM-yyyy).
 */
@Pipe({
  name: 'indianDate',
  standalone: true,
  pure: true,
})
export class IndianDatePipe implements PipeTransform {
  transform(
    value: IndianDateInput,
    options?: IndianDateOptions | boolean
  ): string {
    const opts: IndianDateOptions | undefined =
      typeof options === 'boolean' ? { includeTime: options } : options;
    return formatToIndianDate(value, opts);
  }
}
