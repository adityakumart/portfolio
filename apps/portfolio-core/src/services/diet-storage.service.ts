import { randomUUID } from 'crypto';
import path from 'path';
import { R2Service, isR2Configured } from './r2.service';
import { IS3PresignedUrlResponse } from '@portfolio/shared-types';

export class DietStorageService {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  /**
   * Generates a signed upload URL for a user's meal photo.
   */
  static async getMealPhotoUploadUrl(
    userId: string,
    fileName: string,
    mimeType: string,
    hostUrl: string,
  ): Promise<IS3PresignedUrlResponse> {
    if (!this.ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error(
        `Invalid file type '${mimeType}'. Allowed formats: JPEG, PNG, WEBP, GIF.`,
      );
    }

    const ext = path.extname(fileName) || '.jpg';
    const uniqueKey = `users/${userId}/diet/${Date.now()}-${randomUUID()}${ext}`;

    const uploadUrl = await R2Service.getUploadUrl(uniqueKey, hostUrl, 900); // 15 min expiry
    const fileUrl = await R2Service.getDownloadUrl(uniqueKey, hostUrl, 86400 * 7); // 7 days or public CDN URL

    return {
      uploadUrl,
      fileUrl,
      storageKey: uniqueKey,
    };
  }

  /**
   * Deletes a meal photo from storage if a storage key is present.
   */
  static async deleteMealPhoto(storageKey?: string): Promise<void> {
    if (!storageKey) return;
    try {
      if (isR2Configured) {
        const { S3Client, DeleteObjectCommand } = await import(
          '@aws-sdk/client-s3'
        );
        const client = new S3Client({
          region: 'auto',
          endpoint: process.env['R2_ENDPOINT'],
          credentials: {
            accessKeyId: process.env['R2_ACCESS_KEY_ID'] || '',
            secretAccessKey: process.env['R2_SECRET_ACCESS_KEY'] || '',
          },
          forcePathStyle: true,
        });
        await client.send(
          new DeleteObjectCommand({
            Bucket: process.env['R2_BUCKET_NAME'],
            Key: storageKey,
          }),
        );
      }
    } catch (err) {
      console.warn(`[DietStorageService] Failed to delete photo ${storageKey}:`, err);
    }
  }
}
