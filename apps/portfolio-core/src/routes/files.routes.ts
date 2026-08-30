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

// Publicly accessible local storage simulator endpoints (dev only)
filesRouter.put('/mock-upload', handleMockUpload);
filesRouter.get('/mock-download', handleMockDownload);
