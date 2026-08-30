import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../utils/DB/mongodb';

export interface IFileDocument {
  _id?: ObjectId;
  name: string;
  path: string; // Full storage key (e.g. root/users/1-John Doe/report.pdf)
  relativePath: string; // Relative to user scope
  size: number;
  mimeType: string;
  ownerId: ObjectId | string;
  ownerName: string;
  ownerRole: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export class FileModel {
  private static async getCollection() {
    const db = await connectToDatabase();
    return db.collection<IFileDocument>('files');
  }

  static async recordFile(data: Omit<IFileDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<IFileDocument> {
    const col = await this.getCollection();
    const now = new Date();
    
    // Check if a record already exists with the same path
    const existing = await col.findOne({ path: data.path });
    if (existing) {
      await col.updateOne(
        { _id: existing._id },
        {
          $set: {
            size: data.size,
            mimeType: data.mimeType,
            relativePath: data.relativePath,
            ownerName: data.ownerName,
            ownerRole: data.ownerRole,
            updatedAt: now,
          },
        }
      );
      return { ...existing, ...data, updatedAt: now };
    }

    const doc: IFileDocument = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc as any);
    return { ...doc, _id: result.insertedId };
  }

  static async findByPath(storagePath: string): Promise<IFileDocument | null> {
    const col = await this.getCollection();
    return col.findOne({ path: storagePath });
  }

  static async findByOwner(ownerId: string | ObjectId): Promise<IFileDocument[]> {
    const col = await this.getCollection();
    return col.find({ ownerId }).toArray();
  }

  static async deleteByPath(storagePath: string): Promise<boolean> {
    const col = await this.getCollection();
    const res = await col.deleteOne({ path: storagePath });
    return (res.deletedCount || 0) > 0;
  }
}
