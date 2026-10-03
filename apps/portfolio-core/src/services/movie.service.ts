import { getMovieModel, IMovieDocument } from '../models/movie.model';
import {
  IMovie,
  IMovieUploadResponse,
  IMovieListResponse,
  IMovieSkippedDetail,
} from '@portfolio/shared-types';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export class MovieService {
  /**
   * Imports an array of movies with strict validation:
   * 1. Only insert if there is no previous record with the same movie title (case-insensitive).
   * 2. Only insert if englishTranslation is non-empty string.
   * 3. Include year in record.
   */
  public async importMovies(rawMovies: unknown[]): Promise<IMovieUploadResponse> {
    if (!Array.isArray(rawMovies)) {
      throw new Error('Input payload must be a JSON array of movie objects.');
    }

    const MovieModel = await getMovieModel();
    const skipped: IMovieSkippedDetail[] = [];
    const candidateMap = new Map<string, { title: string; cast: string; englishTranslation: string; year?: number }>();

    let skippedMissingTranslation = 0;
    let skippedInvalid = 0;
    let skippedDuplicateInPayload = 0;

    for (const item of rawMovies) {
      if (!item || typeof item !== 'object') {
        skippedInvalid++;
        continue;
      }

      const raw = item as Record<string, unknown>;
      const rawTitle = typeof raw['title'] === 'string' ? raw['title'].trim() : '';
      const rawTranslation =
        typeof raw['englishTranslation'] === 'string'
          ? raw['englishTranslation'].trim()
          : '';
      const rawCast = typeof raw['cast'] === 'string' ? raw['cast'].trim() : '';

      let rawYear: number | undefined = undefined;
      if (raw['year'] !== undefined && raw['year'] !== null && raw['year'] !== '') {
        const parsedYear = Number(raw['year']);
        if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear < 2100) {
          rawYear = parsedYear;
        }
      }

      if (!rawTitle) {
        skippedInvalid++;
        skipped.push({
          title: '(Unknown)',
          reason: 'missing_title',
          year: rawYear,
        });
        continue;
      }

      // Check for non-empty englishTranslation
      if (!rawTranslation) {
        skippedMissingTranslation++;
        skipped.push({
          title: rawTitle,
          reason: 'missing_translation',
          year: rawYear,
        });
        continue;
      }

      const normalizedTitleKey = rawTitle.toLowerCase();
      if (candidateMap.has(normalizedTitleKey)) {
        skippedDuplicateInPayload++;
        skipped.push({
          title: rawTitle,
          reason: 'duplicate_in_payload',
          year: rawYear,
        });
        continue;
      }

      candidateMap.set(normalizedTitleKey, {
        title: rawTitle,
        cast: rawCast,
        englishTranslation: rawTranslation,
        year: rawYear,
      });
    }

    const candidates = Array.from(candidateMap.values());
    if (candidates.length === 0) {
      return {
        success: true,
        message: 'No eligible movies with valid title and englishTranslation found in payload.',
        stats: {
          totalReceived: rawMovies.length,
          insertedCount: 0,
          skippedDuplicates: skippedDuplicateInPayload,
          skippedMissingTranslation,
          skippedInvalid,
        },
        inserted: [],
        skipped,
      };
    }

    // Check existing records in database in batches to avoid huge regex arrays
    const BATCH_SIZE = 200;
    const existingTitleSet = new Set<string>();

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const slice = candidates.slice(i, i + BATCH_SIZE);
      const regexPatterns = slice.map(
        (c) => new RegExp(`^${escapeRegex(c.title)}$`, 'i'),
      );

      const existingDocs = await MovieModel.find({
        title: { $in: regexPatterns },
      })
        .select('title')
        .lean();

      for (const doc of existingDocs) {
        if (doc.title) {
          existingTitleSet.add(doc.title.trim().toLowerCase());
        }
      }
    }

    // Separate new items from existing duplicates
    const toInsert: Array<{ title: string; cast: string; englishTranslation: string; year?: number }> = [];
    let skippedExistingDuplicates = 0;

    for (const candidate of candidates) {
      const key = candidate.title.toLowerCase();
      if (existingTitleSet.has(key)) {
        skippedExistingDuplicates++;
        skipped.push({
          title: candidate.title,
          reason: 'already_exists',
          year: candidate.year,
        });
      } else {
        toInsert.push(candidate);
      }
    }

    let insertedDocs: IMovieDocument[] = [];
    if (toInsert.length > 0) {
      insertedDocs = (await MovieModel.insertMany(toInsert, {
        ordered: false,
      })) as IMovieDocument[];
    }

    const totalSkippedDuplicates =
      skippedExistingDuplicates + skippedDuplicateInPayload;

    return {
      success: true,
      message: `Processed ${rawMovies.length} items: ${insertedDocs.length} inserted, ${totalSkippedDuplicates} duplicates skipped, ${skippedMissingTranslation} skipped without English translation.`,
      stats: {
        totalReceived: rawMovies.length,
        insertedCount: insertedDocs.length,
        skippedDuplicates: totalSkippedDuplicates,
        skippedMissingTranslation,
        skippedInvalid,
      },
      inserted: insertedDocs.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        cast: doc.cast,
        englishTranslation: doc.englishTranslation,
        year: doc.year,
        createdAt: doc.createdAt,
      })),
      skipped,
    };
  }

  /**
   * Retrieves paginated list of movies with optional search and year filtering.
   */
  public async getMovies(options: {
    page?: number;
    limit?: number;
    search?: string;
    year?: number;
  }): Promise<IMovieListResponse> {
    const MovieModel = await getMovieModel();
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (options.year && !isNaN(options.year)) {
      filter['year'] = Number(options.year);
    }

    if (options.search && options.search.trim()) {
      const s = escapeRegex(options.search.trim());
      filter['$or'] = [
        { title: { $regex: s, $options: 'i' } },
        { englishTranslation: { $regex: s, $options: 'i' } },
        { cast: { $regex: s, $options: 'i' } },
      ];
    }

    const [movies, total, distinctYears] = await Promise.all([
      MovieModel.find(filter)
        .sort({ year: -1, title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MovieModel.countDocuments(filter),
      MovieModel.distinct('year', { year: { $exists: true, $ne: null } }),
    ]);

    const sortedYears = (distinctYears as number[])
      .filter((y) => typeof y === 'number' && !isNaN(y))
      .sort((a, b) => b - a);

    return {
      success: true,
      movies: movies.map((m) => ({
        id: m._id.toString(),
        title: m.title,
        cast: m.cast || '',
        englishTranslation: m.englishTranslation,
        year: m.year,
        createdAt: m.createdAt,
      })),
      total,
      page,
      limit,
      years: sortedYears,
    };
  }

  /**
   * Deletes a movie record by ID.
   */
  public async deleteMovie(id: string): Promise<boolean> {
    const MovieModel = await getMovieModel();
    const result = await MovieModel.findByIdAndDelete(id);
    return !!result;
  }
}

export const movieService = new MovieService();
