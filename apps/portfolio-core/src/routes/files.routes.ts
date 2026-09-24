import { Router } from 'express';
import {
  handleGetScope,
  handleListFiles,
  handleGetViewUrl,
  handleUploadFile,
  handleCreateFolder,
  handleAiFileContext,
  handleMockUpload,
  handleMockDownload,
} from '../controllers/files.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { enforceFileRBAC } from '../middlewares/rbac.middleware';

export const filesRouter = Router();

// Secure RBAC Metadata, Scope & Storage endpoints
filesRouter.get('/scope', authenticateToken, enforceFileRBAC, handleGetScope);
filesRouter.get('/list', authenticateToken, enforceFileRBAC, handleListFiles);
filesRouter.get('/view-url', authenticateToken, enforceFileRBAC, handleGetViewUrl);
filesRouter.post('/upload', authenticateToken, enforceFileRBAC, handleUploadFile);
filesRouter.post('/create-folder', authenticateToken, enforceFileRBAC, handleCreateFolder);
filesRouter.post('/ai-context', authenticateToken, enforceFileRBAC, handleAiFileContext);

// Storage simulator endpoints:
// GET /mock-download serves files strictly confined to MOCK_STORAGE_DIR (with directory-traversal protection).
filesRouter.get('/mock-download', handleMockDownload);

// PUT /mock-upload is only enabled in development with valid authentication, and disabled in production.
if (process.env['NODE_ENV'] !== 'production' && !process.env['VERCEL']) {
  filesRouter.put('/mock-upload', authenticateToken, handleMockUpload);
} else {
  filesRouter.put('/mock-upload', (_req, res) => {
    res.status(403).json({ error: 'Forbidden', message: 'Mock file upload endpoint is disabled in production.' });
  });
}
