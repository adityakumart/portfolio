import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { GeminiAiService } from '../services/gemini.service';
import { ChatHistoryService } from '../services/chat-history.service';

/**
 * Handles incoming user chat requests, invokes Gemini API, and returns response
 */
export async function handleChat(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req;
    const { message, history } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ 
        error: 'Bad Request', 
        message: 'A valid prompt string "message" is required.' 
      });
      return;
    }

    // Invoke backend service
    const reply = await GeminiAiService.generateResponse(message, history || []);

    // Save history asynchronously in the background so it does not block the response
    if (userId) {
      const modelUsed = process.env['GEMINI_MODEL'] || 'gemini-flash-latest';
      ChatHistoryService.saveChat(userId, {
        userPrompt: message,
        aiResponse: reply,
        modelUsed
      }).catch(err => {
        console.error('Failed to save chat history in background:', err);
      });
    }

    res.status(200).json({ reply });
  } catch (error: unknown) {
    console.error('Chat controller error:', error);
    const err = error as Error;
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message || 'An error occurred while processing your query with the AI Assistant.' 
    });
  }
}
