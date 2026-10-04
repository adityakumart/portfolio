import { Router } from 'express';
import express from 'express';
import {
  handleUploadMovies,
  handleGetMovies,
  handleDeleteMovie,
  handleGetUntranslatedCounts,
  handleDeleteUntranslatedMovies,
  handleCreateMovie,
  handleUpdateMovie,
} from '../controllers/movie.controller';
import { requireMasterAdmin } from '../middlewares/admin.middleware';

export const movieRouter = Router();

// Allow larger payload sizes specifically for bulk movie uploads (up to 50MB)
movieRouter.use(express.json({ limit: '50mb' }));

// Public query endpoints (used by game, explorer)
movieRouter.get('/untranslated/counts', handleGetUntranslatedCounts);
movieRouter.get('/', handleGetMovies);

// Mutating transactions protected with live masterAdmin DB check
movieRouter.post('/', requireMasterAdmin, handleCreateMovie);
movieRouter.put('/:id', requireMasterAdmin, handleUpdateMovie);
movieRouter.post('/upload', requireMasterAdmin, handleUploadMovies);
movieRouter.delete('/untranslated', requireMasterAdmin, handleDeleteUntranslatedMovies);
movieRouter.delete('/:id', requireMasterAdmin, handleDeleteMovie);


