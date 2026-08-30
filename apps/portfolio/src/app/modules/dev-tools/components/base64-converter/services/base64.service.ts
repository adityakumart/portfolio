import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Metadata definition for files processed by the service
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * File information details detected from base64 strings
 */
export interface DecodedFileInfo {
  mimeType: string | null;
  extension: string | null;
  sizeBytes: number;
  isBinary: boolean;
  isImage: boolean;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class Base64Service {
  // Enforce a strict 15MB file size limit to prevent UI thread freezing
  readonly MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

  /**
   * Encodes a plain text string to a Base64 string in a Unicode-safe manner.
   * Avoids issues with UTF-8 characters by using TextEncoder and converting bytes.
   * @param text Raw plain text to encode
   */
  encodeText(text: string): string {
    if (!text) return '';
    try {
      // Modern Unicode-safe base64 encoding (TextEncoder handles multi-byte characters correctly)
      const utf8Bytes = new TextEncoder().encode(text);
      let binaryString = '';
      // Accumulate binary string from byte array
      for (let i = 0; i < utf8Bytes.length; i++) {
        binaryString += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binaryString);
    } catch (error) {
      throw new Error('Failed to encode text to Base64: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Decodes a Base64 string back to plain text.
   * Uses TextDecoder with 'fatal: true' to capture invalid UTF-8 sequences.
   * @param base64 Base64 encoded string or Data URI
   */
  decodeText(base64: string): string {
    if (!base64) return '';
    const cleaned = this.extractBase64FromDataUri(base64).trim();

    let binaryString: string;
    try {
      binaryString = atob(cleaned);
    } catch {
      throw new Error('Invalid Base64 format: The input string is not correctly encoded or contains invalid characters.');
    }

    // Construct byte array from binary string
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Check if the input represents a binary file using magic byte detection
    const info = this.detectFileInfo(cleaned);
    if (info.isBinary) {
      throw new Error('Binary Data: The decoded data represents a binary file (such as an image or document) and cannot be displayed as plain text. Check the visual preview or metadata section.');
    }

    try {
      // Decode using TextDecoder with fatal validation to detect non-text binary inputs
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new Error('Decoding Error: The input is not a valid UTF-8 text string (it may be binary data).');
    }
  }

  /**
   * Extracts the raw Base64 string from a Data URI.
   * Returns the original string if it is not a Data URI.
   * @param input Data URI or base64 string
   */
  extractBase64FromDataUri(input: string): string {
    if (!input) return '';
    const match = input.match(/^data:([^;]+);base64,(.*)$/s);
    return match ? match[2] : input;
  }

  /**
   * Extracts the MIME type from a Data URI.
   * @param input Data URI or base64 string
   */
  extractMimeTypeFromDataUri(input: string): string | null {
    if (!input) return null;
    const match = input.match(/^data:([^;]+);base64,/);
    return match ? match[1] : null;
  }

  /**
   * Safely decodes a small slice of Base64 to examine file header magic numbers.
   * Prevents freezing the JS single-thread when inspecting very large inputs.
   */
  private getMagicBytes(base64: string, numBytes: number = 12): Uint8Array {
    const cleaned = base64.replace(/[\s\r\n]+/g, '');
    const chunk = cleaned.slice(0, Math.ceil(numBytes * 4 / 3) + 4);
    try {
      const binaryString = atob(chunk);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.slice(0, numBytes);
    } catch {
      return new Uint8Array(0);
    }
  }

  /**
   * Inspects magic numbers of decoded bytes to determine file type/metadata.
   * Supports common formats like PNG, JPG, GIF, WebP, PDF, ZIP.
   * @param base64 Raw Base64 string or Data URI
   */
  detectFileInfo(base64: string): DecodedFileInfo {
    const dataUriMime = this.extractMimeTypeFromDataUri(base64);
    const cleaned = this.extractBase64FromDataUri(base64).trim();

    if (!cleaned) {
      return { mimeType: null, extension: null, sizeBytes: 0, isBinary: false, isImage: false, name: '' };
    }

    // Size estimation based on base64 characters length
    const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0;
    const sizeBytes = Math.floor((cleaned.length * 3) / 4) - padding;

    let mimeType = dataUriMime;
    let extension: string | null = null;
    let isBinary = false;
    let isImage = false;

    if (mimeType) {
      isBinary = !mimeType.startsWith('text/');
      isImage = mimeType.startsWith('image/');
      const parts = mimeType.split('/');
      extension = parts[1] ? parts[1].split('+')[0] : null;
    }

    // Inspect first 12 bytes for file headers
    const bytes = this.getMagicBytes(cleaned, 12);
    if (bytes.length >= 3) {
      // PNG Signature
      if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
        mimeType = 'image/png';
        extension = 'png';
        isBinary = true;
        isImage = true;
      }
      // JPEG Signature
      else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        mimeType = 'image/jpeg';
        extension = 'jpg';
        isBinary = true;
        isImage = true;
      }
      // GIF Signature
      else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        mimeType = 'image/gif';
        extension = 'gif';
        isBinary = true;
        isImage = true;
      }
      // WebP Signature: RIFFxxxxWEBP
      else if (
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
      ) {
        mimeType = 'image/webp';
        extension = 'webp';
        isBinary = true;
        isImage = true;
      }
      // PDF Signature: %PDF
      else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        mimeType = 'application/pdf';
        extension = 'pdf';
        isBinary = true;
      }
      // ZIP Signature
      else if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
        mimeType = 'application/zip';
        extension = 'zip';
        isBinary = true;
      }
    }

    // Heuristics for printable vs binary data
    if (!isBinary && bytes.length > 0) {
      let nonPrintableCount = 0;
      try {
        const decodedChunk = atob(cleaned.slice(0, 100));
        for (let i = 0; i < decodedChunk.length; i++) {
          const code = decodedChunk.charCodeAt(i);
          if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code > 126) {
            nonPrintableCount++;
          }
        }
        if (nonPrintableCount / decodedChunk.length > 0.1) {
          isBinary = true;
        }
      } catch {
        isBinary = true;
      }
    }

    return {
      mimeType,
      extension,
      sizeBytes,
      isBinary,
      isImage,
      name: extension ? `file.${extension}` : 'file.bin'
    };
  }

  /**
   * Asynchronously reads a File using FileReader.
   * Wraps operation in an RxJS Observable with abort support on unsubscribe.
   * @param file File input object
   */
  readFileAsDataURL(file: File): Observable<{ base64: string; dataUri: string; metadata: FileMetadata }> {
    return new Observable((subscriber) => {
      // Enforce the performance/memory safety guardrail
      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        subscriber.error(
          new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the maximum safety limit of 15MB.`)
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const dataUri = reader.result as string;
        const base64 = this.extractBase64FromDataUri(dataUri);
        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          lastModified: file.lastModified,
        };

        subscriber.next({ base64, dataUri, metadata });
        subscriber.complete();
      };

      reader.onerror = () => {
        subscriber.error(new Error(reader.error?.message || 'Error occurred reading the file.'));
      };

      reader.readAsDataURL(file);

      // Clean up when unsubscribe is called (aborts read stream immediately)
      return () => {
        if (reader.readyState === FileReader.LOADING) {
          reader.abort();
        }
      };
    });
  }
}
