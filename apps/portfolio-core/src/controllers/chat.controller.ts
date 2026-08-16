import { Request, Response } from 'express';
import { GeminiAiService } from '../services/gemini.service';

/**
 * Handles incoming user chat requests, invokes Gemini API, and returns response
 */
export async function handleChat(req: Request, res: Response) {
  try {
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

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Chat controller error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message || 'An error occurred while processing your query with the AI Assistant.' 
    });
  }
}
