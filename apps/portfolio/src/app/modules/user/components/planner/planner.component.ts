import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckSquare,
  lucideStickyNote,
  lucidePlus,
  lucideSearch,
  lucidePin,
  lucideTrash2,
  lucideBell,
  lucideCalendar,
  lucideClock,
  lucideTag,
  lucideFilter,
  lucideCheck,
  lucideAlertCircle,
  lucideX,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { PlannerStateService } from './services/planner-state.service';
import { PlannerReminderService } from './services/planner-reminder.service';
import { PlatformAdapterService } from './services/platform-adapter.service';
import {
  INote,
  ITodoItem,
  TodoPriority,
  TodoStatus,
} from '@portfolio/shared-types';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  providers: [
    provideIcons({
      lucideCheckSquare,
      lucideStickyNote,
      lucidePlus,
      lucideSearch,
      lucidePin,
      lucideTrash2,
      lucideBell,
      lucideCalendar,
      lucideClock,
      lucideTag,
      lucideFilter,
      lucideCheck,
      lucideAlertCircle,
      lucideX,
    }),
  ],
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlannerComponent implements OnInit, OnDestroy {
  readonly state = inject(PlannerStateService);
  readonly reminderService = inject(PlannerReminderService);
  readonly platform = inject(PlatformAdapterService);

  // Dialog / Sheet Modals
  readonly isNoteModalOpen = signal<boolean>(false);
  readonly isTodoModalOpen = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);

  // New Note Form Model
  noteForm = {
    title: '',
    content: '',
    tagInput: '',
    tags: [] as string[],
    isPinned: false,
    color: '#10b981',
  };

  // New Todo Form Model
  todoForm = {
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    dueDate: '',
    dueTime: '',
    tagInput: '',
    tags: [] as string[],
    enableReminder: false,
    reminderTime: '',
    repeat: 'none' as 'none' | 'daily' | 'weekly',
  };

  // Inline Quick Task input
  quickTaskTitle = signal<string>('');

  ngOnInit(): void {
    this.state.loadDashboard();
    this.reminderService.init();
  }

  ngOnDestroy(): void {
    this.reminderService.destroy();
  }

  // Quick Inline Task creation
  async submitQuickTask(): Promise<void> {
    const title = this.quickTaskTitle().trim();
    if (!title) return;

    await this.state.addTodo({
      title,
      priority: 'medium',
      status: 'pending',
      dueDate: this.state.todaysDateStr(),
    });

    this.quickTaskTitle.set('');
  }

  // Note Modal Actions
  openNoteModal(): void {
    this.noteForm = {
      title: '',
      content: '',
      tagInput: '',
      tags: [],
      isPinned: false,
      color: '#10b981',
    };
    this.isNoteModalOpen.set(true);
  }

  closeNoteModal(): void {
    this.isNoteModalOpen.set(false);
  }

  addNoteTag(): void {
    const t = this.noteForm.tagInput.trim().replace(/^#/, '');
    if (t && !this.noteForm.tags.includes(t)) {
      this.noteForm.tags.push(t);
      this.noteForm.tagInput = '';
    }
  }

  removeNoteTag(tag: string): void {
    this.noteForm.tags = this.noteForm.tags.filter((t) => t !== tag);
  }

  async saveNote(): Promise<void> {
    if (!this.noteForm.content.trim()) return;

    if (this.noteForm.tagInput.trim()) {
      this.addNoteTag();
    }

    await this.state.addNote({
      title: this.noteForm.title.trim(),
      content: this.noteForm.content.trim(),
      tags: this.noteForm.tags,
      isPinned: this.noteForm.isPinned,
      color: this.noteForm.color,
    });

    this.closeNoteModal();
  }

  // Todo Modal Actions
  openTodoModal(): void {
    const today = this.state.todaysDateStr();
    this.todoForm = {
      title: '',
      description: '',
      priority: 'medium',
      dueDate: today,
      dueTime: '12:00',
      tagInput: '',
      tags: [],
      enableReminder: false,
      reminderTime: `${today}T12:00`,
      repeat: 'none',
    };
    this.isTodoModalOpen.set(true);
  }

  closeTodoModal(): void {
    this.isTodoModalOpen.set(false);
  }

  addTodoTag(): void {
    const t = this.todoForm.tagInput.trim().replace(/^#/, '');
    if (t && !this.todoForm.tags.includes(t)) {
      this.todoForm.tags.push(t);
      this.todoForm.tagInput = '';
    }
  }

  removeTodoTag(tag: string): void {
    this.todoForm.tags = this.todoForm.tags.filter((t) => t !== tag);
  }

  async saveTodo(): Promise<void> {
    if (!this.todoForm.title.trim()) return;

    if (this.todoForm.tagInput.trim()) {
      this.addTodoTag();
    }

    const reminder = this.todoForm.enableReminder && this.todoForm.reminderTime
      ? {
          reminderTime: this.todoForm.reminderTime,
          repeat: this.todoForm.repeat,
          isTriggered: false,
        }
      : undefined;

    await this.state.addTodo({
      title: this.todoForm.title.trim(),
      description: this.todoForm.description.trim(),
      priority: this.todoForm.priority,
      status: 'pending',
      dueDate: this.todoForm.dueDate || undefined,
      dueTime: this.todoForm.dueTime || undefined,
      tags: this.todoForm.tags,
      reminder,
    });

    this.closeTodoModal();
  }

  async requestNotifications(): Promise<void> {
    const granted = await this.reminderService.requestPermission();
    if (granted) {
      await this.platform.dispatchNotification('Planner Alerts Active', {
        body: 'You will receive reminders for scheduled tasks.',
      });
    }
  }

  getPriorityClass(priority: TodoPriority): string {
    switch (priority) {
      case 'urgent':
        return 'badge-urgent';
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
      default:
        return 'badge-low';
    }
  }
}
