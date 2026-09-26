import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { DietService } from '../services/diet.service';
import { DietStorageService } from '../services/diet-storage.service';
import { ICreateMealDto, IUpdateMealDto, ILogJunkFoodDto } from '@portfolio/shared-types';

export async function handleGetDayDashboard(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const date = (req.query['date'] as string) || new Date().toISOString().slice(0, 10);
    const dashboard = await DietService.getDayDashboard(userId, date);
    res.json(dashboard);
  } catch (err: any) {
    console.error('[DietController] Error fetching dashboard:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleCreateMeal(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const dto: ICreateMealDto = req.body;
    if (!dto.date || !dto.mealType || !dto.foodName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Fields date, mealType, and foodName are required.',
      });
      return;
    }
    const meal = await DietService.createMeal(userId, dto);
    res.status(201).json(meal);
  } catch (err: any) {
    console.error('[DietController] Error creating meal:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleUpdateMeal(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const mealId = Array.isArray(req.params['mealId'])
      ? req.params['mealId'][0]
      : req.params['mealId'];
    if (!userId || !mealId) {
      res.status(400).json({ error: 'Bad Request', message: 'Missing userId or mealId' });
      return;
    }
    const dto: IUpdateMealDto = req.body;
    const meal = await DietService.updateMeal(userId, mealId, dto);
    if (!meal) {
      res.status(404).json({ error: 'Not Found', message: 'Meal not found or unauthorized' });
      return;
    }
    res.json(meal);
  } catch (err: any) {
    console.error('[DietController] Error updating meal:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleDeleteMeal(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const mealId = Array.isArray(req.params['mealId'])
      ? req.params['mealId'][0]
      : req.params['mealId'];
    if (!userId || !mealId) {
      res.status(400).json({ error: 'Bad Request', message: 'Missing userId or mealId' });
      return;
    }
    const success = await DietService.deleteMeal(userId, mealId);
    if (!success) {
      res.status(404).json({ error: 'Not Found', message: 'Meal not found or unauthorized' });
      return;
    }
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (err: any) {
    console.error('[DietController] Error deleting meal:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleLogJunkFood(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const dto: ILogJunkFoodDto = req.body;
    if (!dto.date || typeof dto.consumed !== 'boolean') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Fields date and consumed (boolean) are required.',
      });
      return;
    }
    const result = await DietService.logJunkFood(userId, dto);
    res.json(result);
  } catch (err: any) {
    console.error('[DietController] Error logging junk food:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleGetUploadUrl(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const { fileName, mimeType } = req.body;
    if (!fileName || !mimeType) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'fileName and mimeType are required in body',
      });
      return;
    }
    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const result = await DietStorageService.getMealPhotoUploadUrl(
      userId,
      fileName,
      mimeType,
      hostUrl,
    );
    res.json(result);
  } catch (err: any) {
    console.error('[DietController] Error generating upload URL:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
