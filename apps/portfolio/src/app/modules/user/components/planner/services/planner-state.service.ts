import { Injectable, inject, signal, computed } from '@angular/core';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  ISubtask,
  TodoStatus,
} from '@portfolio/shared-types';
import { PlannerApiService } from './planner-api.service';
import { PlatformAdapterService } from './platform-adapter.service';
import { toast } from '@spartan-ng/brain/sonner';

const PLANNER_OFFLINE_CACHE_KEY = 'portfolio_planner_offline_cache';

@Injectable({
  providedIn: 'root',
})
export class PlannerStateService {
  private api = inject(PlannerApiService);
  private platform = inject(PlatformAdapterService);

  // Core State Signals
  readonly notes = signal<INote[]>([]);
  readonly todos = signal<ITodoItem[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedTag = signal<string | null>(null);
  readonly activeTab = signal<'todos' | 'notes'>(this.getInitialTab());
  readonly todoFilter = signal<'all' | 'today' | 'upcoming' | 'completed'>('all');

  private getInitialTab(): 'todos' | 'notes' {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('portfolio_planner_active_tab');
        if (stored === 'notes' || stored === 'todos') {
          return stored;
        }
      } catch {}
    }
    return 'todos';
  }

  setActiveTab(tab: 'todos' | 'notes'): void {
    this.activeTab.set(tab);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('portfolio_planner_active_tab', tab);
      } catch {}
    }
  }

  // View modes (Phase 3: List vs Kanban Board for Tasks, Grid vs List for Notes)
  readonly tasksViewMode = signal<'list' | 'kanban'>('list');
  readonly notesViewMode = signal<'grid' | 'list'>('grid');

  // Currently editing models (null if adding new)
  readonly editingNote = signal<INote | null>(null);
  readonly editingTodo = signal<ITodoItem | null>(null);

  // Computed Derived Signals
  readonly todaysDateStr = computed(() => {
    return new Date().toISOString().split('T')[0];
  });

  readonly allTags = computed(() => {
    const tagSet = new Set<string>();
    this.notes().forEach((n) => n.tags?.forEach((t) => tagSet.add(t)));
    this.todos().forEach((td) => td.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  });

  readonly filteredNotes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.selectedTag();

    return this.notes()
      .filter((n) => {
        const matchesQuery =
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q);
        const matchesTag = !tag || n.tags?.includes(tag);
        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  });

  readonly todaysTodos = computed(() => {
    const today = this.todaysDateStr();
    return this.todos().filter(
      (t) => t.dueDate === today && t.status !== 'completed' && t.status !== 'archived',
    );
  });

  readonly overdueTodos = computed(() => {
    const today = this.todaysDateStr();
    return this.todos().filter(
      (t) =>
        t.dueDate &&
        t.dueDate < today &&
        t.status !== 'completed' &&
        t.status !== 'archived',
    );
  });

  readonly completedTodos = computed(() => {
    return this.todos().filter((t) => t.status === 'completed');
  });

  readonly pendingTodos = computed(() => {
    return this.todos().filter(
      (t) => t.status !== 'completed' && t.status !== 'archived',
    );
  });

  // Kanban Column Computations
  readonly pendingColumnTodos = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.selectedTag();
    return this.todos().filter((t) => {
      if (t.status !== 'pending') return false;
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      const matchesTag = !tag || t.tags?.includes(tag);
      return matchesQuery && matchesTag;
    });
  });

  readonly inProgressColumnTodos = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.selectedTag();
    return this.todos().filter((t) => {
      if (t.status !== 'in_progress') return false;
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      const matchesTag = !tag || t.tags?.includes(tag);
      return matchesQuery && matchesTag;
    });
  });

  readonly completedColumnTodos = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.selectedTag();
    return this.todos().filter((t) => {
      if (t.status !== 'completed') return false;
      const matchesQuery = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
      const matchesTag = !tag || t.tags?.includes(tag);
      return matchesQuery && matchesTag;
    });
  });

  readonly filteredTodos = computed(() => {
    const filter = this.todoFilter();
    const q = this.searchQuery().toLowerCase().trim();
    const tag = this.selectedTag();
    const today = this.todaysDateStr();

    return this.todos()
      .filter((t) => {
        if (t.status === 'archived') return false;

        const matchesQuery =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q);
        const matchesTag = !tag || t.tags?.includes(tag);
        if (!matchesQuery || !matchesTag) return false;

        if (filter === 'today') {
          return t.dueDate === today && t.status !== 'completed';
        }
        if (filter === 'upcoming') {
          return Boolean(t.dueDate && t.dueDate > today && t.status !== 'completed');
        }
        if (filter === 'completed') {
          return t.status === 'completed';
        }
        return true;
      })
      .sort((a, b) => {
        // Uncompleted first
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        // Priority
        const priorityOrder: Record<string, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        const pDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        // Due date
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  });

  readonly activeReminders = computed(() => {
    return this.todos().filter(
      (t) => t.reminder && !t.reminder.isTriggered && t.status !== 'completed',
    );
  });

  // State actions
  async loadDashboard(): Promise<void> {
    // Instant restore from offline cache
    const cached = await this.platform.getStorageItem<{ notes: INote[]; todos: ITodoItem[] }>(
      PLANNER_OFFLINE_CACHE_KEY,
    );
    if (cached && (this.notes().length === 0 && this.todos().length === 0)) {
      if (cached.notes) this.notes.set(cached.notes);
      if (cached.todos) this.todos.set(cached.todos);
    }

    this.isLoading.set(true);
    this.api.getDashboard().subscribe({
      next: (res) => {
        const fetchedNotes = res.notes || [];
        const fetchedTodos = res.todos || [];
        this.notes.set(fetchedNotes);
        this.todos.set(fetchedTodos);
        this.isLoading.set(false);
        this.platform.updateBadge(this.pendingTodos().length);
        this.platform.setStorageItem(PLANNER_OFFLINE_CACHE_KEY, {
          notes: fetchedNotes,
          todos: fetchedTodos,
        });
        // Sync local notification alarms
        fetchedTodos.forEach((td) => this.syncLocalNotification(td));
      },
      error: (err) => {
        console.error('Failed to load planner dashboard:', err);
        this.isLoading.set(false);
        if (!cached) {
          toast.error('Could not load Planner items. Please check connection.');
        }
      },
    });
  }

  addNote(dto: ICreateNoteDto): Promise<INote> {
    this.isSaving.set(true);
    return new Promise((resolve, reject) => {
      this.api.createNote(dto).subscribe({
        next: (newNote) => {
          this.notes.update((prev) => [newNote, ...prev]);
          this.isSaving.set(false);
          this.platform.triggerHaptic('success');
          this.syncCache();
          toast.success('Note saved');
          resolve(newNote);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.platform.triggerHaptic('error');
          toast.error('Failed to create note');
          reject(err);
        },
      });
    });
  }

  updateNote(id: string, dto: IUpdateNoteDto): Promise<INote> {
    this.isSaving.set(true);
    return new Promise((resolve, reject) => {
      this.api.updateNote(id, dto).subscribe({
        next: (updated) => {
          this.notes.update((prev) =>
            prev.map((n) => (n.id === id ? updated : n)),
          );
          this.isSaving.set(false);
          this.platform.triggerHaptic('light');
          this.syncCache();
          toast.success('Note updated');
          resolve(updated);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.platform.triggerHaptic('error');
          toast.error('Failed to update note');
          reject(err);
        },
      });
    });
  }

  toggleNotePin(note: INote): void {
    const newPinned = !note.isPinned;
    this.platform.triggerHaptic('selection');
    this.notes.update((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isPinned: newPinned } : n)),
    );
    this.api.updateNote(note.id, { isPinned: newPinned }).subscribe({
      next: (updated) => {
        this.notes.update((prev) =>
          prev.map((n) => (n.id === note.id ? updated : n)),
        );
        this.syncCache();
      },
      error: () => {
        this.notes.update((prev) =>
          prev.map((n) => (n.id === note.id ? note : n)),
        );
        this.platform.triggerHaptic('error');
        toast.error('Failed to update pin status');
      },
    });
  }

  deleteNote(id: string): void {
    const backup = this.notes();
    this.notes.update((prev) => prev.filter((n) => n.id !== id));
    this.platform.triggerHaptic('medium');

    this.api.deleteNote(id).subscribe({
      next: () => {
        this.syncCache();
        toast.success('Note deleted');
      },
      error: () => {
        this.notes.set(backup);
        this.platform.triggerHaptic('error');
        toast.error('Failed to delete note');
      },
    });
  }

  addTodo(dto: ICreateTodoDto): Promise<ITodoItem> {
    this.isSaving.set(true);
    return new Promise((resolve, reject) => {
      this.api.createTodo(dto).subscribe({
        next: (newTodo) => {
          this.todos.update((prev) => [newTodo, ...prev]);
          this.isSaving.set(false);
          this.platform.triggerHaptic('success');
          this.platform.updateBadge(this.pendingTodos().length);
          this.syncLocalNotification(newTodo);
          this.syncCache();
          toast.success('Task created');
          resolve(newTodo);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.platform.triggerHaptic('error');
          toast.error('Failed to create task');
          reject(err);
        },
      });
    });
  }

  updateTodo(id: string, dto: IUpdateTodoDto): Promise<ITodoItem> {
    this.isSaving.set(true);
    return new Promise((resolve, reject) => {
      this.api.updateTodo(id, dto).subscribe({
        next: (updated) => {
          this.todos.update((prev) =>
            prev.map((t) => (t.id === id ? updated : t)),
          );
          this.isSaving.set(false);
          this.platform.triggerHaptic('light');
          this.platform.updateBadge(this.pendingTodos().length);
          this.syncLocalNotification(updated);
          this.syncCache();
          resolve(updated);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.platform.triggerHaptic('error');
          toast.error('Failed to update task');
          reject(err);
        },
      });
    });
  }

  toggleTodoStatus(todo: ITodoItem): void {
    const isNowCompleted = todo.status !== 'completed';
    this.platform.triggerHaptic(isNowCompleted ? 'success' : 'selection');

    const optimistic: ITodoItem = {
      ...todo,
      status: isNowCompleted ? 'completed' : 'pending',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };

    this.todos.update((prev) =>
      prev.map((t) => (t.id === todo.id ? optimistic : t)),
    );
    this.platform.updateBadge(this.pendingTodos().length);
    this.syncLocalNotification(optimistic);

    this.api.toggleTodo(todo.id).subscribe({
      next: (updated) => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todo.id ? updated : t)),
        );
        this.platform.updateBadge(this.pendingTodos().length);
        this.syncCache();
      },
      error: () => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todo.id ? todo : t)),
        );
        this.platform.triggerHaptic('error');
        this.platform.updateBadge(this.pendingTodos().length);
        this.syncLocalNotification(todo);
        toast.error('Failed to toggle task');
      },
    });
  }

  // Move task status directly (for Kanban columns)
  moveTodoStatus(todoId: string, newStatus: TodoStatus): void {
    const target = this.todos().find((t) => t.id === todoId);
    if (!target || target.status === newStatus) return;

    this.platform.triggerHaptic('selection');
    const isCompleted = newStatus === 'completed';
    const optimistic: ITodoItem = {
      ...target,
      status: newStatus,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    };

    this.todos.update((prev) =>
      prev.map((t) => (t.id === todoId ? optimistic : t)),
    );
    this.platform.updateBadge(this.pendingTodos().length);
    this.syncLocalNotification(optimistic);

    this.api.updateTodo(todoId, {
      status: newStatus,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
    }).subscribe({
      next: (updated) => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todoId ? updated : t)),
        );
        this.syncCache();
        toast.info(`Task moved to ${newStatus.replace('_', ' ')}`);
      },
      error: () => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todoId ? target : t)),
        );
        this.syncCache();
        toast.error('Failed to move task');
      },
    });
  }

  deleteTodo(id: string): void {
    const backup = this.todos();
    const target = this.todos().find((t) => t.id === id);
    if (target) {
      this.platform.cancelLocalNotification(this.hashStringToInt(target.id));
    }

    this.todos.update((prev) => prev.filter((t) => t.id !== id));
    this.platform.triggerHaptic('medium');
    this.platform.updateBadge(this.pendingTodos().length);

    this.api.deleteTodo(id).subscribe({
      next: () => {
        this.syncCache();
        toast.success('Task removed');
      },
      error: () => {
        this.todos.set(backup);
        this.platform.triggerHaptic('error');
        this.platform.updateBadge(this.pendingTodos().length);
        toast.error('Failed to remove task');
      },
    });
  }

  // --- Subtask Management ---
  toggleSubtask(todoId: string, subtaskId: string): void {
    const target = this.todos().find((t) => t.id === todoId);
    if (!target || !target.subtasks) return;

    this.platform.triggerHaptic('selection');
    const updatedSubtasks: ISubtask[] = target.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st,
    );

    this.updateTodo(todoId, { subtasks: updatedSubtasks });
  }

  addSubtask(todoId: string, title: string): void {
    const target = this.todos().find((t) => t.id === todoId);
    if (!target) return;

    const newSubtask: ISubtask = {
      id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      completed: false,
    };
    const updatedSubtasks = [...(target.subtasks || []), newSubtask];
    this.updateTodo(todoId, { subtasks: updatedSubtasks });
  }

  removeSubtask(todoId: string, subtaskId: string): void {
    const target = this.todos().find((t) => t.id === todoId);
    if (!target || !target.subtasks) return;

    const updatedSubtasks = target.subtasks.filter((st) => st.id !== subtaskId);
    this.updateTodo(todoId, { subtasks: updatedSubtasks });
  }

  snoozeReminder(todoId: string, minutes: number = 10): void {
    this.api.snoozeReminder(todoId, minutes).subscribe({
      next: (updated) => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todoId ? updated : t)),
        );
        this.platform.triggerHaptic('light');
        this.syncLocalNotification(updated);
        this.syncCache();
        toast.info(`Reminder snoozed for ${minutes} minutes`);
      },
      error: () => {
        this.platform.triggerHaptic('error');
        toast.error('Could not snooze reminder');
      },
    });
  }

  // --- Data Portability: Export & Import ---
  exportBackup(): void {
    const today = this.todaysDateStr();
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      notes: this.notes(),
      todos: this.todos(),
    };
    const content = JSON.stringify(backupData, null, 2);
    this.platform.exportToFile(`planner-backup-${today}.json`, content, 'application/json');
    toast.success('Planner backup exported successfully');
  }

  async importBackup(jsonString: string): Promise<{ importedNotes: number; importedTodos: number }> {
    try {
      const data = JSON.parse(jsonString);
      if (!data || (!Array.isArray(data.notes) && !Array.isArray(data.todos))) {
        throw new Error('Invalid backup format');
      }

      const importedNotes: INote[] = data.notes || [];
      const importedTodos: ITodoItem[] = data.todos || [];

      // Merge avoiding duplicates by id
      const existingNoteIds = new Set(this.notes().map((n) => n.id));
      const newNotes = importedNotes.filter((n) => !existingNoteIds.has(n.id));

      const existingTodoIds = new Set(this.todos().map((t) => t.id));
      const newTodos = importedTodos.filter((t) => !existingTodoIds.has(t.id));

      this.notes.update((prev) => [...newNotes, ...prev]);
      this.todos.update((prev) => [...newTodos, ...prev]);

      this.syncCache();
      this.platform.updateBadge(this.pendingTodos().length);
      newTodos.forEach((t) => this.syncLocalNotification(t));

      toast.success(
        `Imported ${newNotes.length} notes and ${newTodos.length} tasks successfully`,
      );
      return { importedNotes: newNotes.length, importedTodos: newTodos.length };
    } catch (err: any) {
      toast.error('Failed to import backup: ' + (err.message || 'Invalid JSON'));
      throw err;
    }
  }

  private syncLocalNotification(todo: ITodoItem): void {
    const id = this.hashStringToInt(todo.id);
    if (todo.status === 'completed' || !todo.reminder || todo.reminder.isTriggered) {
      this.platform.cancelLocalNotification(id);
      return;
    }
    const targetDate = new Date(todo.reminder.reminderTime);
    if (!isNaN(targetDate.getTime()) && targetDate.getTime() > Date.now()) {
      this.platform.scheduleLocalNotification({
        id,
        title: `Task Reminder: ${todo.title}`,
        body: todo.description || 'This task is due now.',
        at: targetDate,
      });
    }
  }

  private hashStringToInt(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private syncCache(): void {
    this.platform.setStorageItem(PLANNER_OFFLINE_CACHE_KEY, {
      notes: this.notes(),
      todos: this.todos(),
    });
  }
}
