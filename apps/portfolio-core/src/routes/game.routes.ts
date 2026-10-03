import { Router } from 'express';
import { handleFetchWordsBatch } from '../controllers/game.controller';

export const gameRouter = Router();

// Retrieve random translation words in batch with exclusion of served IDs
gameRouter.post('/words/batch', handleFetchWordsBatch);
