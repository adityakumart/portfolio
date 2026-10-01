import { Schema, Document, Model, Types } from 'mongoose';
import { TodoPriority, TodoStatus, ReminderRepeat } from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface ISubtaskDoc {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITodoReminderDoc {
  reminderTime: string;
  repeat: ReminderRepeat;
  isTriggered: boolean;
  snoozedUntil?: string;
}

export interface ITodoDocument extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string;
  dueTime?: string;
  tags: string[];
  subtasks: ISubtaskDoc[];
  reminder?: ITodoReminderDoc;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const ReminderSchema = new Schema(
  {
    reminderTime: { type: String, required: true },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    isTriggered: { type: Boolean, default: false },
    snoozedUntil: { type: String, default: undefined },
  },
  { _id: false },
);

export const TodoSchema = new Schema<ITodoDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'user',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'archived'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: String,
      index: true,
      default: undefined,
    },
    dueTime: {
      type: String,
      default: undefined,
    },
    tags: {
      type: [String],
      default: [],
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    reminder: {
      type: ReminderSchema,
      default: undefined,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Compound queries for listing: user's tasks by status and due date
TodoSchema.index({ userId: 1, status: 1, dueDate: 1, priority: 1 });
TodoSchema.index({ userId: 1, 'reminder.reminderTime': 1, 'reminder.isTriggered': 1 });

export async function getTodoModel(): Promise<Model<ITodoDocument>> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['Todo'] as Model<ITodoDocument>) ||
    conn.model<ITodoDocument>('Todo', TodoSchema, 'user_todos')
  );
}
