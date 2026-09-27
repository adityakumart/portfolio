import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { DietAnalyticsService } from '../services/diet-analytics.service';

export async function handleGetStats(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    const timeframe = (req.query['timeframe'] as 'weekly' | 'monthly') || 'weekly';
    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (req.query['startDate'] && req.query['endDate']) {
      startDate = req.query['startDate'] as string;
      endDate = req.query['endDate'] as string;
    } else if (timeframe === 'monthly') {
      const year = req.query['year']
        ? Number(req.query['year'])
        : now.getFullYear();
      const month = req.query['month']
        ? Number(req.query['month'])
        : now.getMonth() + 1;

      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      startDate = firstDay.toISOString().slice(0, 10);
      endDate = lastDay.toISOString().slice(0, 10);
    } else {
      // Default to last 7 days
      const end = new Date(now);
      const start = new Date(now);
      start.setDate(end.getDate() - 6);
      startDate = start.toISOString().slice(0, 10);
      endDate = end.toISOString().slice(0, 10);
    }

    const stats = await DietAnalyticsService.getStats(
      userId,
      timeframe,
      startDate,
      endDate,
    );
    res.json(stats);
  } catch (err: any) {
    console.error('[DietStatsController] Error fetching stats:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
