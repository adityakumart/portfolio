import { Router } from 'express';
import { signup, login, logout, refresh } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
