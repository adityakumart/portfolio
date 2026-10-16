import { Schema, Document, Model, Types } from 'mongoose';
import { PlannerNotificationType } from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface IPlannerNotificationDocument extends Document {
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  projectTitle?: string;
  actorId?: Types.ObjectId;
  actorName?: string;
  actorEmail?: string;
  type: PlannerNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const PlannerNotificationSchema = new Schema<IPlannerNotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'user',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      index: true,
      ref: 'PlannerProject',
    },
    projectTitle: { type: String, trim: true },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    actorName: { type: String, trim: true },
    actorEmail: { type: String, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'project_invite',
        'card_moved',
        'card_assigned',
        'stage_changed',
        'mention',
      ],
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PlannerNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export async function getPlannerNotificationModel(): Promise<
  Model<IPlannerNotificationDocument>
> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['PlannerNotification'] as Model<IPlannerNotificationDocument>) ||
    conn.model<IPlannerNotificationDocument>(
      'PlannerNotification',
      PlannerNotificationSchema,
      'planner_notifications'
    )
  );
}
