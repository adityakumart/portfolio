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
import { lucideBell, lucideClock, lucideX } from '@ng-icons/lucide';
import { ITodoItem, ReminderRepeat } from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-reminder-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideBell,
      lucideClock,
      lucideX,
    }),
  ],
  templateUrl: './reminder-settings-dialog.component.html',
  styleUrls: ['./reminder-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReminderSettingsDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() todo: ITodoItem | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() updateReminder = new EventEmitter<{
    todoId: string;
    reminderTime: string;
    repeat: ReminderRepeat;
  }>();
  @Output() snooze = new EventEmitter<{ todoId: string; minutes: number }>();

  reminderTime = '';
  repeat: ReminderRepeat = 'none';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['todo'] && this.todo) {
      this.reminderTime =
        this.todo.reminder?.reminderTime ||
        `${this.todo.dueDate || new Date().toISOString().split('T')[0]}T12:00`;
      this.repeat = this.todo.reminder?.repeat || 'none';
    }
  }

  onSave(): void {
    if (!this.todo || !this.reminderTime) return;
    this.updateReminder.emit({
      todoId: this.todo.id,
      reminderTime: this.reminderTime,
      repeat: this.repeat,
    });
    this.close.emit();
  }

  onQuickSnooze(minutes: number): void {
    if (!this.todo) return;
    this.snooze.emit({ todoId: this.todo.id, minutes });
    this.close.emit();
  }
}
