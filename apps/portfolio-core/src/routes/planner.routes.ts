import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  handleGetDashboard,
  handleGetNotes,
  handleCreateNote,
  handleUpdateNote,
  handleDeleteNote,
  handleGetTodos,
  handleCreateTodo,
  handleUpdateTodo,
  handleToggleTodoStatus,
  handleDeleteTodo,
  handleGetActiveReminders,
  handleSnoozeReminder,
} from '../controllers/planner.controller';
import {
  handleGetProjects,
  handleCreateProject,
  handleGetProject,
  handleUpdateProject,
  handleDeleteProject,
  handleInviteMember,
  handleAcceptInvitation,
  handleDeclineInvitation,
  handleUpdateMemberRole,
  handleRemoveMember,
  handleAddStage,
  handleUpdateStage,
  handleReorderStages,
  handleDeleteStage,
  handleCreateCustomRole,
  handleUpdateCustomRole,
  handleDeleteCustomRole,
  handleGetProjectTodos,
  handleTransitionTodoStage,
  handleGetNotifications,
  handleMarkNotificationRead,
  handleMarkAllNotificationsRead,
  handleNotificationStream,
} from '../controllers/planner-projects.controller';

export const plannerRouter = Router();

// Protect all routes with JWT authentication (supports Bearer header and ?token= for SSE)
plannerRouter.use(authenticateToken);

// ----------------------------------------------------
// Real-time SSE Stream & Notifications
// ----------------------------------------------------
plannerRouter.get('/notifications/stream', handleNotificationStream);
plannerRouter.get('/notifications', handleGetNotifications);
plannerRouter.patch('/notifications/read-all', handleMarkAllNotificationsRead);
plannerRouter.patch('/notifications/:id/read', handleMarkNotificationRead);

// ----------------------------------------------------
// Consolidated Dashboard
// ----------------------------------------------------
plannerRouter.get('/dashboard', handleGetDashboard);

// ----------------------------------------------------
// Notes CRUD
// ----------------------------------------------------
plannerRouter.get('/notes', handleGetNotes);
plannerRouter.post('/notes', handleCreateNote);
plannerRouter.put('/notes/:id', handleUpdateNote);
plannerRouter.delete('/notes/:id', handleDeleteNote);

// ----------------------------------------------------
// Projects & Collaborators (GitHub Projects-style)
// ----------------------------------------------------
plannerRouter.get('/projects', handleGetProjects);
plannerRouter.post('/projects', handleCreateProject);
plannerRouter.get('/projects/:id', handleGetProject);
plannerRouter.put('/projects/:id', handleUpdateProject);
plannerRouter.delete('/projects/:id', handleDeleteProject);

// Collaborator Invitations & Access Gating
plannerRouter.post('/projects/:id/members', handleInviteMember);
plannerRouter.post('/projects/:id/accept', handleAcceptInvitation);
plannerRouter.post('/projects/:id/decline', handleDeclineInvitation);
plannerRouter.patch('/projects/:id/members/:userId', handleUpdateMemberRole);
plannerRouter.delete('/projects/:id/members/:userId', handleRemoveMember);

// Dynamic Vertical Workflow Stages
plannerRouter.post('/projects/:id/stages', handleAddStage);
plannerRouter.patch('/projects/:id/stages/:stageId', handleUpdateStage);
plannerRouter.put('/projects/:id/stages/reorder', handleReorderStages);
plannerRouter.delete('/projects/:id/stages/:stageId', handleDeleteStage);

// Custom Roles (RBAC)
plannerRouter.post('/projects/:id/roles', handleCreateCustomRole);
plannerRouter.patch('/projects/:id/roles/:roleId', handleUpdateCustomRole);
plannerRouter.delete('/projects/:id/roles/:roleId', handleDeleteCustomRole);

// Project Todos
plannerRouter.get('/projects/:id/todos', handleGetProjectTodos);

// ----------------------------------------------------
// Todos CRUD & Stage Transitions
// ----------------------------------------------------
plannerRouter.get('/todos', handleGetTodos);
plannerRouter.post('/todos', handleCreateTodo);
plannerRouter.put('/todos/:id', handleUpdateTodo);
plannerRouter.patch('/todos/:id/toggle', handleToggleTodoStatus);
plannerRouter.patch('/todos/:id/stage', handleTransitionTodoStage);
plannerRouter.delete('/todos/:id', handleDeleteTodo);

// Reminders
plannerRouter.get('/reminders/active', handleGetActiveReminders);
plannerRouter.post('/todos/:id/snooze', handleSnoozeReminder);
