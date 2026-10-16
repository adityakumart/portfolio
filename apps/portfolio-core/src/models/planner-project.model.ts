import { Schema, Document, Model, Types } from 'mongoose';
import {
  FixedProjectRole,
  MemberStatus,
  IProjectPermissions,
} from '@portfolio/shared-types';
import { getPortfolioConnection } from '../config/mongoose';

export interface IProjectMemberDoc {
  userId: Types.ObjectId;
  email: string;
  name?: string;
  role: FixedProjectRole | string;
  status: MemberStatus;
  invitedBy: Types.ObjectId;
  joinedAt?: Date;
  createdAt: Date;
}

export interface IProjectStageDoc {
  id: string;
  name: string;
  color?: string;
  order: number;
  isDefault?: boolean;
}

export interface IProjectCustomRoleDoc {
  id: string;
  name: string;
  description?: string;
  isCustom: true;
  permissions: IProjectPermissions;
}

export interface IPlannerProjectDocument extends Document {
  title: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: IProjectMemberDoc[];
  customRoles: IProjectCustomRoleDoc[];
  stages: IProjectStageDoc[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    role: { type: String, required: true, default: 'member' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    invitedBy: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    joinedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ProjectStageSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectCustomRoleSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isCustom: { type: Boolean, default: true },
    permissions: {
      canManageProject: { type: Boolean, default: false },
      canManageStages: { type: Boolean, default: false },
      canManageRoles: { type: Boolean, default: false },
      canInviteMembers: { type: Boolean, default: false },
      canCreateCards: { type: Boolean, default: false },
      canEditCards: { type: Boolean, default: false },
      canDeleteCards: { type: Boolean, default: false },
      canMoveCards: { type: Boolean, default: false },
      canComment: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

export const PlannerProjectSchema = new Schema<IPlannerProjectDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'user',
    },
    members: { type: [ProjectMemberSchema], default: [] },
    customRoles: { type: [ProjectCustomRoleSchema], default: [] },
    stages: { type: [ProjectStageSchema], default: [] },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Indexes
PlannerProjectSchema.index({ ownerId: 1, archived: 1 });
PlannerProjectSchema.index({ 'members.userId': 1, 'members.status': 1 });
PlannerProjectSchema.index({ 'members.email': 1, 'members.status': 1 });

export async function getPlannerProjectModel(): Promise<
  Model<IPlannerProjectDocument>
> {
  const conn = await getPortfolioConnection();
  return (
    (conn.models['PlannerProject'] as Model<IPlannerProjectDocument>) ||
    conn.model<IPlannerProjectDocument>(
      'PlannerProject',
      PlannerProjectSchema,
      'planner_projects'
    )
  );
}
