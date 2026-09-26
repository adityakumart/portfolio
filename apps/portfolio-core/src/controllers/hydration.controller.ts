import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { HydrationService } from '../services/hydration.service';
import { ILogHydrationDto, IUpdateDietConfigDto } from '@portfolio/shared-types';

export async function handleLogHydration(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const dto: ILogHydrationDto = req.body;
    if (!dto.date || typeof dto.amountMl !== 'number') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Fields date and amountMl (number) are required.',
      });
      return;
    }
    const entry = await HydrationService.logHydration(userId, dto);
    res.status(201).json(entry);
  } catch (err: any) {
    console.error('[HydrationController] Error logging hydration:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleDeleteHydration(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const entryId = Array.isArray(req.params['entryId'])
      ? req.params['entryId'][0]
      : req.params['entryId'];
    if (!userId || !entryId) {
      res.status(400).json({ error: 'Bad Request', message: 'Missing userId or entryId' });
      return;
    }
    const success = await HydrationService.deleteHydration(userId, entryId);
    if (!success) {
      res.status(404).json({ error: 'Not Found', message: 'Entry not found or unauthorized' });
      return;
    }
    res.json({ success: true, message: 'Hydration entry deleted successfully' });
  } catch (err: any) {
    console.error('[HydrationController] Error deleting hydration:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleGetConfig(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const config = await HydrationService.getConfig(userId);
    res.json(config);
  } catch (err: any) {
    console.error('[HydrationController] Error getting config:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function handleUpdateConfig(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }
    const dto: IUpdateDietConfigDto = req.body;
    const config = await HydrationService.updateConfig(userId, dto);
    res.json(config);
  } catch (err: any) {
    console.error('[HydrationController] Error updating config:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}
