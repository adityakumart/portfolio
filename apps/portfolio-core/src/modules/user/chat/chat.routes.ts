import { Router } from 'express';
import { handleChat } from './chat.controller';
import { handleSaveHistory } from './chat-history.controller';
import { handleChatStream, handleListChats, handleGetChatMessages } from './gemini-chat.controller';
import { authenticateToken } from '../auth/auth.middleware';
import { chatRateLimiter } from '../../../common/middlewares/rate-limit.middleware';

export const chatRouter = Router();

// Route POST /api/chat (Rate-limited AI generation)
chatRouter.post('/', authenticateToken, chatRateLimiter, handleChat);

// Route POST /api/chat/history (Protected by Auth Token)
chatRouter.post('/history', authenticateToken, handleSaveHistory);

// Streaming routes (Rate-limited AI generation)
chatRouter.post('/stream', authenticateToken, chatRateLimiter, handleChatStream);

// History and management routes (Not subject to AI token limits)
chatRouter.get('/chats', authenticateToken, handleListChats);
chatRouter.get('/chats/:chatId/messages', authenticateToken, handleGetChatMessages);


