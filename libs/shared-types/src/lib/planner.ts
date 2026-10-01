export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export type ReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

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
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: string;
  dueTime?: string;
  tags?: string[];
  subtasks?: ISubtask[];
  reminder?: ITodoReminder;
}

export interface IUpdateTodoDto extends Partial<ICreateTodoDto> {}

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
