import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller';

export const chatRouter = Router();

// Route POST /api/chat
chatRouter.post('/', handleChat);
