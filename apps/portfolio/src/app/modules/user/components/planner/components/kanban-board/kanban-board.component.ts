import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucidePlus,
  lucideClock,
  lucideCalendar,
  lucideBell,
  lucideArrowRight,
  lucideArrowLeft,
  lucideCheckCircle2,
  lucideCircle,
  lucideMoreVertical,
  lucideTrash2,
  lucideEdit3,
} from '@ng-icons/lucide';
import { ITodoItem, TodoStatus, TodoPriority } from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-kanban-board',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideCheck,
      lucidePlus,
      lucideClock,
      lucideCalendar,
      lucideBell,
      lucideArrowRight,
      lucideArrowLeft,
      lucideCheckCircle2,
      lucideCircle,
      lucideMoreVertical,
      lucideTrash2,
      lucideEdit3,
    }),
  ],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  @Input({ required: true }) pendingTodos: ITodoItem[] = [];
  @Input({ required: true }) inProgressTodos: ITodoItem[] = [];
  @Input({ required: true }) completedTodos: ITodoItem[] = [];
  @Input() todayStr: string = new Date().toISOString().split('T')[0];

  @Output() moveStatus = new EventEmitter<{ todoId: string; newStatus: TodoStatus }>();
  @Output() toggleStatus = new EventEmitter<ITodoItem>();
  @Output() edit = new EventEmitter<ITodoItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() openNewTask = new EventEmitter<void>();

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

  isOverdue(todo: ITodoItem): boolean {
    return Boolean(todo.dueDate && todo.dueDate < this.todayStr && todo.status !== 'completed');
  }
}
