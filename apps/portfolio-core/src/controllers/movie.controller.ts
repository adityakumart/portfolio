import { Request, Response } from 'express';
import { movieService } from '../services/movie.service';

/**
 * Handles batch upload/import of movies JSON array.
 * Accepts either:
 * - Direct array: `[ { title, cast, englishTranslation, year }, ... ]`
 * - Wrapped object: `{ movies: [ ... ] }`
 */
export async function handleUploadMovies(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    let payload = req.body;

    if (payload && !Array.isArray(payload) && Array.isArray(payload.movies)) {
      payload = payload.movies;
    }

    if (!Array.isArray(payload)) {
      res.status(400).json({
        success: false,
        error: 'Invalid Payload',
        message:
          'Expected a JSON array of movie objects (e.g. [{ title, cast, englishTranslation, year }]).',
      });
      return;
    }

    const result = await movieService.importMovies(payload);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading movies:', err);
    res.status(500).json({
      success: false,
      error: 'Upload Failed',
      message: err.message || 'An error occurred during movie import.',
    });
  }
}

/**
 * Handles retrieval of movies with pagination, search, and year filtering.
 */
export async function handleGetMovies(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const page = req.query['page'] ? Number(req.query['page']) : 1;
    const limit = req.query['limit'] ? Number(req.query['limit']) : 20;
    const search =
      typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
    const year = req.query['year'] ? Number(req.query['year']) : undefined;

    const result = await movieService.getMovies({ page, limit, search, year });
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching movies:', err);
    res.status(500).json({
      success: false,
      error: 'Query Failed',
      message: err.message || 'An error occurred fetching movies.',
    });
  }
}

/**
 * Handles deletion of a single movie record by ID.
 */
export async function handleDeleteMovie(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rawId = req.params['id'];
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Movie ID parameter is required.',
      });
      return;
    }

    const success = await movieService.deleteMovie(id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Movie record not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting movie:', err);
    res.status(500).json({
      success: false,
      error: 'Delete Failed',
      message: err.message || 'An error occurred deleting the movie.',
    });
  }
}
