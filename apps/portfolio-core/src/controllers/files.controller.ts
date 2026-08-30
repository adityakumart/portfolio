import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { R2Service, isR2Configured } from '../services/r2.service';
import { FileNode } from '@portfolio/shared-types';
import * as path from 'path';

/**
 * GET /api/files/list
 * Returns a hierarchical list of FileNodes based on a prefix
 */
export async function handleListFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User ID is missing.' });
      return;
    }

    const queryPrefix = String(req.query['prefix'] || '');
    const userRoot = `users/${userId}/`;
    const fullPrefix = userRoot + queryPrefix;

    const { commonPrefixes, contents } = await R2Service.listObjects(fullPrefix);

    const nodes: FileNode[] = [];

    // Map folders (CommonPrefixes)
    for (const prefix of commonPrefixes) {
      if (prefix.startsWith(userRoot)) {
        const relativePath = prefix.slice(userRoot.length);
        if (relativePath && relativePath !== queryPrefix) {
          const parts = relativePath.split('/').filter(Boolean);
          const name = parts[parts.length - 1] || relativePath;
          nodes.push({
            name,
            path: relativePath,
            type: 'folder',
          });
        }
      }
    }

    // Map files (Contents)
    for (const item of contents) {
      if (item.key.startsWith(userRoot)) {
        const relativePath = item.key.slice(userRoot.length);
        // Exclude directory placeholder itself and empty keys
        if (relativePath && relativePath !== queryPrefix && !relativePath.endsWith('/')) {
          const parts = relativePath.split('/');
          const name = parts[parts.length - 1] || relativePath;
          nodes.push({
            name,
            path: relativePath,
            type: 'file',
            size: item.size,
            lastModified: item.lastModified instanceof Date ? item.lastModified.toISOString() : String(item.lastModified),
          });
        }
      }
    }

    // Sort folders first, then files alphabetically
    nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    res.status(200).json(nodes);
  } catch (error: any) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

/**
 * GET /api/files/view-url
 * Generates a GET Presigned URL (or local mock URL) for a specific object
 */
export async function handleGetViewUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const key = String(req.query['key'] || '');
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!key) {
      res.status(400).json({ error: 'Bad Request', message: 'Query parameter "key" is required.' });
      return;
    }

    const fullKey = `users/${userId}/${key}`;
    const hostUrl = req.protocol + '://' + req.get('host');
    const url = await R2Service.getDownloadUrl(fullKey, hostUrl);

    res.status(200).json({ url });
  } catch (error: any) {
    console.error('Get view-url error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

/**
 * POST /api/files/upload
 * Handles direct binary stream upload from the client and saves it to R2 or local mock storage
 */
export async function handleUploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const key = String(req.query['key'] || '');
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!key) {
      res.status(400).json({ error: 'Bad Request', message: 'Query parameter "key" is required.' });
      return;
    }

    const fullKey = `users/${userId}/${key}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      try {
        await R2Service.uploadObject(fullKey, buffer, contentType);
        res.status(200).json({ success: true, message: 'Uploaded successfully' });
      } catch (err: any) {
        console.error('Direct file upload storage error:', err);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    });
  } catch (error: any) {
    console.error('Direct file upload controller error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}


/**
 * POST /api/files/create-folder
 * Creates an empty directory placeholder in S3 or local mock directory
 */
export async function handleCreateFolder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    const { path: folderPath } = req.body;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!folderPath) {
      res.status(400).json({ error: 'Bad Request', message: 'Body parameter "path" is required.' });
      return;
    }

    const sanitizedPath = folderPath.endsWith('/') ? folderPath : folderPath + '/';
    const fullKey = `users/${userId}/${sanitizedPath}`;

    if (isR2Configured) {
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const accessKeyId = process.env['R2_ACCESS_KEY_ID'] || '';
      const secretAccessKey = process.env['R2_SECRET_ACCESS_KEY'] || '';
      const endpoint = process.env['R2_ENDPOINT'] || '';

      const client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });

      const command = new PutObjectCommand({
        Bucket: process.env['R2_BUCKET_NAME'],
        Key: fullKey,
        Body: '',
      });
      await client.send(command);
    } else {
      R2Service.createMockDirectory(fullKey);
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

/**
 * PUT /api/files/mock-upload
 * Handles direct binary stream upload from the client in development mode
 */
export async function handleMockUpload(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const key = String(req.query['key']);
    if (!key) {
      res.status(400).send('Missing key');
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      try {
        R2Service.writeMockFile(key, buffer);
        res.status(200).send('Uploaded successfully');
      } catch (err: any) {
        res.status(500).send(err.message);
      }
    });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
}

/**
 * GET /api/files/mock-download
 * Streams file back to client in development mode
 */
export async function handleMockDownload(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const key = String(req.query['key']);
    if (!key) {
      res.status(400).send('Missing key');
      return;
    }

    const buffer = R2Service.readMockFile(key);
    const ext = path.extname(key).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.json') contentType = 'application/json';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.pdf') contentType = 'application/pdf';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(key)}"`);
    res.status(200).send(buffer);
  } catch {
    res.status(404).send('File not found');
  }
}
