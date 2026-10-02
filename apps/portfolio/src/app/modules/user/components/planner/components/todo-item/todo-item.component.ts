import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideTrash2,
  lucideEdit3,
  lucideCalendar,
  lucideClock,
  lucideBell,
  lucideChevronDown,
  lucideChevronUp,
  lucidePlus,
  lucideX,
  lucideAlertCircle,
  lucideShare2,
} from '@ng-icons/lucide';
import { ITodoItem, TodoPriority } from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideCheck,
      lucideTrash2,
      lucideEdit3,
      lucideCalendar,
      lucideClock,
      lucideBell,
      lucideChevronDown,
      lucideChevronUp,
      lucidePlus,
      lucideX,
      lucideAlertCircle,
      lucideShare2,
    }),
  ],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: ITodoItem;
  @Input() todayStr: string = new Date().toISOString().split('T')[0];

  @Output() statusToggle = new EventEmitter<ITodoItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<ITodoItem>();
  @Output() share = new EventEmitter<ITodoItem>();
  @Output() subtaskToggle = new EventEmitter<{ todoId: string; subtaskId: string }>();
  @Output() addSubtask = new EventEmitter<{ todoId: string; title: string }>();
  @Output() deleteSubtask = new EventEmitter<{ todoId: string; subtaskId: string }>();
  @Output() tagClick = new EventEmitter<string>();
  @Output() snooze = new EventEmitter<{ todoId: string; minutes: number }>();

  readonly isSubtasksExpanded = signal<boolean>(false);
  newSubtaskTitle = signal<string>('');

  get isOverdue(): boolean {
    return Boolean(
      this.todo.dueDate &&
        this.todo.dueDate < this.todayStr &&
        this.todo.status !== 'completed',
    );
  }

  get completedSubtasksCount(): number {
    return this.todo.subtasks ? this.todo.subtasks.filter((s) => s.completed).length : 0;
  }

  get totalSubtasksCount(): number {
    return this.todo.subtasks ? this.todo.subtasks.length : 0;
  }

  get subtaskProgressPercent(): number {
    if (!this.totalSubtasksCount) return 0;
    return Math.round((this.completedSubtasksCount / this.totalSubtasksCount) * 100);
  }

  onAddSubtask(): void {
    const title = this.newSubtaskTitle().trim();
    if (!title) return;
    this.addSubtask.emit({ todoId: this.todo.id, title });
    this.newSubtaskTitle.set('');
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
