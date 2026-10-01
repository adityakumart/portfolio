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

export const plannerRouter = Router();

// Protect all routes with JWT authentication
plannerRouter.use(authenticateToken);

// Consolidated Dashboard
plannerRouter.get('/dashboard', handleGetDashboard);

// Notes CRUD
plannerRouter.get('/notes', handleGetNotes);
plannerRouter.post('/notes', handleCreateNote);
plannerRouter.put('/notes/:id', handleUpdateNote);
plannerRouter.delete('/notes/:id', handleDeleteNote);

// Todos CRUD & Toggle
plannerRouter.get('/todos', handleGetTodos);
plannerRouter.post('/todos', handleCreateTodo);
plannerRouter.put('/todos/:id', handleUpdateTodo);
plannerRouter.patch('/todos/:id/toggle', handleToggleTodoStatus);
plannerRouter.delete('/todos/:id', handleDeleteTodo);

// Reminders
plannerRouter.get('/reminders/active', handleGetActiveReminders);
plannerRouter.post('/todos/:id/snooze', handleSnoozeReminder);
