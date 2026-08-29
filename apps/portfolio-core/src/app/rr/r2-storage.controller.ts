import { Response } from 'express';
import * as path from 'path';
import { R2Service } from '../../services/r2.service';

/**
 * Handles vehicle image upload requests.
 * Saves the file to Cloudflare R2 (or mock local storage) and returns the asset details.
 */
export async function handleVehicleImageUpload(
  req: any,
  res: Response,
): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res
        .status(400)
        .json({ error: 'Bad Request', message: 'No image file provided.' });
      return;
    }

    // Generate unique name for the file to prevent collisions
    const originalExt = path.extname(file.originalname).toLowerCase() || '.png';
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const filename = `vehicle-${timestamp}-${randomSuffix}${originalExt}`;

    // Directory path in the bucket: rr/vehicles
    const key = `rr/vehicles/${filename}`;

    // Upload using S3 Client/R2 Service
    await R2Service.uploadObject(key, file.buffer, file.mimetype, process.env['RR_R2_BUCKET_NAME']);

    // Generate permanent access URL (R2 public URL or mock download link)
    const hostUrl = req.protocol + '://' + req.get('host');
    const publicUrl = process.env['RR_R2_PUBLIC_URL'];
    const url = publicUrl
      ? `${publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl}/${key}`
      : `${hostUrl}/api/files/mock-download?key=${encodeURIComponent(key)}`;

    res.status(200).json({
      success: true,
      message: 'Vehicle image uploaded successfully.',
      key,
      url,
    });
  } catch (error: any) {
    console.error('Error uploading vehicle image:', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
}
