import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideBell,
  lucideCalendar,
  lucideClock,
  lucideTag,
  lucidePlus,
  lucideCheck,
} from '@ng-icons/lucide';
import {
  ITodoItem,
  TodoPriority,
  ITodoReminder,
  ISubtask,
  ReminderRepeat,
} from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-todo-form-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideX,
      lucideBell,
      lucideCalendar,
      lucideClock,
      lucideTag,
      lucidePlus,
      lucideCheck,
    }),
  ],
  templateUrl: './todo-form-sheet.component.html',
  styleUrls: ['./todo-form-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFormSheetComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() todo: ITodoItem | null = null;
  @Input() isSaving = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    title: string;
    description?: string;
    priority: TodoPriority;
    dueDate?: string;
    dueTime?: string;
    tags: string[];
    reminder?: ITodoReminder;
    subtasks?: ISubtask[];
  }>();

  form = {
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    dueDate: '',
    dueTime: '',
    tagInput: '',
    tags: [] as string[],
    enableReminder: false,
    reminderTime: '',
    repeat: 'none' as ReminderRepeat,
    newSubtaskInput: '',
    subtasks: [] as ISubtask[],
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] || changes['isOpen']) {
      if (this.todo) {
        this.form = {
          title: this.todo.title || '',
          description: this.todo.description || '',
          priority: this.todo.priority || 'medium',
          dueDate: this.todo.dueDate || '',
          dueTime: this.todo.dueTime || '',
          tagInput: '',
          tags: [...(this.todo.tags || [])],
          enableReminder: Boolean(this.todo.reminder),
          reminderTime: this.todo.reminder?.reminderTime || '',
          repeat: this.todo.reminder?.repeat || 'none',
          newSubtaskInput: '',
          subtasks: this.todo.subtasks ? [...this.todo.subtasks] : [],
        };
      } else {
        this.resetForm();
      }
    }
  }

  resetForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = {
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
      newSubtaskInput: '',
      subtasks: [],
    };
  }

  addTag(): void {
    const t = this.form.tagInput.trim().replace(/^#/, '');
    if (t && !this.form.tags.includes(t)) {
      this.form.tags.push(t);
      this.form.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.form.tags = this.form.tags.filter((t) => t !== tag);
  }

  addSubtask(): void {
    const title = this.form.newSubtaskInput.trim();
    if (title) {
      this.form.subtasks.push({
        id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title,
        completed: false,
      });
      this.form.newSubtaskInput = '';
    }
  }

  removeSubtask(idx: number): void {
    this.form.subtasks.splice(idx, 1);
  }

  onSave(): void {
    if (!this.form.title.trim()) return;

    if (this.form.tagInput.trim()) {
      this.addTag();
    }
    if (this.form.newSubtaskInput.trim()) {
      this.addSubtask();
    }

    const reminder: ITodoReminder | undefined =
      this.form.enableReminder && this.form.reminderTime
        ? {
            reminderTime: this.form.reminderTime,
            repeat: this.form.repeat,
            isTriggered: false,
          }
        : undefined;

    this.save.emit({
      title: this.form.title.trim(),
      description: this.form.description.trim() || undefined,
      priority: this.form.priority,
      dueDate: this.form.dueDate || undefined,
      dueTime: this.form.dueTime || undefined,
      tags: this.form.tags,
      reminder,
      subtasks: this.form.subtasks.length > 0 ? this.form.subtasks : undefined,
    });
  }
}
