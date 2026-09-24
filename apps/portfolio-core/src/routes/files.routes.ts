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

// Development-only local storage simulator endpoints (disabled in production)
if (process.env['NODE_ENV'] !== 'production' && !process.env['VERCEL']) {
  filesRouter.put('/mock-upload', authenticateToken, handleMockUpload);
  filesRouter.get('/mock-download', authenticateToken, handleMockDownload);
} else {
  filesRouter.all(['/mock-upload', '/mock-download'], (req, res) => {
    res.status(403).json({ error: 'Forbidden', message: 'Mock file storage endpoints are disabled in production.' });
  });
}
