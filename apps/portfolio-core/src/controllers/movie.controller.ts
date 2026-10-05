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

/**
 * Handles fetching counts of untranslated movies by criteria.
 */
export async function handleGetUntranslatedCounts(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const counts = await movieService.getUntranslatedCounts();
    res.status(200).json({
      success: true,
      counts,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching untranslated movie counts:', err);
    res.status(500).json({
      success: false,
      error: 'Query Failed',
      message: err.message || 'Failed to fetch untranslated counts.',
    });
  }
}

/**
 * Handles batch deletion of untranslated movies.
 * Query param: mode = 'both' | 'either' | 'english' | 'telugu' (default: 'both').
 */
export async function handleDeleteUntranslatedMovies(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rawMode = req.query['mode'];
    const mode = (typeof rawMode === 'string' ? rawMode : 'both') as
      | 'both'
      | 'either'
      | 'english'
      | 'telugu';

    const result = await movieService.deleteUntranslatedMovies(mode);
    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} movie record(s) with no translation.`,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting untranslated movies:', err);
    res.status(500).json({
      success: false,
      error: 'Delete Failed',
      message: err.message || 'An error occurred deleting untranslated movies.',
    });
  }
}

/**
 * Handles creation of a single movie record.
 */
export async function handleCreateMovie(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { title, cast, englishTranslation, teluguTranslation, year } =
      req.body;
    if (!title || (!englishTranslation && !teluguTranslation)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message:
          'Title and at least one translation (English or Telugu) are required.',
      });
      return;
    }

    const movie = await movieService.createMovie({
      title,
      cast,
      englishTranslation,
      teluguTranslation,
      year: year ? Number(year) : undefined,
    });

    res.status(201).json({
      success: true,
      movie,
      message: 'Movie created successfully.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating movie:', err);
    res.status(400).json({
      success: false,
      error: 'Creation Failed',
      message: err.message || 'Failed to create movie.',
    });
  }
}

/**
 * Handles updating of a single movie record by ID.
 */
export async function handleUpdateMovie(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rawId = req.params['id'];
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Movie ID parameter is required.',
      });
      return;
    }

    const updated = await movieService.updateMovie(id, req.body);
    if (!updated) {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Movie record not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      movie: updated,
      message: 'Movie updated successfully.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating movie:', err);
    res.status(400).json({
      success: false,
      error: 'Update Failed',
      message: err.message || 'Failed to update movie.',
    });
  }
}


