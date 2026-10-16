import { Types } from 'mongoose';
import {
  FixedProjectRole,
  IPlannerProject,
  IProjectCustomRole,
  IProjectMember,
  IProjectPermissions,
  IProjectStage,
  MemberStatus,
} from '@portfolio/shared-types';
import {
  IPlannerProjectDocument,
  IProjectStageDoc,
  getPlannerProjectModel,
} from '../models/planner-project.model';
import { connectToDatabase } from '../utils/DB/mongodb';

export const FIXED_ROLE_PERMISSIONS: Record<FixedProjectRole, IProjectPermissions> = {
  admin: {
    canManageProject: true,
    canManageStages: true,
    canManageRoles: true,
    canInviteMembers: true,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: true,
    canMoveCards: true,
    canComment: true,
  },
  member: {
    canManageProject: false,
    canManageStages: false,
    canManageRoles: false,
    canInviteMembers: false,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: true,
    canMoveCards: true,
    canComment: true,
  },
  reviewer: {
    canManageProject: false,
    canManageStages: false,
    canManageRoles: false,
    canInviteMembers: false,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canMoveCards: true,
    canComment: true,
  },
  triage: {
    canManageProject: false,
    canManageStages: false,
    canManageRoles: false,
    canInviteMembers: false,
    canCreateCards: true,
    canEditCards: true,
    canDeleteCards: false,
    canMoveCards: true,
    canComment: true,
  },
  viewer: {
    canManageProject: false,
    canManageStages: false,
    canManageRoles: false,
    canInviteMembers: false,
    canCreateCards: false,
    canEditCards: false,
    canDeleteCards: false,
    canMoveCards: false,
    canComment: false,
  },
};

export function getDefaultStages(): IProjectStageDoc[] {
  return [
    {
      id: 'backlog',
      name: 'Backlog',
      color: '#64748b',
      order: 0,
      isDefault: true,
    },
    {
      id: 'in_progress',
      name: 'In Progress',
      color: '#3b82f6',
      order: 1,
      isDefault: true,
    },
    {
      id: 'in_review',
      name: 'In Review',
      color: '#f59e0b',
      order: 2,
      isDefault: true,
    },
    {
      id: 'done',
      name: 'Done',
      color: '#10b981',
      order: 3,
      isDefault: true,
    },
  ];
}

export interface IResolvedProjectContext {
  permissions: IProjectPermissions;
  role: string;
  isOwner: boolean;
  status: MemberStatus;
  memberRecord?: IProjectMember;
}

export function resolveProjectPermissions(
  project: IPlannerProjectDocument,
  userId?: string
): IResolvedProjectContext | null {
  if (!userId) {
    return null;
  }
  const isOwner = project.ownerId.toString() === userId;
  if (isOwner) {
    return {
      permissions: { ...FIXED_ROLE_PERMISSIONS.admin },
      role: 'admin',
      isOwner: true,
      status: 'accepted',
    };
  }

  const member = project.members.find(
    (m) => m.userId.toString() === userId
  );

  if (!member) {
    return null;
  }

  const memberRole = member.role as string;
  let permissions: IProjectPermissions = { ...FIXED_ROLE_PERMISSIONS.viewer };

  if (member.status === 'accepted') {
    if (memberRole in FIXED_ROLE_PERMISSIONS) {
      permissions = {
        ...FIXED_ROLE_PERMISSIONS[memberRole as FixedProjectRole],
      };
    } else {
      const customRole = project.customRoles.find((r) => r.id === memberRole);
      if (customRole) {
        permissions = { ...customRole.permissions };
      }
    }
  }

  return {
    permissions,
    role: memberRole,
    isOwner: false,
    status: member.status,
    memberRecord: {
      userId: member.userId.toString(),
      email: member.email,
      name: member.name,
      role: member.role,
      status: member.status,
      invitedBy: member.invitedBy.toString(),
      joinedAt: member.joinedAt?.toISOString(),
      createdAt: member.createdAt?.toISOString() || new Date().toISOString(),
    },
  };
}

export function mapProjectDoc(doc: IPlannerProjectDocument): IPlannerProject {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || '',
    ownerId: doc.ownerId.toString(),
    members: (doc.members || []).map((m) => ({
      userId: m.userId.toString(),
      email: m.email,
      name: m.name,
      role: m.role,
      status: m.status,
      invitedBy: m.invitedBy.toString(),
      joinedAt: m.joinedAt?.toISOString(),
      createdAt: m.createdAt?.toISOString() || new Date().toISOString(),
    })),
    customRoles: (doc.customRoles || []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isCustom: true,
      permissions: { ...r.permissions },
    })),
    stages: (doc.stages || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        order: s.order,
        isDefault: Boolean(s.isDefault),
      })),
    archived: Boolean(doc.archived),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function findUserByEmail(email: string) {
  const db = await connectToDatabase();
  const escaped = email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return db
    .collection('user')
    .findOne({ email: new RegExp(`^${escaped}$`, 'i'), is_deleted: { $ne: true } });
}

export async function findUserById(userId?: string) {
  if (!userId) return null;
  const db = await connectToDatabase();
  return db
    .collection('user')
    .findOne({ _id: new Types.ObjectId(userId) });
}
