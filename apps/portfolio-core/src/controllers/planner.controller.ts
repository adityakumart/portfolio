import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../types/express';
import { getNoteModel, INoteDocument } from '../models/note.model';
import { getTodoModel, ITodoDocument } from '../models/todo.model';
import { getPlannerProjectModel } from '../models/planner-project.model';
import { resolveProjectPermissions } from '../services/planner-project.service';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  IPlannerDashboardResponse,
} from '@portfolio/shared-types';

function getParamId(req: AuthenticatedRequest, key: string = 'id'): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : (val || '');
}

function mapNoteDoc(doc: INoteDocument): INote {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    content: doc.content,
    tags: doc.tags || [],
    isPinned: Boolean(doc.isPinned),
    color: doc.color,
    sourceUrl: doc.sourceUrl,
    createdAt: doc.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString() || new Date().toISOString(),
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

// ----------------------------------------------------
// DASHBOARD
// ----------------------------------------------------
export async function handleGetDashboard(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User ID missing' });
      return;
    }

    const noteModel = await getNoteModel();
    const todoModel = await getTodoModel();

    const userObjectId = new Types.ObjectId(userId);
    const todayStr = new Date().toISOString().split('T')[0];

    const [notesDocs, todosDocs] = await Promise.all([
      noteModel.find({ userId: userObjectId }).sort({ isPinned: -1, updatedAt: -1 }).limit(50),
      todoModel
        .find({
          userId: userObjectId,
          $or: [{ projectId: null }, { projectId: { $exists: false } }],
          status: { $ne: 'archived' },
        } as any)
        .sort({ dueDate: 1, priority: -1 }),
    ]);

    const notes = notesDocs.map(mapNoteDoc);
    const todos = todosDocs.map(mapTodoDoc);

    const todaysTodos = todos.filter((t) => t.dueDate === todayStr && t.status !== 'completed');
    const overdueTodos = todos.filter(
      (t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completed',
    );
    const activeReminders = todos.filter(
      (t) => t.reminder && !t.reminder.isTriggered && t.status !== 'completed',
    );

    const totalNotes = await noteModel.countDocuments({ userId: userObjectId });
    const totalTodos = todos.length;
    const completedTodos = todos.filter((t) => t.status === 'completed').length;
    const pendingTodos = totalTodos - completedTodos;

    const response: IPlannerDashboardResponse = {
      notes,
      todos,
      todaysTodos,
      overdueTodos,
      activeReminders,
      stats: {
        totalNotes,
        totalTodos,
        pendingTodos,
        completedTodos,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error fetching planner dashboard:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ----------------------------------------------------
// NOTES CONTROLLERS
// ----------------------------------------------------
export async function handleGetNotes(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const { search, tag } = req.query;

    const noteModel = await getNoteModel();
    const query: any = { userId: new Types.ObjectId(userId) };

    if (tag && typeof tag === 'string') {
      query.tags = tag;
    }

    if (search && typeof search === 'string' && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    const docs = await noteModel
      .find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .limit(100);

    res.json(docs.map(mapNoteDoc));
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleCreateNote(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const body: ICreateNoteDto = req.body;

    if (!body || typeof body.content !== 'string') {
      res.status(400).json({ error: 'Bad Request', message: 'Note content is required.' });
      return;
    }

    const noteModel = await getNoteModel();
    const newNote = await noteModel.create({
      userId: new Types.ObjectId(userId),
      title: body.title?.trim() || '',
      content: body.content,
      tags: body.tags || [],
      isPinned: Boolean(body.isPinned),
      color: body.color,
      sourceUrl: body.sourceUrl,
    });

    res.status(201).json(mapNoteDoc(newNote));
  } catch (error: any) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateNote(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);
    const body: IUpdateNoteDto = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid note ID' });
      return;
    }

    const noteModel = await getNoteModel();
    const updated = await noteModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      { $set: body },
      { new: true },
    );

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'Note not found' });
      return;
    }

    res.json(mapNoteDoc(updated));
  } catch (error: any) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeleteNote(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid note ID' });
      return;
    }

    const noteModel = await getNoteModel();
    const result = await noteModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!result) {
      res.status(404).json({ error: 'Not Found', message: 'Note not found' });
      return;
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ----------------------------------------------------
// TODOS CONTROLLERS
// ----------------------------------------------------
export async function handleGetTodos(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const { status, priority, dueDate, projectId } = req.query;

    const todoModel = await getTodoModel();
    const query: any = {};

    if (projectId && typeof projectId === 'string') {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }
      const auth = resolveProjectPermissions(project, userId!);
      if (!auth || auth.status !== 'accepted') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Project access requires an accepted invitation.',
        });
        return;
      }
      query.projectId = new Types.ObjectId(projectId);
    } else {
      query.userId = new Types.ObjectId(userId);
      query.$or = [{ projectId: null }, { projectId: { $exists: false } }];
    }

    if (status && typeof status === 'string') {
      query.status = status;
    }
    if (priority && typeof priority === 'string') {
      query.priority = priority;
    }
    if (dueDate && typeof dueDate === 'string') {
      query.dueDate = dueDate;
    }

    const docs = await todoModel.find(query).sort({ dueDate: 1, priority: -1 });
    res.json(docs.map(mapTodoDoc));
  } catch (error: any) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleCreateTodo(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const body: ICreateTodoDto = req.body;

    if (!body || !body.title || !body.title.trim()) {
      res.status(400).json({ error: 'Bad Request', message: 'Task title is required.' });
      return;
    }

    let projectObjectId: Types.ObjectId | undefined = undefined;
    if (body.projectId) {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(body.projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }
      const auth = resolveProjectPermissions(project, userId!);
      if (!auth || auth.status !== 'accepted' || !auth.permissions.canCreateCards) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions to create cards in this project.',
        });
        return;
      }
      projectObjectId = new Types.ObjectId(body.projectId);
    }

    const todoModel = await getTodoModel();
    const newTodo = await todoModel.create({
      userId: new Types.ObjectId(userId),
      projectId: projectObjectId,
      stageId: body.stageId,
      assigneeIds: (body.assigneeIds || []).map((id) => new Types.ObjectId(id)),
      title: body.title.trim(),
      description: body.description?.trim() || '',
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      dueDate: body.dueDate,
      dueTime: body.dueTime,
      tags: body.tags || [],
      subtasks: body.subtasks || [],
      reminder: body.reminder,
    });

    res.status(201).json(mapTodoDoc(newTodo));
  } catch (error: any) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleUpdateTodo(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);
    const body: IUpdateTodoDto = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid todo ID' });
      return;
    }

    const todoModel = await getTodoModel();
    const existing = await todoModel.findById(id);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }

    if (existing.projectId) {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(existing.projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }
      const auth = resolveProjectPermissions(project, userId!);
      const isCardCreator = existing.userId.toString() === userId;
      if (!auth || auth.status !== 'accepted' || (!auth.permissions.canEditCards && !isCardCreator)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions to edit this card.',
        });
        return;
      }
    } else if (existing.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
      return;
    }

    const updateData: any = { ...body };
    if (body.assigneeIds) {
      updateData.assigneeIds = body.assigneeIds.map((aid) => new Types.ObjectId(aid));
    }
    if (body.status === 'completed') {
      updateData.completedAt = new Date();
    } else if (body.status) {
      updateData.completedAt = null;
    }

    const updated = await todoModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    res.json(mapTodoDoc(updated!));
  } catch (error: any) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleToggleTodoStatus(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid todo ID' });
      return;
    }

    const todoModel = await getTodoModel();
    const existing = await todoModel.findById(id);

    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }

    if (existing.projectId) {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(existing.projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }
      const auth = resolveProjectPermissions(project, userId!);
      if (!auth || auth.status !== 'accepted' || !auth.permissions.canMoveCards) {
        res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to change task status.' });
        return;
      }
    } else if (existing.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
      return;
    }

    const isNowCompleted = existing.status !== 'completed';
    existing.status = isNowCompleted ? 'completed' : 'pending';
    existing.completedAt = isNowCompleted ? new Date() : undefined;
    await existing.save();

    res.json(mapTodoDoc(existing));
  } catch (error: any) {
    console.error('Error toggling todo status:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleDeleteTodo(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid todo ID' });
      return;
    }

    const todoModel = await getTodoModel();
    const existing = await todoModel.findById(id);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }

    if (existing.projectId) {
      const projectModel = await getPlannerProjectModel();
      const project = await projectModel.findById(existing.projectId);
      if (!project || project.archived) {
        res.status(404).json({ error: 'Not Found', message: 'Project not found' });
        return;
      }
      const auth = resolveProjectPermissions(project, userId!);
      const isCardCreator = existing.userId.toString() === userId;
      if (!auth || auth.status !== 'accepted' || (!auth.permissions.canDeleteCards && !isCardCreator)) {
        res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions to delete card.' });
        return;
      }
    } else if (existing.userId.toString() !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
      return;
    }

    await todoModel.findByIdAndDelete(id);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

// ----------------------------------------------------
// REMINDERS CONTROLLERS
// ----------------------------------------------------
export async function handleGetActiveReminders(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const todoModel = await getTodoModel();

    const active = await todoModel
      .find({
        userId: new Types.ObjectId(userId),
        status: { $ne: 'completed' },
        'reminder.reminderTime': { $exists: true },
        'reminder.isTriggered': false,
      })
      .sort({ 'reminder.reminderTime': 1 });

    res.json(active.map(mapTodoDoc));
  } catch (error: any) {
    console.error('Error fetching active reminders:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function handleSnoozeReminder(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const userId = req.userId;
    const id = getParamId(req);
    const { minutes } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Bad Request', message: 'Invalid todo ID' });
      return;
    }

    const snoozeMinutes = typeof minutes === 'number' && minutes > 0 ? minutes : 10;
    const snoozedUntil = new Date(Date.now() + snoozeMinutes * 60 * 1000).toISOString();

    const todoModel = await getTodoModel();
    const updated = await todoModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
      {
        $set: {
          'reminder.snoozedUntil': snoozedUntil,
          'reminder.isTriggered': false,
        },
      },
      { new: true },
    );

    if (!updated) {
      res.status(404).json({ error: 'Not Found', message: 'Task not found' });
      return;
    }

    res.json(mapTodoDoc(updated));
  } catch (error: any) {
    console.error('Error snoozing reminder:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
