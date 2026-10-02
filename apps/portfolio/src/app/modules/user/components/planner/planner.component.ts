import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckSquare,
  lucideStickyNote,
  lucidePlus,
  lucideSearch,
  lucideBell,
  lucideCalendar,
  lucideClock,
  lucideTag,
  lucideFilter,
  lucideAlertCircle,
  lucideX,
  lucideCommand,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { PlannerStateService } from './services/planner-state.service';
import { PlannerReminderService } from './services/planner-reminder.service';
import { PlatformAdapterService } from './services/platform-adapter.service';
import { PlannerLayoutService } from './services/planner-layout.service';

import { NoteCardComponent } from './components/note-card/note-card.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { MobileFabComponent } from './components/mobile-fab/mobile-fab.component';
import { NoteEditorSheetComponent } from './components/note-editor-sheet/note-editor-sheet.component';
import { TodoFormSheetComponent } from './components/todo-form-sheet/todo-form-sheet.component';
import { CompactViewComponent } from './components/compact-view/compact-view.component';
import { ReminderSettingsDialogComponent } from './components/reminder-settings-dialog/reminder-settings-dialog.component';

import {
  INote,
  ITodoItem,
  TodoPriority,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  ITodoReminder,
  ISubtask,
  ReminderRepeat,
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
    NoteCardComponent,
    TodoItemComponent,
    MobileFabComponent,
    NoteEditorSheetComponent,
    TodoFormSheetComponent,
    CompactViewComponent,
    ReminderSettingsDialogComponent,
  ],
  providers: [
    provideIcons({
      lucideCheckSquare,
      lucideStickyNote,
      lucidePlus,
      lucideSearch,
      lucideBell,
      lucideCalendar,
      lucideClock,
      lucideTag,
      lucideFilter,
      lucideAlertCircle,
      lucideX,
      lucideCommand,
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
  readonly layout = inject(PlannerLayoutService);

  readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Modals & Sheets visibility
  readonly isNoteModalOpen = signal<boolean>(false);
  readonly isTodoModalOpen = signal<boolean>(false);
  readonly isReminderDialogOpen = signal<boolean>(false);

  // Active items for editing
  readonly activeNote = signal<INote | null>(null);
  readonly activeTodo = signal<ITodoItem | null>(null);
  readonly reminderTargetTodo = signal<ITodoItem | null>(null);

  // Inline Quick Task input
  quickTaskTitle = signal<string>('');

  ngOnInit(): void {
    this.state.loadDashboard();
    this.reminderService.init();

    // Register Desktop / Web keyboard shortcuts
    this.platform.registerGlobalShortcuts({
      onNewNote: () => this.openNoteModal(),
      onNewTask: () => this.openTodoModal(),
      onFocusSearch: () => {
        const el = this.searchInputRef()?.nativeElement;
        if (el) {
          el.focus();
          el.select();
        }
      },
      onEscape: () => this.closeAllModals(),
    });
  }

  ngOnDestroy(): void {
    this.reminderService.destroy();
    this.platform.unregisterGlobalShortcuts();
  }

  closeAllModals(): void {
    this.isNoteModalOpen.set(false);
    this.isTodoModalOpen.set(false);
    this.isReminderDialogOpen.set(false);
    this.activeNote.set(null);
    this.activeTodo.set(null);
    this.reminderTargetTodo.set(null);
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
  openNoteModal(noteToEdit?: INote): void {
    this.activeNote.set(noteToEdit || null);
    this.isNoteModalOpen.set(true);
  }

  closeNoteModal(): void {
    this.isNoteModalOpen.set(false);
    this.activeNote.set(null);
  }

  async handleSaveNote(noteData: {
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    color: string;
  }): Promise<void> {
    const current = this.activeNote();
    if (current) {
      await this.state.updateNote(current.id, noteData);
    } else {
      await this.state.addNote(noteData);
    }
    this.closeNoteModal();
  }

  // Todo Modal Actions
  openTodoModal(todoToEdit?: ITodoItem): void {
    this.activeTodo.set(todoToEdit || null);
    this.isTodoModalOpen.set(true);
  }

  closeTodoModal(): void {
    this.isTodoModalOpen.set(false);
    this.activeTodo.set(null);
  }

  async handleSaveTodo(todoData: {
    title: string;
    description?: string;
    priority: TodoPriority;
    dueDate?: string;
    dueTime?: string;
    tags: string[];
    reminder?: ITodoReminder;
    subtasks?: ISubtask[];
  }): Promise<void> {
    const current = this.activeTodo();
    if (current) {
      await this.state.updateTodo(current.id, todoData);
    } else {
      await this.state.addTodo({
        ...todoData,
        status: 'pending',
      });
    }
    this.closeTodoModal();
  }

  // Reminder Dialog Actions
  openReminderDialog(todo: ITodoItem): void {
    this.reminderTargetTodo.set(todo);
    this.isReminderDialogOpen.set(true);
  }

  closeReminderDialog(): void {
    this.isReminderDialogOpen.set(false);
    this.reminderTargetTodo.set(null);
  }

  handleUpdateReminder(data: {
    todoId: string;
    reminderTime: string;
    repeat: ReminderRepeat;
  }): void {
    this.state.updateTodo(data.todoId, {
      reminder: {
        reminderTime: data.reminderTime,
        repeat: data.repeat,
        isTriggered: false,
      },
    });
  }

  handleSnooze(data: { todoId: string; minutes: number }): void {
    this.state.snoozeReminder(data.todoId, data.minutes);
  }

  // Subtasks delegates
  handleSubtaskToggle(event: { todoId: string; subtaskId: string }): void {
    this.state.toggleSubtask(event.todoId, event.subtaskId);
  }

  handleAddSubtask(event: { todoId: string; title: string }): void {
    this.state.addSubtask(event.todoId, event.title);
  }

  handleDeleteSubtask(event: { todoId: string; subtaskId: string }): void {
    this.state.removeSubtask(event.todoId, event.subtaskId);
  }

  async requestNotifications(): Promise<void> {
    const granted = await this.reminderService.requestPermission();
    if (granted) {
      await this.platform.dispatchNotification('Planner Alerts Active', {
        body: 'You will receive reminders for scheduled tasks.',
      });
    }
  }
}
