import { Injectable } from '@angular/core';
import { MD5, SHA256 } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncoderHashService {
  /**
   * Encodes a URL component using native encodeURIComponent.
   * @param value The plain text string to encode.
   * @returns The URL-encoded string.
   */
  encodeUrl(value: string): string {
    if (!value) return '';
    return encodeURIComponent(value);
  }

  /**
   * Decodes a URL-encoded string using native decodeURIComponent.
   * Propagates URIError for malformed inputs to be caught by the consumer.
   * @param value The URL-encoded string to decode.
   * @returns The decoded plain text string.
   */
  decodeUrl(value: string): string {
    if (!value) return '';
    return decodeURIComponent(value);
  }

  /**
   * Generates an MD5 cryptographic hash from input text using crypto-ts.
   * @param value The input text string to hash.
   * @returns A standard lowercase hexadecimal MD5 hash.
   */
  generateMd5(value: string): string {
    if (!value) return '';
    return MD5(value).toString().toLowerCase();
  }

  /**
   * Generates a SHA-256 cryptographic hash from input text using crypto-ts.
   * @param value The input text string to hash.
   * @returns A standard lowercase hexadecimal SHA-256 hash.
   */
  generateSha256(value: string): string {
    if (!value) return '';
    return SHA256(value).toString().toLowerCase();
  }
}
