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
    let rawFiles: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      rawFiles = req.files;
    } else if (req.files && typeof req.files === 'object') {
      for (const fieldName of Object.keys(req.files)) {
        const fileList = req.files[fieldName];
        if (Array.isArray(fileList)) {
          rawFiles.push(...fileList);
        }
      }
    } else if (req.file) {
      rawFiles = [req.file];
    }

    if (!rawFiles || rawFiles.length === 0) {
      res
        .status(400)
        .json({ error: 'Bad Request', message: 'No image file provided.' });
      return;
    }

    const hostUrl = req.protocol + '://' + req.get('host');
    const publicUrl = process.env['RR_R2_PUBLIC_URL'];
    const bucketName = process.env['RR_R2_BUCKET_NAME'];

    const uploadedAssets: { key: string; url: string; originalName: string }[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const originalExt = path.extname(file.originalname).toLowerCase() || '.png';
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1e9);
      const filename = `vehicle-${timestamp}-${randomSuffix}-${i}${originalExt}`;

      const key = `rr/vehicles/${filename}`;

      await R2Service.uploadObject(key, file.buffer, file.mimetype, bucketName);

      const url = publicUrl
        ? `${publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl}/${key}`
        : `${hostUrl}/api/files/mock-download?key=${encodeURIComponent(key)}`;

      uploadedAssets.push({
        key,
        url,
        originalName: file.originalname,
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedAssets.length} vehicle ${uploadedAssets.length === 1 ? 'image' : 'images'} uploaded successfully.`,
      images: uploadedAssets,
      // Backward-compatibility properties for single-image upload consumers
      key: uploadedAssets[0]?.key,
      url: uploadedAssets[0]?.url,
    });
  } catch (error: any) {
    console.error('Error uploading vehicle image(s):', error);
    res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
}
