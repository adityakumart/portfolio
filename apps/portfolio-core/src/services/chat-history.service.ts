import { connectToDatabase } from '../utils/DB/mongodb';
import { ObjectId, Collection } from 'mongodb';
import { IChatHistoryDocument } from '../models/chat-history.model';
import { SaveChatHistoryDto } from '@portfolio/shared-types';

export class ChatHistoryService {
  private static async getCollection(): Promise<Collection<IChatHistoryDocument>> {
    const db = await connectToDatabase();
    return db.collection<IChatHistoryDocument>('chat_history');
  }

  /**
   * Saves a chat interaction to the MongoDB database
   */
  static async saveChat(
    userIdStr: string,
    dto: SaveChatHistoryDto
  ): Promise<IChatHistoryDocument> {
    try {
      const collection = await this.getCollection();

      let userId: ObjectId;
      try {
        userId = new ObjectId(userIdStr);
      } catch (err) {
        throw new Error('Invalid user ID format');
      }

      const document: IChatHistoryDocument = {
        userId,
        userPrompt: dto.userPrompt.trim(),
        aiResponse: dto.aiResponse.trim(),
        modelUsed: dto.modelUsed || 'gemini-flash-latest',
        createdAt: new Date(),
      };

      const result = await collection.insertOne(document);
      
      return {
        ...document,
        _id: result.insertedId,
      };
    } catch (err: unknown) {
      console.error('Error in ChatHistoryService.saveChat:', err);
      throw err;
    }
  }
}
