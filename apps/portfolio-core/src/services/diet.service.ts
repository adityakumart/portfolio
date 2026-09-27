import { Types } from 'mongoose';
import {
  ICreateMealDto,
  IUpdateMealDto,
  ILogJunkFoodDto,
  IMealItem,
  IJunkFoodLog,
  IDailyDashboard,
  MealType,
} from '@portfolio/shared-types';
import {
  getDietLogModel,
  getJunkFoodDailyLogModel,
  IDietLogDocument,
} from '../models/diet-log.model';
import { HydrationService } from './hydration.service';
import { DietStorageService } from './diet-storage.service';

export class DietService {
  private static toMealItem(doc: IDietLogDocument): IMealItem {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: doc.date,
      mealType: doc.mealType,
      foodName: doc.foodName,
      portionSize: doc.portionSize,
      estimatedCalories: doc.estimatedCalories,
      mealTime: doc.mealTime,
      imageUrl: doc.imageUrl,
      imageStorageKey: doc.imageStorageKey,
      notes: doc.notes,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  static async createMeal(
    userId: string,
    dto: ICreateMealDto,
  ): Promise<IMealItem> {
    const DietLog = await getDietLogModel();
    const doc = await DietLog.create({
      userId: new Types.ObjectId(userId),
      date: dto.date,
      mealType: dto.mealType,
      foodName: dto.foodName,
      portionSize: dto.portionSize,
      estimatedCalories: dto.estimatedCalories,
      mealTime: dto.mealTime,
      imageUrl: dto.imageUrl,
      imageStorageKey: dto.imageStorageKey,
      notes: dto.notes,
    });
    return this.toMealItem(doc);
  }

  static async updateMeal(
    userId: string,
    mealId: string,
    dto: IUpdateMealDto,
  ): Promise<IMealItem | null> {
    const DietLog = await getDietLogModel();
    const updated = await DietLog.findOneAndUpdate(
      { _id: new Types.ObjectId(mealId), userId: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true },
    );
    return updated ? this.toMealItem(updated) : null;
  }

  static async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    const DietLog = await getDietLogModel();
    const existing = await DietLog.findOneAndDelete({
      _id: new Types.ObjectId(mealId),
      userId: new Types.ObjectId(userId),
    });
    if (existing && existing.imageStorageKey) {
      // Clean up asset in background
      DietStorageService.deleteMealPhoto(existing.imageStorageKey).catch(() => {});
    }
    return !!existing;
  }

  static async getDayMeals(
    userId: string,
    date: string,
  ): Promise<Record<MealType, IMealItem[]>> {
    const DietLog = await getDietLogModel();
    const logs = await DietLog.find({
      userId: new Types.ObjectId(userId),
      date,
    }).sort({ mealTime: 1, createdAt: 1 });

    const grouped: Record<MealType, IMealItem[]> = {
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: [],
    };

    for (const log of logs) {
      if (grouped[log.mealType]) {
        grouped[log.mealType].push(this.toMealItem(log));
      }
    }

    return grouped;
  }

  static async logJunkFood(
    userId: string,
    dto: ILogJunkFoodDto,
  ): Promise<IJunkFoodLog> {
    const JunkFoodLog = await getJunkFoodDailyLogModel();
    const userObjId = new Types.ObjectId(userId);

    const doc = await JunkFoodLog.findOneAndUpdate(
      { userId: userObjId, date: dto.date },
      {
        $set: {
          consumed: dto.consumed,
          itemsDescription: dto.consumed ? dto.itemsDescription : null,
          cravingTrigger: dto.consumed ? dto.cravingTrigger : null,
          loggedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: doc.date,
      recorded: true,
      consumed: doc.consumed,
      itemsDescription: doc.itemsDescription,
      cravingTrigger: doc.cravingTrigger,
      loggedAt: doc.loggedAt?.toISOString(),
    };
  }

  static async getDayJunkFood(
    userId: string,
    date: string,
  ): Promise<IJunkFoodLog> {
    const JunkFoodLog = await getJunkFoodDailyLogModel();
    const doc = await JunkFoodLog.findOne({
      userId: new Types.ObjectId(userId),
      date,
    });

    if (!doc) {
      return {
        userId,
        date,
        recorded: false,
        consumed: false,
        itemsDescription: null,
        cravingTrigger: null,
      };
    }

    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: doc.date,
      recorded: true,
      consumed: doc.consumed,
      itemsDescription: doc.itemsDescription,
      cravingTrigger: doc.cravingTrigger,
      loggedAt: doc.loggedAt?.toISOString(),
    };
  }

  static async getDayDashboard(
    userId: string,
    date: string,
  ): Promise<IDailyDashboard> {
    const [meals, hydration, junkFood] = await Promise.all([
      this.getDayMeals(userId, date),
      HydrationService.getDayHydration(userId, date),
      this.getDayJunkFood(userId, date),
    ]);

    let totalCalories = 0;
    Object.values(meals).forEach((mealList) => {
      mealList.forEach((m) => {
        if (m.estimatedCalories) {
          totalCalories += m.estimatedCalories;
        }
      });
    });

    return {
      date,
      meals,
      totalCalories,
      hydration,
      junkFood: {
        recorded: junkFood.recorded,
        consumed: junkFood.consumed,
        itemsDescription: junkFood.itemsDescription,
        cravingTrigger: junkFood.cravingTrigger,
      },
    };
  }
}
