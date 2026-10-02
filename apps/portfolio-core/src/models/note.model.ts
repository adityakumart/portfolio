import { Schema, Document, Model, Types } from 'mongoose';
import { getPortfolioConnection } from '../config/mongoose';

export interface INoteDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color?: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const NoteSchema = new Schema<INoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'user',
    },
    title: {
      type: String,
      trim: true,
      default: '',
      maxlength: 250,
    },
    content: {
      type: String,
      required: true,
      default: '',
      maxlength: 100000,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    color: {
      type: String,
      default: undefined,
    },
    sourceUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for fast queries: user's pinned notes first, ordered by recent update
NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

// Text index on title and content for search
NoteSchema.index({ title: 'text', content: 'text' });

export async function getNoteModel(): Promise<Model<INoteDocument>> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['Note'] as Model<INoteDocument>) ||
    conn.model<INoteDocument>('Note', NoteSchema, 'user_notes')
  );
}
