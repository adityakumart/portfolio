import { ObjectId } from 'mongodb';

export interface IChatHistoryDocument {
  _id?: ObjectId;
  userId: ObjectId;
  userPrompt: string;
  aiResponse: string;
  modelUsed?: string;
  createdAt: Date;
}
