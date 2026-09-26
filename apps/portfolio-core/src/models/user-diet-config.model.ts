import { Schema, Document, Model, Types } from 'mongoose';
import { IUserDietConfig } from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface IUserDietConfigDocument extends Document {
  userId: Types.ObjectId;
  hydration: {
    dailyTargetMl: number;
    unit: 'ml' | 'oz';
    cupPresetMl: number;
    remindersEnabled: boolean;
    reminderIntervalMinutes: number;
    reminderStartTime: string;
    reminderEndTime: string;
  };
  junkFoodPrompt: {
    enabled: boolean;
    promptTime: string;
  };
  createdAt: Date;
  updatedAt: Date;
  toClientJSON(): IUserDietConfig;
}

export const UserDietConfigSchema = new Schema<IUserDietConfigDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
      ref: 'user',
    },
    hydration: {
      dailyTargetMl: {
        type: Number,
        default: 2500,
        min: 500,
        max: 10000,
      },
      unit: {
        type: String,
        enum: ['ml', 'oz'],
        default: 'ml',
      },
      cupPresetMl: {
        type: Number,
        default: 250,
        min: 50,
        max: 1500,
      },
      remindersEnabled: {
        type: Boolean,
        default: false,
      },
      reminderIntervalMinutes: {
        type: Number,
        default: 60,
        min: 15,
        max: 360,
      },
      reminderStartTime: {
        type: String,
        default: '08:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
      reminderEndTime: {
        type: String,
        default: '22:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
    },
    junkFoodPrompt: {
      enabled: {
        type: Boolean,
        default: true,
      },
      promptTime: {
        type: String,
        default: '21:00',
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
    },
  },
  {
    timestamps: true,
  },
);

UserDietConfigSchema.methods['toClientJSON'] = function (): IUserDietConfig {
  const doc = this as IUserDietConfigDocument;
  return {
    userId: doc.userId.toString(),
    hydration: {
      dailyTargetMl: doc.hydration.dailyTargetMl,
      unit: doc.hydration.unit,
      cupPresetMl: doc.hydration.cupPresetMl,
      remindersEnabled: doc.hydration.remindersEnabled,
      reminderIntervalMinutes: doc.hydration.reminderIntervalMinutes,
      reminderStartTime: doc.hydration.reminderStartTime,
      reminderEndTime: doc.hydration.reminderEndTime,
    },
    junkFoodPrompt: {
      enabled: doc.junkFoodPrompt.enabled,
      promptTime: doc.junkFoodPrompt.promptTime,
    },
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  };
};

export async function getUserDietConfigModel(): Promise<
  Model<IUserDietConfigDocument>
> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['UserDietConfig'] as Model<IUserDietConfigDocument>) ||
    conn.model<IUserDietConfigDocument>(
      'UserDietConfig',
      UserDietConfigSchema,
      'user_diet_configs',
    )
  );
}
