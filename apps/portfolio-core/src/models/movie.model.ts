import { Schema, Document, Model } from 'mongoose';
import { getPortfolioConnection } from '../config/mongoose';

export interface IMovieDocument extends Document {
  title: string;
  cast?: string;
  englishTranslation: string;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const MovieSchema = new Schema<IMovieDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    cast: {
      type: String,
      default: '',
      trim: true,
    },
    englishTranslation: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    year: {
      type: Number,
      required: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

MovieSchema.index({ title: 1, year: 1 });

export async function getMovieModel(): Promise<Model<IMovieDocument>> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['Movie'] as Model<IMovieDocument>) ||
    conn.model<IMovieDocument>('Movie', MovieSchema, 'movies')
  );
}
