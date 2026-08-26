import { Router } from 'express';
import {
  handleListFiles,
  handleGetViewUrl,
  handleUploadFile,
  handleCreateFolder,
  handleMockUpload,
  handleMockDownload,
} from '../controllers/files.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export const filesRouter = Router();

// Secure metadata & URL generation endpoints
filesRouter.get('/list', authenticateToken, handleListFiles);
filesRouter.get('/view-url', authenticateToken, handleGetViewUrl);
filesRouter.post('/upload', authenticateToken, handleUploadFile);
filesRouter.post('/create-folder', authenticateToken, handleCreateFolder);

// Publicly accessible local storage simulator endpoints (dev only)
filesRouter.put('/mock-upload', handleMockUpload);
filesRouter.get('/mock-download', handleMockDownload);
