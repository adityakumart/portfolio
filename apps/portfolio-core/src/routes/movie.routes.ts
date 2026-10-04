import { Router } from 'express';
import express from 'express';
import {
  handleUploadMovies,
  handleGetMovies,
  handleDeleteMovie,
  handleGetUntranslatedCounts,
  handleDeleteUntranslatedMovies,
} from '../controllers/movie.controller';

export const movieRouter = Router();

// Allow larger payload sizes specifically for bulk movie uploads (up to 50MB)
movieRouter.use(express.json({ limit: '50mb' }));

movieRouter.post('/upload', handleUploadMovies);
movieRouter.get('/untranslated/counts', handleGetUntranslatedCounts);
movieRouter.delete('/untranslated', handleDeleteUntranslatedMovies);
movieRouter.get('/', handleGetMovies);
movieRouter.delete('/:id', handleDeleteMovie);

