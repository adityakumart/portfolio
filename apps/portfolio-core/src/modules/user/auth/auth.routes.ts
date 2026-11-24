import { Router } from 'express';
import { signup, login, logout, refresh, updateModules, getPermissions } from './auth.controller';
import { authRateLimiter } from '../../../common/middlewares/rate-limit.middleware';
import { authenticateToken } from './auth.middleware';

export const authRouter = Router();

authRouter.post('/signup', authRateLimiter, signup);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
authRouter.get('/permissions', authenticateToken, getPermissions);
authRouter.patch('/modules', updateModules);
authRouter.patch('/users/:id/modules', updateModules);
