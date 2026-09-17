import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller';
import { handleSaveHistory } from '../controllers/chat-history.controller';
import { handleChatStream, handleListChats, handleGetChatMessages } from '../controllers/gemini-chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { chatRateLimiter } from '../middlewares/rate-limit.middleware';

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


