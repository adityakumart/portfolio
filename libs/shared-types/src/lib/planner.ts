export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export type FixedProjectRole = 'admin' | 'member' | 'reviewer' | 'triage' | 'viewer';
export type MemberStatus = 'pending' | 'accepted' | 'declined';

export interface IProjectPermissions {
  canManageProject: boolean;
  canManageStages: boolean;
  canManageRoles: boolean;
  canInviteMembers: boolean;
  canCreateCards: boolean;
  canEditCards: boolean;
  canDeleteCards: boolean;
  canMoveCards: boolean;
  canComment: boolean;
}

export interface IProjectCustomRole {
  id: string;
  name: string;
  description?: string;
  isCustom: true;
  permissions: IProjectPermissions;
}

export interface IProjectMember {
  userId: string;
  email: string;
  name?: string;
  role: FixedProjectRole | string; // fixed role or custom role id
  status: MemberStatus;
  invitedBy: string;
  joinedAt?: string;
  createdAt: string;
}

export interface IProjectStage {
  id: string;
  name: string;
  color?: string;
  order: number;
  isDefault?: boolean;
}

export interface IPlannerProject {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  ownerEmail?: string;
  ownerName?: string;
  members: IProjectMember[];
  customRoles: IProjectCustomRole[];
  stages: IProjectStage[];
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProjectDto {
  title: string;
  description?: string;
  stages?: Array<{ name: string; color?: string }>;
}

export interface IUpdateProjectDto {
  title?: string;
  description?: string;
  archived?: boolean;
}

export interface IInviteMemberDto {
  email: string;
  role: FixedProjectRole | string;
}

export interface IUpdateMemberRoleDto {
  role: FixedProjectRole | string;
}

export interface ICreateCustomRoleDto {
  name: string;
  description?: string;
  permissions: IProjectPermissions;
}

export interface IUpdateCustomRoleDto {
  name?: string;
  description?: string;
  permissions?: Partial<IProjectPermissions>;
}

export interface ICreateStageDto {
  name: string;
  color?: string;
}

export interface IUpdateStageDto {
  name?: string;
  color?: string;
}

export interface IReorderStagesDto {
  stageIds: string[];
}

export type PlannerNotificationType =
  | 'project_invite'
  | 'card_moved'
  | 'card_assigned'
  | 'stage_changed'
  | 'mention';

export interface IPlannerNotification {
  id: string;
  userId: string;
  projectId?: string;
  projectTitle?: string;
  actorId: string;
  actorName?: string;
  actorEmail?: string;
  type: PlannerNotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface IProjectsListResponse {
  myProjects: IPlannerProject[];
  collaborativeProjects: IPlannerProject[];
  pendingInvitations: IPlannerProject[];
}

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITodoReminder {
  reminderTime: string; // ISO string or YYYY-MM-DDTHH:mm
  repeat: ReminderRepeat;
  isTriggered: boolean;
  snoozedUntil?: string; // ISO string
}

export interface INote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color?: string; // Hex or CSS color token
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateNoteDto {
  title?: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
  sourceUrl?: string;
}

export interface IUpdateNoteDto extends Partial<ICreateNoteDto> {}

export interface ITodoItem {
  id: string;
  userId: string;
  projectId?: string;
  stageId?: string;
  assigneeIds?: string[];
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  dueDate?: string; // ISO string or YYYY-MM-DD
  dueTime?: string; // HH:mm
  tags?: string[];
  subtasks?: ISubtask[];
  reminder?: ITodoReminder;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateTodoDto {
  title: string;
  description?: string;
  projectId?: string;
  stageId?: string;
  assigneeIds?: string[];
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  dueTime?: string;
  tags?: string[];
  subtasks?: ISubtask[];
  reminder?: ITodoReminder;
}

export interface IUpdateTodoDto extends Partial<ICreateTodoDto> {
  completedAt?: string;
}

export interface IPlannerDashboardResponse {
  notes: INote[];
  todos: ITodoItem[];
  todaysTodos: ITodoItem[];
  overdueTodos: ITodoItem[];
  activeReminders: ITodoItem[];
  stats: {
    totalNotes: number;
    totalTodos: number;
    pendingTodos: number;
    completedTodos: number;
  };
}

