import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller';
import { handleSaveHistory } from '../controllers/chat-history.controller';
import { handleChatStream, handleListChats, handleGetChatMessages } from '../controllers/gemini-chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

export const chatRouter = Router();

// Route POST /api/chat
chatRouter.post('/', authenticateToken, handleChat);

// Route POST /api/chat/history (Protected by Auth Token)
chatRouter.post('/history', authenticateToken, handleSaveHistory);

// Streaming routes
chatRouter.post('/stream', authenticateToken, handleChatStream);
chatRouter.get('/chats', authenticateToken, handleListChats);
chatRouter.get('/chats/:chatId/messages', authenticateToken, handleGetChatMessages);


