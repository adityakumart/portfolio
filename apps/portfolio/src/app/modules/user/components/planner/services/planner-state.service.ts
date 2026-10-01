import { Injectable, inject, signal, computed } from '@angular/core';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
} from '@portfolio/shared-types';
import { PlannerApiService } from './planner-api.service';
import { PlatformAdapterService } from './platform-adapter.service';
import { toast } from '@spartan-ng/brain/sonner';

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
  loadDashboard(): void {
    this.isLoading.set(true);
    this.api.getDashboard().subscribe({
      next: (res) => {
        this.notes.set(res.notes || []);
        this.todos.set(res.todos || []);
        this.isLoading.set(false);
        this.platform.updateBadge(this.pendingTodos().length);
      },
      error: (err) => {
        console.error('Failed to load planner dashboard:', err);
        this.isLoading.set(false);
        toast.error('Could not load Planner items. Please check connection.');
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
          toast.success('Note saved');
          resolve(newNote);
        },
        error: (err) => {
          this.isSaving.set(false);
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
          resolve(updated);
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error('Failed to update note');
          reject(err);
        },
      });
    });
  }

  toggleNotePin(note: INote): void {
    const newPinned = !note.isPinned;
    // Optimistic
    this.notes.update((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, isPinned: newPinned } : n)),
    );
    this.api.updateNote(note.id, { isPinned: newPinned }).subscribe({
      next: (updated) => {
        this.notes.update((prev) =>
          prev.map((n) => (n.id === note.id ? updated : n)),
        );
      },
      error: () => {
        // Rollback
        this.notes.update((prev) =>
          prev.map((n) => (n.id === note.id ? note : n)),
        );
        toast.error('Failed to update pin status');
      },
    });
  }

  deleteNote(id: string): void {
    const backup = this.notes();
    this.notes.update((prev) => prev.filter((n) => n.id !== id));

    this.api.deleteNote(id).subscribe({
      next: () => {
        toast.success('Note deleted');
      },
      error: () => {
        this.notes.set(backup);
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
          this.platform.updateBadge(this.pendingTodos().length);
          toast.success('Task created');
          resolve(newTodo);
        },
        error: (err) => {
          this.isSaving.set(false);
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
          this.platform.updateBadge(this.pendingTodos().length);
          resolve(updated);
        },
        error: (err) => {
          this.isSaving.set(false);
          toast.error('Failed to update task');
          reject(err);
        },
      });
    });
  }

  toggleTodoStatus(todo: ITodoItem): void {
    const isNowCompleted = todo.status !== 'completed';
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
      },
      error: () => {
        // Rollback
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todo.id ? todo : t)),
        );
        this.platform.updateBadge(this.pendingTodos().length);
        toast.error('Failed to toggle task');
      },
    });
  }

  deleteTodo(id: string): void {
    const backup = this.todos();
    this.todos.update((prev) => prev.filter((t) => t.id !== id));
    this.platform.updateBadge(this.pendingTodos().length);

    this.api.deleteTodo(id).subscribe({
      next: () => {
        toast.success('Task removed');
      },
      error: () => {
        this.todos.set(backup);
        this.platform.updateBadge(this.pendingTodos().length);
        toast.error('Failed to remove task');
      },
    });
  }

  snoozeReminder(todoId: string, minutes: number = 10): void {
    this.api.snoozeReminder(todoId, minutes).subscribe({
      next: (updated) => {
        this.todos.update((prev) =>
          prev.map((t) => (t.id === todoId ? updated : t)),
        );
        toast.info(`Reminder snoozed for ${minutes} minutes`);
      },
      error: () => {
        toast.error('Could not snooze reminder');
      },
    });
  }
}
