import { Injectable, inject, signal, computed } from '@angular/core';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  ISubtask,
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
  readonly activeTab = signal<'all' | 'notes' | 'todos'>('all');
  readonly todoFilter = signal<'all' | 'today' | 'upcoming' | 'completed'>('all');

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
    // Attempt instant restore from offline cache
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
    // Optimistic
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
        // Rollback
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

    this.api.toggleTodo(todo.id).subscribe({
      next: (updated) => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todo.id ? updated : t)),
        );
        this.platform.updateBadge(this.pendingTodos().length);
        this.syncCache();
      },
      error: () => {
        // Rollback
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todo.id ? todo : t)),
        );
        this.platform.triggerHaptic('error');
        this.platform.updateBadge(this.pendingTodos().length);
        toast.error('Failed to toggle task');
      },
    });
  }

  deleteTodo(id: string): void {
    const backup = this.todos();
    this.notes.update((prev) => prev.filter((t) => t.id !== id));
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
        this.syncCache();
        toast.info(`Reminder snoozed for ${minutes} minutes`);
      },
      error: () => {
        this.platform.triggerHaptic('error');
        toast.error('Could not snooze reminder');
      },
    });
  }

  private syncCache(): void {
    this.platform.setStorageItem(PLANNER_OFFLINE_CACHE_KEY, {
      notes: this.notes(),
      todos: this.todos(),
    });
  }
}
