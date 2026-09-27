import { Schema, Document, Model, Types } from 'mongoose';
import { HydrationSource } from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface IHydrationLogDocument extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  amountMl: number;
  time: string; // HH:mm
  source: HydrationSource;
  createdAt: Date;
}

export const HydrationLogSchema = new Schema<IHydrationLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'user',
    },
    date: {
      type: String,
      required: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    amountMl: {
      type: Number,
      required: true,
      min: 1,
      max: 5000,
    },
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    source: {
      type: String,
      enum: ['water', 'tea', 'electrolyte', 'other'],
      default: 'water',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

HydrationLogSchema.index({ userId: 1, date: 1, createdAt: 1 });

export async function getHydrationLogModel(): Promise<
  Model<IHydrationLogDocument>
> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['HydrationLog'] as Model<IHydrationLogDocument>) ||
    conn.model<IHydrationLogDocument>(
      'HydrationLog',
      HydrationLogSchema,
      'hydration_logs',
    )
  );
}
