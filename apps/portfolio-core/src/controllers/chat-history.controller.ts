import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { ChatHistoryService } from '../services/chat-history.service';
import { SaveChatHistoryDto, SaveChatHistoryResponse } from '@portfolio/shared-types';

/**
 * Handles saving user chat interaction history
 */
export async function handleSaveHistory(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { userId } = req;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User authentication credentials are missing.',
      });
      return;
    }

    const { userPrompt, aiResponse, modelUsed } = req.body as SaveChatHistoryDto;

    // 1. Strict Input Validation (Guards against NoSQL injection and invalid schemas)
    if (typeof userPrompt !== 'string' || !userPrompt.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'A valid, non-empty "userPrompt" string is required.',
      });
      return;
    }

    if (typeof aiResponse !== 'string' || !aiResponse.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'A valid, non-empty "aiResponse" string is required.',
      });
      return;
    }

    if (modelUsed !== undefined && typeof modelUsed !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'If provided, "modelUsed" must be a valid string.',
      });
      return;
    }

    // 2. Call backend service to save to MongoDB
    const savedDoc = await ChatHistoryService.saveChat(userId, {
      userPrompt,
      aiResponse,
      modelUsed,
    });

    // 3. Format response according to SaveChatHistoryResponse DTO structure
    const responsePayload: SaveChatHistoryResponse = {
      success: true,
      message: 'Chat history entry saved successfully.',
      data: {
        id: savedDoc._id ? savedDoc._id.toString() : '',
        userId: savedDoc.userId.toString(),
        userPrompt: savedDoc.userPrompt,
        aiResponse: savedDoc.aiResponse,
        modelUsed: savedDoc.modelUsed,
        createdAt: savedDoc.createdAt.toISOString(),
      },
    };

    res.status(200).json(responsePayload);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Chat history controller error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An error occurred while saving chat history.',
    });
  }
}
