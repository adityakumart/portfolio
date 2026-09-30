import { Router } from 'express';
import { signup, login, logout, refresh, updateModules } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rate-limit.middleware';

export const authRouter = Router();

authRouter.post('/signup', authRateLimiter, signup);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
authRouter.patch('/modules', updateModules);
authRouter.patch('/users/:id/modules', updateModules);
