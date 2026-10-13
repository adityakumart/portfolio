import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types/express';
import { getPlannerProjectModel } from '../models/planner-project.model';
import { getTodoModel } from '../models/todo.model';
import { getPlannerNotificationModel } from '../models/planner-notification.model';
import {
  FIXED_ROLE_PERMISSIONS,
  getDefaultStages,
  mapProjectDoc,
  resolveProjectPermissions,
  findUserByEmail,
  findUserById,
} from '../services/planner-project.service';
import { plannerSse } from '../services/planner-sse.service';
import {
  ICreateProjectDto,
  IUpdateProjectDto,
  IInviteMemberDto,
  IUpdateMemberRoleDto,
  ICreateCustomRoleDto,
  IUpdateCustomRoleDto,
  ICreateStageDto,
  IUpdateStageDto,
  IReorderStagesDto,
  IProjectsListResponse,
  ITodoItem,
} from '@portfolio/shared-types';

function getParamId(req: AuthenticatedRequest, key = 'id'): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || '';
}

function mapNotification(doc: any) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    projectId: doc.projectId?.toString(),
    projectTitle: doc.projectTitle,
    actorId: doc.actorId?.toString() || '',
    actorName: doc.actorName,
    actorEmail: doc.actorEmail,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    data: doc.data || {},
    isRead: Boolean(doc.isRead),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
  };
}

function mapTodoDoc(doc: any): ITodoItem {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    projectId: doc.projectId?.toString(),
    stageId: doc.stageId,
    assigneeIds: (doc.assigneeIds || []).map((id: any) => id.toString()),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    priority: doc.priority,
    dueDate: doc.dueDate,
    dueTime: doc.dueTime,
    tags: doc.tags || [],
    subtasks: doc.subtasks || [],
    reminder: doc.reminder
      ? {
          reminderTime: doc.reminder.reminderTime,
          repeat: doc.reminder.repeat,
          isTriggered: doc.reminder.isTriggered,
          snoozedUntil: doc.reminder.snoozedUntil,
        }
      : undefined,
    completedAt: doc.completedAt?.toISOString(),
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// 1. PROJECTS LIST & CRUD
// ---------------------------------------------------------------------------
export async function handleGetProjects(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User ID missing' });
      return;
    }

    const projectModel = await getPlannerProjectModel();
    const userObjectId = new Types.ObjectId(userId);

    const [ownedDocs, memberDocs] = await Promise.all([
      projectModel.find({ ownerId: userObjectId, archived: false }).sort({ updatedAt: -1 }),
      projectModel
        .find({
          'members.userId': userObjectId,
          ownerId: { $ne: userObjectId },
          archived: false,
        })
        .sort({ updatedAt: -1 }),
    ]);

    const myProjects = ownedDocs.map(mapProjectDoc);
    const collaborativeProjects: any[] = [];
    const pendingInvitations: any[] = [];

    for (const doc of memberDocs) {
      const member = doc.members.find((m) => m.userId.toString() === userId);
      if (member?.status === 'accepted') {
        collaborativeProjects.push(mapProjectDoc(doc));
      } else if (member?.status === 'pending') {
        pendingInvitations.push(mapProjectDoc(doc));
      }
    }

    const response: IProjectsListResponse = {
      myProjects,
      collaborativeProjects,
      pendingInvitations,
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleCreateProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User ID missing' });
      return;
    }

    const body: ICreateProjectDto = req.body;
    if (!body || !body.title || !body.title.trim()) {
      res.status(400).json({ error: 'Bad Request', message: 'Project title is required.' });
      return;
    }

    const stages =
      body.stages && body.stages.length > 0
        ? body.stages.map((s, idx) => ({
            id: `stage_${Date.now()}_${idx}`,
            name: s.name.trim(),
            color: s.color || '#64748b',
            order: idx,
            isDefault: false,
            allowedTransitions: Array.isArray(s.allowedTransitions) ? s.allowedTransitions : [],
          }))
        : getDefaultStages();

    const projectModel = await getPlannerProjectModel();
    const newProject = await projectModel.create({
      title: body.title.trim(),
      description: body.description?.trim() || '',
      ownerId: new Types.ObjectId(userId),
      members: [],
      customRoles: [],
      stages,
      archived: false,
    });

    res.status(201).json(mapProjectDoc(newProject));
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleGetProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);

    if (!Types.ObjectId.isValid(projectId)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid project ID' });
      return;
    }

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth) {
      res.status(403).json({ error: 'Forbidden', message: 'You are not a member of this project.' });
      return;
    }

    if (auth.status === 'pending') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Project access requires an accepted invitation.',
        invitation: {
          role: auth.role,
          title: project.title,
          status: 'pending',
        },
      });
      return;
    }

    res.json({
      project: mapProjectDoc(project),
      permissions: auth.permissions,
      role: auth.role,
      isOwner: auth.isOwner,
    });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const body: IUpdateProjectDto = req.body;

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageProject) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to update project.' });
      return;
    }

    if (body.title && body.title.trim()) {
      project.title = body.title.trim();
    }
    if (typeof body.description === 'string') {
      project.description = body.description.trim();
    }

    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'project_updated', mapped);

    res.json(mapped);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeleteProject(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    if (project.ownerId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Only project owners can delete a project.' });
      return;
    }

    project.archived = true;
    await project.save();

    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'project_deleted', { projectId });

    res.json({ success: true, message: 'Project archived successfully.' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ---------------------------------------------------------------------------
// 2. COLLABORATORS & INVITATION ACCESS GATING
// ---------------------------------------------------------------------------
export async function handleInviteMember(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const body: IInviteMemberDto = req.body;

    if (!body || !body.email || !body.email.trim()) {
      res.status(400).json({ error: 'Bad Request', message: 'Recipient email is required.' });
      return;
    }

    const email = body.email.trim().toLowerCase();
    const role = body.role || 'member';

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canInviteMembers) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to invite members.' });
      return;
    }

    // Role check: must be either fixed or defined in customRoles
    const isValidRole =
      role in FIXED_ROLE_PERMISSIONS ||
      project.customRoles.some((r) => r.id === role);
    if (!isValidRole) {
      res.status(400).json({ error: 'Bad Request', message: `Invalid role "${role}".` });
      return;
    }

    // Strictly lookup target user in DB
    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
      res.status(404).json({
        error: 'Not Found',
        message: 'No registered user found with that exact email address.',
      });
      return;
    }

    const targetUserIdStr = targetUser._id.toString();
    if (project.ownerId.toString() === targetUserIdStr) {
      res.status(400).json({ error: 'Bad Request', message: 'Owner is already a member of this project.' });
      return;
    }

    const existingMember = project.members.find(
      (m) => m.userId.toString() === targetUserIdStr
    );

    if (existingMember) {
      if (existingMember.status === 'accepted') {
        res.status(409).json({ error: 'Conflict', message: 'User is already an active member of this project.' });
        return;
      }
      if (existingMember.status === 'pending') {
        res.status(409).json({ error: 'Conflict', message: 'An invitation is already pending for this user.' });
        return;
      }
      // Declined member being reinvited
      existingMember.status = 'pending';
      existingMember.role = role;
      existingMember.invitedBy = new Types.ObjectId(userId);
    } else {
      project.members.push({
        userId: targetUser._id,
        email: targetUser['email'],
        name:
          `${targetUser['first_name'] || ''} ${targetUser['last_name'] || ''}`.trim() ||
          targetUser['email'],
        role,
        status: 'pending',
        invitedBy: new Types.ObjectId(userId),
        createdAt: new Date(),
      } as any);
    }

    await project.save();

    // Create persistent Notification
    const inviterUser = await findUserById(userId);
    const inviterName = inviterUser
      ? `${inviterUser['first_name'] || ''} ${inviterUser['last_name'] || ''}`.trim() ||
        inviterUser['email']
      : 'A team member';

    const notifModel = await getPlannerNotificationModel();
    const notif = await notifModel.create({
      userId: targetUser._id,
      projectId: project._id,
      projectTitle: project.title,
      actorId: new Types.ObjectId(userId),
      actorName: inviterName,
      actorEmail: inviterUser ? inviterUser['email'] : undefined,
      type: 'project_invite',
      title: 'Project Invitation',
      message: `${inviterName} invited you to join "${project.title}" as ${role}.`,
      data: {
        projectId: project._id.toString(),
        projectTitle: project.title,
        role,
      },
      isRead: false,
    });

    // Real-time dispatch via SSE
    const mappedNotif = mapNotification(notif);
    plannerSse.sendNotification(targetUserIdStr, mappedNotif);

    res.status(201).json({
      success: true,
      message: `Invitation sent to ${email}`,
      project: mapProjectDoc(project),
    });
  } catch (error: any) {
    console.error('Error inviting member:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleAcceptInvitation(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const member = project.members.find(
      (m) => m.userId.toString() === userId
    );

    if (!member || member.status !== 'pending') {
      res.status(400).json({ error: 'Bad Request', message: 'No pending invitation found for this user.' });
      return;
    }

    member.status = 'accepted';
    member.joinedAt = new Date();
    await project.save();

    // Mark notifications read
    const notifModel = await getPlannerNotificationModel();
    await notifModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        projectId: project._id,
        type: 'project_invite',
      },
      { $set: { isRead: true } }
    );

    // Notify project owner/members
    const user = await findUserById(userId);
    const userName = user
      ? `${user['first_name'] || ''} ${user['last_name'] || ''}`.trim() || user['email']
      : 'Collaborator';

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'member_accepted', {
      projectId: project._id.toString(),
      userId,
      name: userName,
      project: mapped,
    });

    res.json({
      success: true,
      message: 'Invitation accepted successfully.',
      project: mapped,
    });
  } catch (error: any) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeclineInvitation(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    project.members = project.members.filter(
      (m) => m.userId.toString() !== userId
    );
    await project.save();

    // Mark notification read
    const notifModel = await getPlannerNotificationModel();
    await notifModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        projectId: project._id,
        type: 'project_invite',
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'Invitation declined.' });
  } catch (error: any) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateMemberRole(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const targetUserId = req.params['userId'];
    const body: IUpdateMemberRoleDto = req.body;

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canInviteMembers) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to modify member roles.' });
      return;
    }

    const member = project.members.find(
      (m) => m.userId.toString() === targetUserId
    );
    if (!member) {
      res.status(404).json({ error: 'Not Found', message: 'Member not found' });
      return;
    }

    const isValidRole =
      body.role in FIXED_ROLE_PERMISSIONS ||
      project.customRoles.some((r) => r.id === body.role);
    if (!isValidRole) {
      res.status(400).json({ error: 'Bad Request', message: `Invalid role "${body.role}".` });
      return;
    }

    member.role = body.role;
    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'project_updated', mapped);

    res.json(mapped);
  } catch (error: any) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleRemoveMember(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const targetUserId = req.params['userId'];

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const isSelfLeaving = userId === targetUserId;
    const auth = resolveProjectPermissions(project, userId);

    if (!isSelfLeaving && (!auth || auth.status !== 'accepted' || !auth.permissions.canInviteMembers)) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to remove members.' });
      return;
    }

    if (project.ownerId.toString() === targetUserId) {
      res.status(400).json({ error: 'Bad Request', message: 'Cannot remove the project owner.' });
      return;
    }

    project.members = project.members.filter(
      (m) => m.userId.toString() !== targetUserId
    );
    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'project_updated', mapped);

    res.json({ success: true, message: 'Member removed successfully.', project: mapped });
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ---------------------------------------------------------------------------
// 3. DYNAMIC STAGES (KANBAN COLUMNS)
// ---------------------------------------------------------------------------
export async function handleAddStage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const body: ICreateStageDto = req.body;

    if (!body || !body.name || !body.name.trim()) {
      res.status(400).json({ error: 'Bad Request', message: 'Stage name is required.' });
      return;
    }

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageStages) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to manage stages.' });
      return;
    }

    const newStage = {
      id: `stage_${Date.now()}`,
      name: body.name.trim(),
      color: body.color || '#64748b',
      order: project.stages.length,
      isDefault: false,
      allowedTransitions: Array.isArray(body.allowedTransitions) ? body.allowedTransitions : [],
    };

    project.stages.push(newStage);
    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'stage_changed', { projectId, stages: mapped.stages });

    res.status(201).json(mapped);
  } catch (error: any) {
    console.error('Error adding stage:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateStage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const stageId = req.params['stageId'];
    const body: IUpdateStageDto = req.body;

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageStages) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to manage stages.' });
      return;
    }

    const stage = project.stages.find((s) => s.id === stageId);
    if (!stage) {
      res.status(404).json({ error: 'Not Found', message: 'Stage not found' });
      return;
    }

    if (body.name && body.name.trim()) {
      stage.name = body.name.trim();
    }
    if (body.color) {
      stage.color = body.color;
    }
    if (Array.isArray(body.allowedTransitions)) {
      stage.allowedTransitions = body.allowedTransitions;
    }

    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'stage_changed', { projectId, stages: mapped.stages });

    res.json(mapped);
  } catch (error: any) {
    console.error('Error updating stage:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleReorderStages(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const body: IReorderStagesDto = req.body;

    if (!body || !Array.isArray(body.stageIds)) {
      res.status(400).json({ error: 'Bad Request', message: 'stageIds array is required.' });
      return;
    }

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageStages) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to manage stages.' });
      return;
    }

    // Reorder stages array according to stageIds
    const stageMap = new Map(project.stages.map((s) => [s.id, s]));
    const newStages: any[] = [];
    body.stageIds.forEach((id, index) => {
      const stage = stageMap.get(id);
      if (stage) {
        stage.order = index;
        newStages.push(stage);
        stageMap.delete(id);
      }
    });

    // Append any unreferenced stages
    for (const remaining of stageMap.values()) {
      remaining.order = newStages.length;
      newStages.push(remaining);
    }

    project.stages = newStages;
    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'stage_changed', { projectId, stages: mapped.stages });

    res.json(mapped);
  } catch (error: any) {
    console.error('Error reordering stages:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeleteStage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const stageId = req.params['stageId'];
    const fallbackStageId = (req.query['fallbackStageId'] || req.body?.fallbackStageId) as string;

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageStages) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to manage stages.' });
      return;
    }

    if (project.stages.length <= 1) {
      res.status(400).json({ error: 'Bad Request', message: 'A project must have at least one stage.' });
      return;
    }

    // Migrate cards to fallback stage if provided
    const todoModel = await getTodoModel();
    if (fallbackStageId) {
      await todoModel.updateMany(
        { projectId: project._id, stageId },
        { $set: { stageId: fallbackStageId } }
      );
    }

    project.stages = project.stages.filter((s) => s.id !== stageId);
    // Re-index orders and prune deleted stageId from allowedTransitions
    project.stages.forEach((s, idx) => {
      s.order = idx;
      if (Array.isArray(s.allowedTransitions)) {
        s.allowedTransitions = s.allowedTransitions.filter((id) => id !== stageId);
      }
    });

    await project.save();

    const mapped = mapProjectDoc(project);
    const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
    plannerSse.sendToUsers(memberIds, 'stage_changed', { projectId, stages: mapped.stages });

    res.json(mapped);
  } catch (error: any) {
    console.error('Error deleting stage:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ---------------------------------------------------------------------------
// 4. CUSTOM ROLES (PROJECT RBAC)
// ---------------------------------------------------------------------------
export async function handleCreateCustomRole(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const body: ICreateCustomRoleDto = req.body;

    if (!body || !body.name || !body.name.trim()) {
      res.status(400).json({ error: 'Bad Request', message: 'Role name is required.' });
      return;
    }

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageRoles) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to create custom roles.' });
      return;
    }

    const newRole = {
      id: `role_${Date.now()}`,
      name: body.name.trim(),
      description: body.description?.trim(),
      isCustom: true as const,
      permissions: {
        canManageProject: Boolean(body.permissions?.canManageProject),
        canManageStages: Boolean(body.permissions?.canManageStages),
        canManageRoles: Boolean(body.permissions?.canManageRoles),
        canInviteMembers: Boolean(body.permissions?.canInviteMembers),
        canCreateCards: Boolean(body.permissions?.canCreateCards),
        canEditCards: Boolean(body.permissions?.canEditCards),
        canDeleteCards: Boolean(body.permissions?.canDeleteCards),
        canMoveCards: Boolean(body.permissions?.canMoveCards),
        canComment: Boolean(body.permissions?.canComment),
      },
    };

    project.customRoles.push(newRole);
    await project.save();

    const mapped = mapProjectDoc(project);
    res.status(201).json(mapped);
  } catch (error: any) {
    console.error('Error creating custom role:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateCustomRole(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const roleId = req.params['roleId'];
    const body: IUpdateCustomRoleDto = req.body;

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageRoles) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to modify custom roles.' });
      return;
    }

    const role = project.customRoles.find((r) => r.id === roleId);
    if (!role) {
      res.status(404).json({ error: 'Not Found', message: 'Custom role not found' });
      return;
    }

    if (body.name && body.name.trim()) {
      role.name = body.name.trim();
    }
    if (typeof body.description === 'string') {
      role.description = body.description.trim();
    }
    if (body.permissions) {
      role.permissions = {
        ...role.permissions,
        ...body.permissions,
      };
    }

    await project.save();
    res.json(mapProjectDoc(project));
  } catch (error: any) {
    console.error('Error updating custom role:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeleteCustomRole(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);
    const roleId = req.params['roleId'];

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted' || !auth.permissions.canManageRoles) {
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to delete custom roles.' });
      return;
    }

    // Guard: check if any member uses this role
    const inUse = project.members.some((m) => m.role === roleId);
    if (inUse) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot delete custom role because members are currently assigned to it.',
      });
      return;
    }

    project.customRoles = project.customRoles.filter((r) => r.id !== roleId);
    await project.save();

    res.json(mapProjectDoc(project));
  } catch (error: any) {
    console.error('Error deleting custom role:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ---------------------------------------------------------------------------
// 5. PROJECT TODOS & CARD TRANSITIONS
// ---------------------------------------------------------------------------
export async function handleGetProjectTodos(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const projectId = getParamId(req);

    const projectModel = await getPlannerProjectModel();
    const project = await projectModel.findById(projectId);
    if (!project || project.archived) {
      res.status(404).json({ error: 'Not Found', message: 'Project not found' });
      return;
    }

    const auth = resolveProjectPermissions(project, userId);
    if (!auth || auth.status !== 'accepted') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Project access requires an accepted invitation.',
      });
      return;
    }

    const todoModel = await getTodoModel();
    const docs = await todoModel
      .find({ projectId: project._id, status: { $ne: 'archived' } })
      .sort({ updatedAt: -1 });

    res.json(docs.map(mapTodoDoc));
  } catch (error: any) {
    console.error('Error fetching project todos:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleTransitionTodoStage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const todoId = getParamId(req);
    const { stageId } = req.body;

    if (!stageId) {
      res.status(400).json({ error: 'Bad Request', message: 'Target stageId is required.' });
      return;
    }

    const todoModel = await getTodoModel();
    const todo = await todoModel.findById(todoId);
    if (!todo) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }

    if (todo.projectId) {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(todo.projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }

      const auth = resolveProjectPermissions(project, userId);
      if (!auth || auth.status !== 'accepted' || !auth.permissions.canMoveCards) {
        res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to move cards.' });
        return;
      }

      const targetStage = project.stages.find((s) => s.id === stageId);
      if (!targetStage) {
        res.status(400).json({ error: 'Bad Request', message: 'Target stage does not exist in project.' });
        return;
      }

      // Validate workflow transition rules:
      // Backward movement (targetStage.order < currentStage.order) is always allowed.
      // Forward movement (targetStage.order > currentStage.order) must satisfy allowedTransitions.
      const currentStage = project.stages.find((s) => s.id === todo.stageId);
      if (currentStage && targetStage.id !== currentStage.id) {
        const isMovingForward = targetStage.order > currentStage.order;
        if (isMovingForward) {
          const allowedForward = Array.isArray(currentStage.allowedTransitions)
            ? currentStage.allowedTransitions
            : project.stages.filter((s) => s.order === currentStage.order + 1).map((s) => s.id);

          if (!allowedForward.includes(stageId)) {
            res.status(400).json({
              error: 'Bad Request',
              message: `Invalid forward stage transition. Tasks in "${currentStage.name}" cannot be moved forward to "${targetStage.name}".`,
            });
            return;
          }
        }
      }

      const previousStageId = todo.stageId;
      todo.stageId = stageId;

      // Sync status if matching standard stages
      const lowerStage = targetStage.name.toLowerCase();
      if (lowerStage.includes('done') || lowerStage.includes('completed')) {
        todo.status = 'completed';
        todo.completedAt = new Date();
      } else if (lowerStage.includes('progress')) {
        todo.status = 'in_progress';
        todo.completedAt = undefined;
      } else {
        todo.status = 'pending';
        todo.completedAt = undefined;
      }

      await todo.save();

      const mappedTodo = mapTodoDoc(todo);
      const memberIds = [project.ownerId.toString(), ...project.members.map((m) => m.userId.toString())];
      plannerSse.sendToUsers(memberIds, 'card_moved', {
        projectId: project._id.toString(),
        todo: mappedTodo,
        previousStageId,
        newStageId: stageId,
      });

      res.json(mappedTodo);
    } else {
      // Personal todo fallback
      if (todo.userId.toString() !== userId) {
        res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
        return;
      }
      todo.stageId = stageId;
      await todo.save();
      res.json(mapTodoDoc(todo));
    }
  } catch (error: any) {
    console.error('Error transitioning card stage:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ---------------------------------------------------------------------------
// 6. NOTIFICATIONS & SSE STREAM
// ---------------------------------------------------------------------------
export async function handleGetNotifications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const notifModel = await getPlannerNotificationModel();
    const docs = await notifModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(docs.map(mapNotification));
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleMarkNotificationRead(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);

    const notifModel = await getPlannerNotificationModel();
    await notifModel.updateOne(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleMarkAllNotificationsRead(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const notifModel = await getPlannerNotificationModel();
    await notifModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleNotificationStream(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.userId;
  if (!userId) {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  plannerSse.addClient(userId, res);

  req.on('close', () => {
    plannerSse.removeClient(userId, res);
  });
}
