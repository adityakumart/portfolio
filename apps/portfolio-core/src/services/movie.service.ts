import { AnyBulkWriteOperation } from 'mongoose';
import { getMovieModel, IMovieDocument } from '../models/movie.model';
import {
  IMovie,
  IMovieUploadResponse,
  IMovieListResponse,
  IMovieSkippedDetail,
  IUntranslatedCounts,
  UntranslatedFilterMode,
} from '@portfolio/shared-types';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function getBlankCondition(field: string): Record<string, unknown> {
  return {
    $or: [
      { [field]: { $exists: false } },
      { [field]: null },
      { [field]: '' },
      { [field]: { $regex: /^\s*$/ } },
    ],
  };
}

export class MovieService {
  /**
   * Imports an array of movies with upsert capability:
   * 1. If a record with the same movie title exists (case-insensitive), update its fields with incoming data.
   * 2. If no record with the movie title exists, insert it.
   * 3. Requires at least an englishTranslation or teluguTranslation.
   * 4. Includes year and cast in record.
   */
  public async importMovies(rawMovies: unknown[]): Promise<IMovieUploadResponse> {
    if (!Array.isArray(rawMovies)) {
      throw new Error('Input payload must be a JSON array of movie objects.');
    }

    const MovieModel = await getMovieModel();
    const skipped: IMovieSkippedDetail[] = [];
    const candidateMap = new Map<
      string,
      {
        title: string;
        cast: string;
        englishTranslation: string;
        teluguTranslation: string;
        year?: number;
      }
    >();

    let skippedMissingTranslation = 0;
    let skippedInvalid = 0;

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
      const rawTeluguTranslation =
        typeof raw['teluguTranslation'] === 'string'
          ? raw['teluguTranslation'].trim()
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

      // Check for at least one translation (english or telugu)
      if (!rawTranslation && !rawTeluguTranslation) {
        skippedMissingTranslation++;
        skipped.push({
          title: rawTitle,
          reason: 'missing_translation',
          year: rawYear,
        });
        continue;
      }

      const normalizedTitleKey = rawTitle.toLowerCase();
      const existingCandidate = candidateMap.get(normalizedTitleKey);
      if (existingCandidate) {
        if (rawTranslation) existingCandidate.englishTranslation = rawTranslation;
        if (rawTeluguTranslation) existingCandidate.teluguTranslation = rawTeluguTranslation;
        if (rawCast) existingCandidate.cast = rawCast;
        if (rawYear) existingCandidate.year = rawYear;
      } else {
        candidateMap.set(normalizedTitleKey, {
          title: rawTitle,
          cast: rawCast,
          englishTranslation: rawTranslation,
          teluguTranslation: rawTeluguTranslation,
          year: rawYear,
        });
      }
    }

    const candidates = Array.from(candidateMap.values());
    if (candidates.length === 0) {
      return {
        success: true,
        message: 'No eligible movies with valid title and translation found in payload.',
        stats: {
          totalReceived: rawMovies.length,
          insertedCount: 0,
          updatedCount: 0,
          skippedDuplicates: 0,
          skippedMissingTranslation,
          skippedInvalid,
        },
        inserted: [],
        updated: [],
        skipped,
      };
    }

    // Check existing records in database in batches
    const BATCH_SIZE = 200;
    const existingDocMap = new Map<
      string,
      { _id: unknown; title: string; englishTranslation?: string; teluguTranslation?: string; cast?: string; year?: number }
    >();

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const slice = candidates.slice(i, i + BATCH_SIZE);
      const regexPatterns = slice.map(
        (c) => new RegExp(`^${escapeRegex(c.title)}$`, 'i'),
      );

      const existingDocs = await MovieModel.find({
        title: { $in: regexPatterns },
      })
        .select('_id title englishTranslation teluguTranslation cast year')
        .lean();

      for (const doc of existingDocs) {
        if (doc.title) {
          existingDocMap.set(doc.title.trim().toLowerCase(), doc);
        }
      }
    }

    // Separate into records to update vs records to insert
    const toInsert: Array<{
      title: string;
      cast: string;
      englishTranslation: string;
      teluguTranslation: string;
      year?: number;
    }> = [];

    const toUpdate: Array<{
      id: unknown;
      fields: Record<string, unknown>;
      title: string;
      year?: number;
    }> = [];

    for (const candidate of candidates) {
      const key = candidate.title.toLowerCase();
      const existing = existingDocMap.get(key);

      if (existing) {
        const updateFields: Record<string, unknown> = {};

        if (candidate.teluguTranslation) {
          updateFields['teluguTranslation'] = candidate.teluguTranslation;
        }
        if (candidate.englishTranslation) {
          updateFields['englishTranslation'] = candidate.englishTranslation;
        }
        if (candidate.cast) {
          updateFields['cast'] = candidate.cast;
        }
        if (candidate.year !== undefined) {
          updateFields['year'] = candidate.year;
        }

        if (Object.keys(updateFields).length > 0) {
          toUpdate.push({
            id: existing._id,
            fields: updateFields,
            title: candidate.title,
            year: candidate.year || existing.year,
          });
        }
      } else {
        toInsert.push(candidate);
      }
    }

    // Execute bulk updates for existing movies
    if (toUpdate.length > 0) {
      const bulkOps: AnyBulkWriteOperation<IMovieDocument>[] = toUpdate.map(
        (item) => ({
          updateOne: {
            filter: { _id: item.id as any },
            update: { $set: item.fields },
          },
        }),
      );

      const BULK_CHUNK = 500;
      for (let i = 0; i < bulkOps.length; i += BULK_CHUNK) {
        await MovieModel.bulkWrite(bulkOps.slice(i, i + BULK_CHUNK), {
          ordered: false,
        });
      }
    }

    // Execute inserts for new movies
    let insertedDocs: IMovieDocument[] = [];
    if (toInsert.length > 0) {
      insertedDocs = (await MovieModel.insertMany(toInsert, {
        ordered: false,
      })) as IMovieDocument[];
    }

    return {
      success: true,
      message: `Processed ${rawMovies.length} items: ${insertedDocs.length} inserted, ${toUpdate.length} updated by matching title, ${skippedMissingTranslation} skipped without translation.`,
      stats: {
        totalReceived: rawMovies.length,
        insertedCount: insertedDocs.length,
        updatedCount: toUpdate.length,
        skippedDuplicates: 0,
        skippedMissingTranslation,
        skippedInvalid,
      },
      inserted: insertedDocs.map((doc) => ({
        id: doc._id.toString(),
        title: doc.title,
        cast: doc.cast,
        englishTranslation: doc.englishTranslation,
        teluguTranslation: doc.teluguTranslation,
        year: doc.year,
        createdAt: doc.createdAt,
      })),
      updated: toUpdate.map((u) => ({
        id: String(u.id),
        title: u.title,
        year: u.year,
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
        { teluguTranslation: { $regex: s, $options: 'i' } },
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
        englishTranslation: m.englishTranslation || '',
        teluguTranslation: m.teluguTranslation || '',
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

  /**
   * Retrieves counts of movies with missing translations by category.
   */
  public async getUntranslatedCounts(): Promise<IUntranslatedCounts> {
    const MovieModel = await getMovieModel();
    const condEn = getBlankCondition('englishTranslation');
    const condTe = getBlankCondition('teluguTranslation');

    const [missingBoth, missingEither, missingEnglish, missingTelugu] =
      await Promise.all([
        MovieModel.countDocuments({ $and: [condEn, condTe] }),
        MovieModel.countDocuments({ $or: [condEn, condTe] }),
        MovieModel.countDocuments(condEn),
        MovieModel.countDocuments(condTe),
      ]);

    return {
      missingBoth,
      missingEither,
      missingEnglish,
      missingTelugu,
    };
  }

  /**
   * Deletes movie records where translations are missing.
   * mode = 'both': deletes records missing BOTH English and Telugu translations (neither present).
   * mode = 'either': deletes records missing EITHER English or Telugu translations.
   * mode = 'english': deletes records missing English translation.
   * mode = 'telugu': deletes records missing Telugu translation.
   */
  public async deleteUntranslatedMovies(
    mode: UntranslatedFilterMode = 'both',
  ): Promise<{ deletedCount: number }> {
    const MovieModel = await getMovieModel();
    const condEn = getBlankCondition('englishTranslation');
    const condTe = getBlankCondition('teluguTranslation');

    let filter: Record<string, unknown>;
    switch (mode) {
      case 'either':
        filter = { $or: [condEn, condTe] };
        break;
      case 'english':
        filter = condEn;
        break;
      case 'telugu':
        filter = condTe;
        break;
      case 'both':
      default:
        filter = { $and: [condEn, condTe] };
        break;
    }

    const result = await MovieModel.deleteMany(filter);
    return { deletedCount: result.deletedCount || 0 };
  }
}

export const movieService = new MovieService();
