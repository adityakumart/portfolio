import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  handleGetDayDashboard,
  handleCreateMeal,
  handleUpdateMeal,
  handleDeleteMeal,
  handleLogJunkFood,
  handleGetUploadUrl,
} from '../controllers/diet.controller';
import {
  handleLogHydration,
  handleDeleteHydration,
  handleGetConfig,
  handleUpdateConfig,
} from '../controllers/hydration.controller';
import { handleGetStats } from '../controllers/diet-stats.controller';

export const dietHydrationRouter = Router();

// Protect all routes with JWT authentication
dietHydrationRouter.use(authenticateToken);

// Day Dashboard
dietHydrationRouter.get('/day', handleGetDayDashboard);

// Food Logs
dietHydrationRouter.post('/meals', handleCreateMeal);
dietHydrationRouter.put('/meals/:mealId', handleUpdateMeal);
dietHydrationRouter.delete('/meals/:mealId', handleDeleteMeal);
dietHydrationRouter.post('/meals/upload-url', handleGetUploadUrl);

// Hydration Logs
dietHydrationRouter.post('/hydration', handleLogHydration);
dietHydrationRouter.delete('/hydration/:entryId', handleDeleteHydration);

// Junk Food Reflections
dietHydrationRouter.post('/junk-food', handleLogJunkFood);

// Config
dietHydrationRouter.get('/config', handleGetConfig);
dietHydrationRouter.patch('/config', handleUpdateConfig);

// Stats & Aggregations
dietHydrationRouter.get('/stats', handleGetStats);
