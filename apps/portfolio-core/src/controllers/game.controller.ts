import { Request, Response } from 'express';
import { gameService } from '../services/game.service';

/**
 * Handles batch retrieval of random game words with exclusion of already seen IDs.
 */
export async function handleFetchWordsBatch(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const limit = req.body?.limit ? Number(req.body.limit) : 10;
    const excludeIds = Array.isArray(req.body?.excludeIds)
      ? req.body.excludeIds
      : [];

    const result = await gameService.getRandomWords({ limit, excludeIds });
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching game words batch:', err);
    res.status(500).json({
      success: false,
      error: 'Fetch Failed',
      message: err.message || 'An error occurred fetching game words batch.',
    });
  }
}
