import { Types, PipelineStage } from 'mongoose';
import { getMovieModel } from '../models/movie.model';
import {
  IFetchGameWordsResponse,
  IMovieWordDto,
} from '@portfolio/shared-types';

export class GameService {
  /**
   * Samples random movies that have an English translation, excluding already seen IDs.
   */
  public async getRandomWords(options: {
    limit: number;
    excludeIds?: string[];
  }): Promise<IFetchGameWordsResponse> {
    const MovieModel = await getMovieModel();
    const limit = Math.min(30, Math.max(1, Number(options.limit) || 10));

    const objectIdsToExclude: Types.ObjectId[] = (options.excludeIds || [])
      .filter((id) => typeof id === 'string' && Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: { $nin: objectIdsToExclude },
          englishTranslation: { $exists: true, $ne: '' },
        },
      },
      {
        $sample: { size: limit },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          cast: 1,
          englishTranslation: 1,
          teluguTranslation: 1,
          year: 1,
        },
      },
    ];

    const rawResults = await MovieModel.aggregate(pipeline).exec();

    const words: IMovieWordDto[] = rawResults.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title,
      cast: doc.cast || '',
      englishTranslation: doc.englishTranslation || '',
      teluguTranslation: doc.teluguTranslation || '',
      year: doc.year,
    }));

    // Check if more words exist for subsequent emergency / chunk fetches
    const newlyFetchedIds = words.map((w) => new Types.ObjectId(w.id));
    const remainingCount = await MovieModel.countDocuments({
      _id: { $nin: [...objectIdsToExclude, ...newlyFetchedIds] },
      englishTranslation: { $exists: true, $ne: '' },
    });

    return {
      success: true,
      words,
      count: words.length,
      hasMore: remainingCount > 0,
    };
  }
}

export const gameService = new GameService();
