import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { R2Service, isR2Configured } from '../services/r2.service';
import { FileModel } from '../models/file.model';
import { GeminiAiService } from '../services/gemini.service';
import { FileNode } from '@portfolio/shared-types';
import * as path from 'path';

/**
 * GET /api/files/scope
 * Returns the current authenticated user's RBAC scope and directory configuration
 */
export async function handleGetScope(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scope = req.fileScope;
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized', message: 'User scope not found.' });
      return;
    }
    res.status(200).json(scope);
  } catch (error: any) {
    console.error('Get scope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

/**
 * GET /api/files/list
 * Returns a hierarchical list of FileNodes based on user's authorized scope and prefix
 */
export async function handleListFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scope = req.fileScope;
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized', message: 'User scope not found.' });
      return;
    }

    const queryPrefix = String(req.query['prefix'] || '');
    // Standardize prefix without leading slash
    const cleanPrefix = queryPrefix.startsWith('/') ? queryPrefix.slice(1) : queryPrefix;
    
    // Dynamic Path Resolution
    // For admin: scope.uploadDir is 'root/'
    // For standard user: scope.uploadDir is 'root/users/{userId}-{fullName}/'
    const scopeRoot = scope.uploadDir;
    const fullPrefix = scopeRoot + cleanPrefix;

    const { commonPrefixes, contents } = await R2Service.listObjects(fullPrefix);

    const nodes: FileNode[] = [];

    // Map folders (CommonPrefixes)
    for (const prefix of commonPrefixes) {
      if (prefix.startsWith(scopeRoot)) {
        const relativePath = prefix.slice(scopeRoot.length);
        if (relativePath && relativePath !== cleanPrefix) {
          const parts = relativePath.split('/').filter(Boolean);
          const name = parts[parts.length - 1] || relativePath;
          nodes.push({
            name,
            path: relativePath,
            fullPath: prefix,
            type: 'folder',
          });
        }
      }
    }

    // Map files (Contents)
    for (const item of contents) {
      if (item.key.startsWith(scopeRoot)) {
        const relativePath = item.key.slice(scopeRoot.length);
        // Exclude directory placeholder itself and empty keys
        if (relativePath && relativePath !== cleanPrefix && !relativePath.endsWith('/')) {
          const parts = relativePath.split('/');
          const name = parts[parts.length - 1] || relativePath;

          // Attempt to enrich with database metadata
          const fileMeta = await FileModel.findByPath(item.key).catch(() => null);

          nodes.push({
            name,
            path: relativePath,
            fullPath: item.key,
            type: 'file',
            size: item.size,
            lastModified: item.lastModified instanceof Date ? item.lastModified.toISOString() : String(item.lastModified),
            ownerId: fileMeta?.ownerId?.toString() || scope.userId,
            ownerName: fileMeta?.ownerName || (scope.isAdmin ? 'Admin' : scope.userFullName),
            uploadedBy: fileMeta?.ownerName || (scope.isAdmin ? 'Admin' : scope.userFullName),
            mimeType: fileMeta?.mimeType,
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
 * Generates a GET Presigned URL (or local mock URL) for a specific object within authorized scope
 */
export async function handleGetViewUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scope = req.fileScope;
    const rawKey = String(req.query['key'] || '');
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!rawKey) {
      res.status(400).json({ error: 'Bad Request', message: 'Query parameter "key" is required.' });
      return;
    }

    const cleanKey = rawKey.startsWith('/') ? rawKey.slice(1) : rawKey;
    const fullKey = `${scope.uploadDir}${cleanKey}`;
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
 * Handles direct binary stream upload from the client, saves to storage, and persists metadata in DB
 */
export async function handleUploadFile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scope = req.fileScope;
    const rawKey = String(req.query['key'] || '');
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!rawKey) {
      res.status(400).json({ error: 'Bad Request', message: 'Query parameter "key" is required.' });
      return;
    }

    const cleanKey = rawKey.startsWith('/') ? rawKey.slice(1) : rawKey;
    const fullKey = `${scope.uploadDir}${cleanKey}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const fileName = path.basename(cleanKey);

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      try {
        await R2Service.uploadObject(fullKey, buffer, contentType);

        // Record metadata in Mongoose/MongoDB File model
        await FileModel.recordFile({
          name: fileName,
          path: fullKey,
          relativePath: cleanKey,
          size: buffer.length,
          mimeType: contentType,
          ownerId: scope.userId,
          ownerName: scope.userFullName,
          ownerRole: scope.userRole,
        }).catch((dbErr) => {
          console.warn('Failed to record file metadata in DB:', dbErr);
        });

        res.status(200).json({ success: true, message: 'Uploaded successfully', key: cleanKey });
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
    const scope = req.fileScope;
    const { path: folderPath } = req.body;
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!folderPath) {
      res.status(400).json({ error: 'Bad Request', message: 'Body parameter "path" is required.' });
      return;
    }

    const cleanPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
    const sanitizedPath = cleanPath.endsWith('/') ? cleanPath : cleanPath + '/';
    const fullKey = `${scope.uploadDir}${sanitizedPath}`;

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

    res.status(200).json({ success: true, folder: sanitizedPath });
  } catch (error: any) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

/**
 * POST /api/files/ai-context
 * AI Assistant (Antigravity) integration: reads file from user scope and processes with Gemini API
 */
export async function handleAiFileContext(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const scope = req.fileScope;
    const { key, prompt } = req.body;
    if (!scope) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!key) {
      res.status(400).json({ error: 'Bad Request', message: 'File "key" is required.' });
      return;
    }

    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    const fullKey = `${scope.uploadDir}${cleanKey}`;

    // Read file buffer safely within allowed user scope
    const fileBuffer = await R2Service.readFileContent(fullKey);
    const textPreview = fileBuffer.toString('utf-8').slice(0, 10000); // Limit to first 10KB for prompt context

    const userPrompt = prompt || 'Please summarize this file and describe its contents.';
    const enhancedPrompt = `You are Antigravity, the AI pair programmer and assistant. The user has requested analysis of the file "${path.basename(cleanKey)}":

File Content Preview:
\`\`\`
${textPreview}
\`\`\`

User Question / Task:
${userPrompt}`;

    const reply = await GeminiAiService.generateResponse(enhancedPrompt);
    res.status(200).json({ reply, fileName: path.basename(cleanKey) });
  } catch (error: any) {
    console.error('AI File context error:', error);
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

    if (ext === '.txt' || ext === '.md' || ext === '.json' || ext === '.ts' || ext === '.js') contentType = 'text/plain';
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
