import { Types } from 'mongoose';
import { IDietStatsResponse, IDailyHydrationStat, IDailyJunkFoodStat } from '@portfolio/shared-types';
import { getHydrationLogModel } from '../models/hydration-log.model';
import { getJunkFoodDailyLogModel } from '../models/diet-log.model';
import { HydrationService } from './hydration.service';

export class DietAnalyticsService {
  /**
   * Generates weekly or monthly statistics using native MongoDB aggregation pipelines.
   */
  static async getStats(
    userId: string,
    timeframe: 'weekly' | 'monthly',
    startDate: string,
    endDate: string,
  ): Promise<IDietStatsResponse> {
    const userObjId = new Types.ObjectId(userId);
    const [HydrationLog, JunkFoodLog, config] = await Promise.all([
      getHydrationLogModel(),
      getJunkFoodDailyLogModel(),
      HydrationService.getConfig(userId),
    ]);

    const targetMl = config.hydration.dailyTargetMl || 2500;

    // 1. Aggregation pipeline for hydration trends
    const hydrationAgg: Array<{ _id: string; totalIntakeMl: number; logCount: number }> =
      await HydrationLog.aggregate([
        {
          $match: {
            userId: userObjId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$date',
            totalIntakeMl: { $sum: '$amountMl' },
            logCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    const hydrationMap = new Map<string, { totalIntakeMl: number; logCount: number }>();
    hydrationAgg.forEach((h) => {
      hydrationMap.set(h._id, {
        totalIntakeMl: h.totalIntakeMl,
        logCount: h.logCount,
      });
    });

    // 2. Aggregation pipeline for junk food & clean day habits
    const [junkFoodFacetResult]: any = await JunkFoodLog.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          records: [
            {
              $project: {
                _id: 0,
                date: 1,
                consumed: 1,
                itemsDescription: 1,
                cravingTrigger: 1,
              },
            },
            { $sort: { date: 1 } },
          ],
          cravings: [
            {
              $match: {
                consumed: true,
                cravingTrigger: { $ne: null },
              },
            },
            {
              $group: {
                _id: '$cravingTrigger',
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const junkFoodRecords: IDailyJunkFoodStat[] =
      junkFoodFacetResult?.records || [];
    const cravingsList: Array<{ _id: string; count: number }> =
      junkFoodFacetResult?.cravings || [];

    const cravingsCount: Record<string, number> = {};
    cravingsList.forEach((c) => {
      if (c._id) cravingsCount[c._id] = c.count;
    });

    let cleanDaysCount = 0;
    let junkDaysCount = 0;
    junkFoodRecords.forEach((r) => {
      if (r.consumed) {
        junkDaysCount++;
      } else {
        cleanDaysCount++;
      }
    });

    const totalDaysLogged = cleanDaysCount + junkDaysCount;
    const cleanStreakPercentage =
      totalDaysLogged > 0
        ? Math.round((cleanDaysCount / totalDaysLogged) * 100)
        : 100;

    // Generate date sequence between startDate and endDate
    const dates: string[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      dates.push(curr.toISOString().slice(0, 10));
      curr.setDate(curr.getDate() + 1);
    }

    const hydrationStats: IDailyHydrationStat[] = dates.map((d) => {
      const data = hydrationMap.get(d);
      return {
        date: d,
        totalIntakeMl: data ? data.totalIntakeMl : 0,
        targetMl,
        logCount: data ? data.logCount : 0,
      };
    });

    return {
      timeframe,
      startDate,
      endDate,
      hydrationStats,
      junkFoodStats: {
        breakdown: junkFoodRecords,
        totalDaysLogged,
        cleanDaysCount,
        junkDaysCount,
        cleanStreakPercentage,
        cravingsCount,
      },
    };
  }
}
