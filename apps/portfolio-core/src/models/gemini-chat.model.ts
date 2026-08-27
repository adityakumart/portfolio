import { ObjectId } from 'mongodb';

export interface IChat {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  createdAt: Date;
}

export interface IMessage {
  _id?: ObjectId;
  chatId: ObjectId;
  role: 'user' | 'model';
  text: string;
  createdAt: Date;
}
