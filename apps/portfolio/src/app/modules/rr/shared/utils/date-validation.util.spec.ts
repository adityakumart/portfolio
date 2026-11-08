import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { FormControl } from '@angular/forms';
import {
  getMinPickupDateTimeString,
  isPastDateTime,
  backdateValidator,
} from './date-validation.util';

describe('Date Validation Utility', () => {
  it('should format min pickup date time string correctly', () => {
    const minStr = getMinPickupDateTimeString(0);
    expect(minStr).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('should identify past dates correctly', () => {
    const past = new Date(Date.now() - 3600 * 1000).toISOString();
    const future = new Date(Date.now() + 3600 * 1000).toISOString();

    expect(isPastDateTime(past, 5)).toBe(true);
    expect(isPastDateTime(future, 5)).toBe(false);
    expect(isPastDateTime('')).toBe(false);
    expect(isPastDateTime(null)).toBe(false);
  });

  it('should allow past dates within grace buffer', () => {
    // 2 minutes ago with 5-minute buffer should NOT be marked as past
    const recent = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    expect(isPastDateTime(recent, 5)).toBe(false);
  });

  it('should validate form control based on isBackdateAllowedFn', () => {
    const pastDate = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // Employee validator (not allowed)
    const employeeValidator = backdateValidator(() => false);
    const pastControl = new FormControl(pastDate);
    const futureControl = new FormControl(futureDate);
    const emptyControl = new FormControl('');

    expect(employeeValidator(pastControl)).toEqual({ backdatedNotAllowed: true });
    expect(employeeValidator(futureControl)).toBeNull();
    expect(employeeValidator(emptyControl)).toBeNull();

    // Admin/Manager validator (allowed)
    const adminValidator = backdateValidator(() => true);
    expect(adminValidator(pastControl)).toBeNull();
    expect(adminValidator(futureControl)).toBeNull();
  });
});
