import { Types } from 'mongoose';
import {
  ILogHydrationDto,
  IHydrationEntry,
  IUserDietConfig,
  IUpdateDietConfigDto,
} from '@portfolio/shared-types';
import {
  getHydrationLogModel,
  IHydrationLogDocument,
} from '../models/hydration-log.model';
import {
  getUserDietConfigModel,
  IUserDietConfigDocument,
} from '../models/user-diet-config.model';

export class HydrationService {
  private static toHydrationEntry(doc: any): IHydrationEntry {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: doc.date,
      amountMl: doc.amountMl,
      time: doc.time,
      source: doc.source,
      createdAt: doc.createdAt?.toISOString(),
    };
  }

  static async getConfig(userId: string): Promise<IUserDietConfig> {
    const UserDietConfig = await getUserDietConfigModel();
    const userObjId = new Types.ObjectId(userId);

    try {
      const doc = await UserDietConfig.findOneAndUpdate(
        { userId: userObjId },
        {
          $setOnInsert: {
            userId: userObjId,
            hydration: {
              dailyTargetMl: 2500,
              unit: 'ml',
              cupPresetMl: 250,
              remindersEnabled: false,
              reminderIntervalMinutes: 60,
              reminderStartTime: '08:00',
              reminderEndTime: '22:00',
            },
            junkFoodPrompt: {
              enabled: true,
              promptTime: '21:00',
            },
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      return doc.toClientJSON();
    } catch (err: any) {
      if (err.code === 11000) {
        const existing = await UserDietConfig.findOne({ userId: userObjId });
        if (existing) {
          return existing.toClientJSON();
        }
      }
      throw err;
    }
  }

  static async updateConfig(
    userId: string,
    dto: IUpdateDietConfigDto,
  ): Promise<IUserDietConfig> {
    const UserDietConfig = await getUserDietConfigModel();
    const userObjId = new Types.ObjectId(userId);

    const updateFields: Record<string, any> = {};
    if (dto.hydration) {
      Object.entries(dto.hydration).forEach(([k, v]) => {
        if (v !== undefined) {
          updateFields[`hydration.${k}`] = v;
        }
      });
    }
    if (dto.junkFoodPrompt) {
      Object.entries(dto.junkFoodPrompt).forEach(([k, v]) => {
        if (v !== undefined) {
          updateFields[`junkFoodPrompt.${k}`] = v;
        }
      });
    }

    const doc = await UserDietConfig.findOneAndUpdate(
      { userId: userObjId },
      { $set: updateFields },
      { upsert: true, new: true },
    );
    return doc.toClientJSON();
  }

  static async logHydration(
    userId: string,
    dto: ILogHydrationDto,
  ): Promise<IHydrationEntry> {
    const HydrationLog = await getHydrationLogModel();
    const now = new Date();
    const time =
      dto.time ||
      `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`;

    const doc = await HydrationLog.create({
      userId: new Types.ObjectId(userId),
      date: dto.date,
      amountMl: dto.amountMl,
      time,
      source: dto.source || 'water',
      createdAt: now,
    });

    return this.toHydrationEntry(doc);
  }

  static async deleteHydration(
    userId: string,
    entryId: string,
  ): Promise<boolean> {
    const HydrationLog = await getHydrationLogModel();
    const result = await HydrationLog.findOneAndDelete({
      _id: new Types.ObjectId(entryId),
      userId: new Types.ObjectId(userId),
    });
    return !!result;
  }

  static async getDayHydration(
    userId: string,
    date: string,
  ): Promise<{
    totalMl: number;
    targetMl: number;
    progressPercentage: number;
    entries: IHydrationEntry[];
  }> {
    const [HydrationLog, config] = await Promise.all([
      getHydrationLogModel(),
      this.getConfig(userId),
    ]);

    const entries = await HydrationLog.find({
      userId: new Types.ObjectId(userId),
      date,
    }).sort({ time: 1, createdAt: 1 });

    const totalMl = entries.reduce((acc, curr) => acc + curr.amountMl, 0);
    const targetMl = config.hydration.dailyTargetMl || 2500;
    const progressPercentage = Math.min(
      100,
      Math.round((totalMl / targetMl) * 100),
    );

    return {
      totalMl,
      targetMl,
      progressPercentage,
      entries: entries.map((e) => this.toHydrationEntry(e)),
    };
  }
}
