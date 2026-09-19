import { describe, it, expect } from 'vitest';
import {
  maskAadhar,
  formatAadharVisible,
  AadharMaskPipe,
  AadharVisiblePipe,
} from './aadhar-mask.util';

describe('Aadhaar Masking Utility', () => {
  it('should mask 12-digit Aadhaar showing only last 4 digits', () => {
    expect(maskAadhar('123456789012')).toBe('XXXX XXXX 9012');
    expect(maskAadhar('987654321098')).toBe('XXXX XXXX 1098');
  });

  it('should support custom mask character', () => {
    expect(maskAadhar('123456789012', '•')).toBe('•••• •••• 9012');
  });

  it('should return placeholders unchanged', () => {
    expect(maskAadhar('________')).toBe('________');
    expect(maskAadhar('____')).toBe('____');
    expect(maskAadhar('N/A')).toBe('N/A');
    expect(maskAadhar('')).toBe('');
    expect(maskAadhar(null)).toBe('');
    expect(maskAadhar(undefined)).toBe('');
  });

  it('should format full visible Aadhaar with spacing', () => {
    expect(formatAadharVisible('123456789012')).toBe('1234 5678 9012');
  });

  it('should mask properly via AadharMaskPipe', () => {
    const pipe = new AadharMaskPipe();
    expect(pipe.transform('123456789012')).toBe('XXXX XXXX 9012');
  });

  it('should format properly via AadharVisiblePipe', () => {
    const pipe = new AadharVisiblePipe();
    expect(pipe.transform('123456789012')).toBe('1234 5678 9012');
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});

