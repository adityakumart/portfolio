import { Schema, Document, Model, Types } from 'mongoose';
import { MealType, CravingTrigger } from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface IDietLogDocument extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  portionSize?: string;
  estimatedCalories?: number;
  mealTime?: string; // HH:mm
  imageUrl?: string;
  imageStorageKey?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DietLogSchema = new Schema<IDietLogDocument>(
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
    mealType: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    portionSize: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    estimatedCalories: {
      type: Number,
      min: 0,
      max: 10000,
    },
    mealTime: {
      type: String,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    imageStorageKey: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

DietLogSchema.index({ userId: 1, date: 1, mealType: 1 });

export interface IJunkFoodDailyLogDocument extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  consumed: boolean;
  itemsDescription?: string;
  cravingTrigger?: CravingTrigger;
  loggedAt: Date;
}

export const JunkFoodDailyLogSchema = new Schema<IJunkFoodDailyLogDocument>(
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
    consumed: {
      type: Boolean,
      required: true,
    },
    itemsDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    cravingTrigger: {
      type: String,
      enum: ['stress', 'social', 'late_night', 'boredom', 'routine', 'other'],
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

// Enforce unique log per user per calendar day
JunkFoodDailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export async function getDietLogModel(): Promise<Model<IDietLogDocument>> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['DietLog'] as Model<IDietLogDocument>) ||
    conn.model<IDietLogDocument>('DietLog', DietLogSchema, 'diet_logs')
  );
}

export async function getJunkFoodDailyLogModel(): Promise<
  Model<IJunkFoodDailyLogDocument>
> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['JunkFoodDailyLog'] as Model<IJunkFoodDailyLogDocument>) ||
    conn.model<IJunkFoodDailyLogDocument>(
      'JunkFoodDailyLog',
      JunkFoodDailyLogSchema,
      'junk_food_daily_logs',
    )
  );
}
