import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DragDropModule,
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
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
  lucideMoveRight,
  lucideLayers,
  lucideGripVertical,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import {
  ITodoItem,
  TodoStatus,
  TodoPriority,
  IProjectStage,
} from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    NgIconComponent,
    HlmButtonImports,
    HlmDropdownMenuImports,
  ],
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
      lucideMoveRight,
      lucideLayers,
      lucideGripVertical,
    }),
  ],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  // Dynamic Project Stages & Cards
  @Input() stages: IProjectStage[] = [];
  @Input() projectCards: ITodoItem[] = [];

  // Fallback 3-column personal todo list inputs
  @Input() pendingTodos: ITodoItem[] = [];
  @Input() inProgressTodos: ITodoItem[] = [];
  @Input() completedTodos: ITodoItem[] = [];

  // RBAC permissions flags
  @Input() canMoveCards = true;
  @Input() canCreateCards = true;
  @Input() canEditCards = true;
  @Input() canDeleteCards = true;
  @Input() canManageStages = false;

  @Input() todayStr: string = new Date().toISOString().split('T')[0];

  @Output() moveStatus = new EventEmitter<{ todoId: string; newStatus: TodoStatus }>();
  @Output() transitionStage = new EventEmitter<{ todoId: string; stageId: string }>();
  @Output() toggleStatus = new EventEmitter<ITodoItem>();
  @Output() edit = new EventEmitter<ITodoItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() openNewTask = new EventEmitter<{ stageId?: string }>();
  @Output() addStage = new EventEmitter<void>();
  @Output() editStage = new EventEmitter<IProjectStage>();
  @Output() deleteStage = new EventEmitter<IProjectStage>();

  get isDynamicStages(): boolean {
    return Array.isArray(this.stages) && this.stages.length > 0;
  }

  getCardsForStage(stageId: string): ITodoItem[] {
    return this.projectCards.filter((card) => card.stageId === stageId);
  }

  isTransitionAllowed(sourceStageId: string | undefined, targetStageId: string): boolean {
    if (!sourceStageId || sourceStageId === targetStageId) return true;
    const sourceStage = this.stages.find((s) => s.id === sourceStageId);
    const targetStage = this.stages.find((s) => s.id === targetStageId);
    if (!sourceStage || !targetStage) return true;

    // Backward transitions are always allowed
    if (targetStage.order < sourceStage.order) {
      return true;
    }

    // Forward transitions:
    if (Array.isArray(sourceStage.allowedTransitions)) {
      return sourceStage.allowedTransitions.includes(targetStage.id);
    }

    // Default forward fallback: next stage in sequence
    return targetStage.order === sourceStage.order + 1;
  }

  canEnterStagePredicate(targetStageId: string) {
    return (drag: CdkDrag<ITodoItem>, _drop: CdkDropList) => {
      const todo = drag.data;
      if (!todo) return true;
      return this.isTransitionAllowed(todo.stageId, targetStageId);
    };
  }

  onDrop(event: CdkDragDrop<ITodoItem[]>, targetStageId: string): void {
    if (!this.canMoveCards) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const movedItem = event.previousContainer.data[event.previousIndex];
      if (movedItem && !this.isTransitionAllowed(movedItem.stageId, targetStageId)) {
        return;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (movedItem) {
        this.transitionStage.emit({
          todoId: movedItem.id,
          stageId: targetStageId,
        });
      }
    }
  }

  onMoveToStage(todo: ITodoItem, targetStageId: string): void {
    if (!this.canMoveCards || todo.stageId === targetStageId) return;
    if (!this.isTransitionAllowed(todo.stageId, targetStageId)) return;
    this.transitionStage.emit({ todoId: todo.id, stageId: targetStageId });
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

  isOverdue(todo: ITodoItem): boolean {
    return Boolean(
      todo.dueDate && todo.dueDate < this.todayStr && todo.status !== 'completed'
    );
  }
}
