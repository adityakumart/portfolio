import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

const accessKeyId = process.env['R2_ACCESS_KEY_ID'] || '';
const secretAccessKey = process.env['R2_SECRET_ACCESS_KEY'] || '';
const endpoint = process.env['R2_ENDPOINT'] || '';
const bucketName = process.env['R2_BUCKET_NAME'] || '';

export const isR2Configured = !!(
  accessKeyId &&
  secretAccessKey &&
  endpoint &&
  bucketName
);

let s3Client: S3Client | null = null;
if (isR2Configured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

// Local mock storage base directory
const MOCK_STORAGE_DIR = path.resolve(__dirname, '../../mock-storage');

export class R2Service {
  /**
   * Sanitizes key to prevent directory traversal in mock mode.
   */
  static sanitizeKey(key: string): string {
    const resolvedPath = path.resolve(MOCK_STORAGE_DIR, key);
    if (!resolvedPath.startsWith(MOCK_STORAGE_DIR)) {
      throw new Error('Access denied: directory traversal detected.');
    }
    return path.relative(MOCK_STORAGE_DIR, resolvedPath).replace(/\\/g, '/');
  }

  /**
   * Lists S3/R2 objects or mock files for the given prefix.
   */
  static async listObjects(prefix: string) {
    if (isR2Configured && s3Client) {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        Delimiter: '/',
      });
      const response = await s3Client.send(command);
      return {
        commonPrefixes:
          (response.CommonPrefixes?.map((cp) => cp.Prefix).filter(
            Boolean,
          ) as string[]) || [],
        contents:
          response.Contents?.map((c) => ({
            key: c.Key || '',
            size: c.Size ?? 0,
            lastModified: c.LastModified || new Date(),
          })) || [],
      };
    } else {
      const sanitizedPrefix = this.sanitizeKey(prefix);
      // S3 keys use trailing slashes to designate directory listing prefixes
      const prefixWithSlash = prefix.endsWith('/')
        ? sanitizedPrefix + '/'
        : sanitizedPrefix;
      return this.listObjectsMock(prefixWithSlash);
    }
  }

  /**
   * Generates a signed view URL for the object.
   */
  static async getDownloadUrl(
    key: string,
    hostUrl: string,
    expiresIn = 3600,
  ): Promise<string> {
    if (isR2Configured && s3Client) {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      return getSignedUrl(s3Client, command, { expiresIn });
    } else {
      const sanitizedKey = this.sanitizeKey(key);
      return `${hostUrl}/api/files/mock-download?key=${encodeURIComponent(sanitizedKey)}`;
    }
  }

  /**
   * Generates a signed upload (PUT) URL for the object.
   */
  static async getUploadUrl(
    key: string,
    hostUrl: string,
    expiresIn = 900,
  ): Promise<string> {
    if (isR2Configured && s3Client) {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      return getSignedUrl(s3Client, command, { expiresIn });
    } else {
      const sanitizedKey = this.sanitizeKey(key);
      return `${hostUrl}/api/files/mock-upload?key=${encodeURIComponent(sanitizedKey)}`;
    }
  }

  /**
   * Helper to write file content to mock storage (for the mock PUT route).
   */
  static writeMockFile(key: string, buffer: Buffer): void {
    const sanitizedKey = this.sanitizeKey(key);
    const filePath = path.join(MOCK_STORAGE_DIR, sanitizedKey);
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, buffer);
  }

  /**
   * Helper to read file content from mock storage (for the mock GET route).
   */
  static readMockFile(key: string): Buffer {
    const sanitizedKey = this.sanitizeKey(key);
    const filePath = path.join(MOCK_STORAGE_DIR, sanitizedKey);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${sanitizedKey}`);
    }
    return fs.readFileSync(filePath);
  }

  /**
   * Helper to create a directory placeholder in mock storage.
   */
  static createMockDirectory(key: string): void {
    const sanitizedKey = this.sanitizeKey(key);
    const dirPath = path.join(MOCK_STORAGE_DIR, sanitizedKey);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private static listObjectsMock(prefix: string) {
    const dirPath = path.join(MOCK_STORAGE_DIR, prefix);
    if (!fs.existsSync(dirPath)) {
      return { commonPrefixes: [], contents: [] };
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const commonPrefixes: string[] = [];
    const contents: any[] = [];

    for (const entry of entries) {
      // Rebuild the key using prefix/name
      // Ensure slash structure matches S3 prefixes
      const entryKey =
        (prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '') +
        entry.name;
      const fullKey = entryKey + (entry.isDirectory() ? '/' : '');

      if (entry.isDirectory()) {
        commonPrefixes.push(fullKey);
      } else {
        const filePath = path.join(dirPath, entry.name);
        const stats = fs.statSync(filePath);
        contents.push({
          key: fullKey,
          size: stats.size,
          lastModified: stats.mtime,
        });
      }
    }

    return { commonPrefixes, contents };
  }
}
