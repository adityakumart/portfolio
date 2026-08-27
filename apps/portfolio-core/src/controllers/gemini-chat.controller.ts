import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { connectToDatabase } from '../utils/DB/mongodb';
import { ObjectId } from 'mongodb';
import { IChat, IMessage } from '@portfolio/shared-types';

/**
 * Handle POST /api/chat/stream
 * Accepts { prompt, chatId }
 * Streams Gemini response back using Server-Sent Events (SSE)
 */
export async function handleChatStream(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;
    const { prompt, chatId } = req.body;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be authenticated.',
      });
      return;
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'A valid "prompt" string is required.',
      });
      return;
    }

    const db = await connectToDatabase();
    let activeChatId = chatId;
    let chatObjectId: ObjectId;

    // 1. Context tracking & Chat creation
    if (!activeChatId) {
      const cleanPrompt = prompt.replace(/\s+/g, ' ').trim();
      const chatTitle =
        cleanPrompt.length > 40
          ? cleanPrompt.substring(0, 40) + '...'
          : cleanPrompt;

      const chatResult = await db.collection<IChat>('chats').insertOne({
        userId: new ObjectId(userId),
        title: chatTitle,
        createdAt: new Date(),
      });
      chatObjectId = chatResult.insertedId;
      activeChatId = chatResult.insertedId.toString();
    } else {
      if (typeof activeChatId !== 'string') {
        res
          .status(400)
          .json({ error: 'Bad Request', message: 'chatId must be a string.' });
        return;
      }
      try {
        chatObjectId = new ObjectId(activeChatId);
      } catch (err) {
        res
          .status(400)
          .json({ error: 'Bad Request', message: 'Invalid chatId format.' });
        return;
      }

      // Verify ownership of the chat
      const chat = await db.collection<IChat>('chats').findOne({
        _id: chatObjectId,
        userId: new ObjectId(userId),
      });

      if (!chat) {
        res.status(404).json({
          error: 'Not Found',
          message: 'The requested chat was not found or access is denied.',
        });
        return;
      }
    }

    // 2. Fetch history if chatId exists
    const previousMessages = await db
      .collection<IMessage>('messages')
      .find({ chatId: chatObjectId })
      .sort({ createdAt: 1 })
      .toArray();

    // 3. Format history array for @google/genai
    const contents: any[] = previousMessages.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // Append current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: prompt.trim() }],
    });

    // 4. Save User prompt to Messages database
    await db.collection<IMessage>('messages').insertOne({
      chatId: chatObjectId,
      role: 'user',
      text: prompt.trim(),
      createdAt: new Date(),
    });

    // 5. Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // First chunk streams the metadata (including the activeChatId)
    res.write(
      `data: ${JSON.stringify({ type: 'metadata', chatId: activeChatId })}\n\n`,
    );

    // 6. Connect to Google Gemini API using @google/genai (dynamic runtime ESM import)
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY is not configured on the backend server.',
      );
    }

    const sdk = await (Function(
      'return import("@google/genai")',
    )() as Promise<any>);
    const ai = new sdk.GoogleGenAI({ apiKey });
    const model = process.env['GEMINI_MODEL'] || 'gemini-flash-latest';
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: contents,
    });

    let accumulatedText = '';

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        accumulatedText += text;
        res.write(`data: ${JSON.stringify({ type: 'text', text })}\n\n`);
      }
    }

    // 7. Save accumulated Model response to Messages database
    if (accumulatedText.trim()) {
      await db.collection<IMessage>('messages').insertOne({
        chatId: chatObjectId,
        role: 'model',
        text: accumulatedText.trim(),
        createdAt: new Date(),
      });
    }

    // Stream finished successfully
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('Error in handleChatStream:', error);
    const err = error as Error;

    // Parse the error on the backend to provide clean, structured data
    let parsedError: any = err.message || 'Failed to initialize streaming response.';
    try {
      if (typeof parsedError === 'string' && (parsedError.startsWith('{') || parsedError.startsWith('['))) {
        const parsed = JSON.parse(parsedError);
        if (parsed && parsed.error && typeof parsed.error.message === 'string') {
          try {
            parsed.error.message = JSON.parse(parsed.error.message);
          } catch {
            // ignore
          }
        }
        parsedError = parsed;
      }
    } catch {
      // ignore
    }

    if (!res.headersSent) {
      res.status(500).json({
        type: 'error',
        message: 'An Error occurred',
        error: parsedError,
      });
    } else {
      res.write(
        `data: ${JSON.stringify({ type: 'error', message: 'An Error occurred', error: parsedError })}\n\n`,
      );
      res.end();
    }
  }
}

/**
 * Handle GET /api/chat/chats
 * Fetches all historical chat titles for the authenticated user, sorted by newest first
 */
export async function handleListChats(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be authenticated.',
      });
      return;
    }

    const db = await connectToDatabase();
    const chats = await db
      .collection<IChat>('chats')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedChats = chats.map((c) => ({
      id: c._id ? c._id.toString() : '',
      title: c.title,
      createdAt: new Date(c.createdAt).toISOString(),
    }));

    res.status(200).json(formattedChats);
  } catch (error: unknown) {
    console.error('Error in handleListChats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve chat history.',
    });
  }
}

/**
 * Handle GET /api/chat/chats/:chatId/messages
 * Retrieves all historical messages for the specified chat
 */
export async function handleGetChatMessages(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req;
    const { chatId } = req.params;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User must be authenticated.',
      });
      return;
    }

    if (!chatId || typeof chatId !== 'string') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'chatId parameter must be a string.',
      });
      return;
    }

    let chatObjectId: ObjectId;
    try {
      chatObjectId = new ObjectId(chatId);
    } catch (err) {
      res
        .status(400)
        .json({ error: 'Bad Request', message: 'Invalid chatId format.' });
      return;
    }

    const db = await connectToDatabase();

    // Verify ownership
    const chat = await db.collection<IChat>('chats').findOne({
      _id: chatObjectId,
      userId: new ObjectId(userId),
    });

    if (!chat) {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested chat was not found or access is denied.',
      });
      return;
    }

    const messages = await db
      .collection<IMessage>('messages')
      .find({ chatId: chatObjectId })
      .sort({ createdAt: 1 })
      .toArray();

    const formattedMessages = messages.map((m) => ({
      id: m._id ? m._id.toString() : '',
      chatId: m.chatId.toString(),
      role: m.role === 'model' ? 'assistant' : 'user',
      text: m.text,
      createdAt: new Date(m.createdAt).toISOString(),
    }));

    res.status(200).json(formattedMessages);
  } catch (error: unknown) {
    console.error('Error in handleGetChatMessages:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve messages.',
    });
  }
}
