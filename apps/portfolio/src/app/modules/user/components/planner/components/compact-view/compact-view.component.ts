import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckSquare,
  lucideStickyNote,
  lucidePlus,
  lucideCheck,
  lucideTrash2,
  lucideExternalLink,
  lucideRefreshCw,
} from '@ng-icons/lucide';
import { PlannerStateService } from '../../services/planner-state.service';
import { PlatformAdapterService } from '../../services/platform-adapter.service';
import { ITodoItem, INote } from '@portfolio/shared-types';

@Component({
  selector: 'app-planner-compact-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideCheckSquare,
      lucideStickyNote,
      lucidePlus,
      lucideCheck,
      lucideTrash2,
      lucideExternalLink,
      lucideRefreshCw,
    }),
  ],
  templateUrl: './compact-view.component.html',
  styleUrls: ['./compact-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompactViewComponent {
  readonly state = inject(PlannerStateService);
  readonly platform = inject(PlatformAdapterService);

  @Output() openFullApp = new EventEmitter<void>();

  readonly activeTab = signal<'tasks' | 'notes'>('tasks');
  quickTaskInput = signal<string>('');

  // Scratchpad quick note
  scratchpadText = signal<string>('');
  private scratchpadSaveTimer: any = null;

  async submitQuickTask(): Promise<void> {
    const title = this.quickTaskInput().trim();
    if (!title) return;

    await this.state.addTodo({
      title,
      priority: 'medium',
      status: 'pending',
      dueDate: this.state.todaysDateStr(),
    });

    this.quickTaskInput.set('');
  }

  onScratchpadChange(text: string): void {
    this.scratchpadText.set(text);
    if (this.scratchpadSaveTimer) clearTimeout(this.scratchpadSaveTimer);

    // Debounce save scratchpad as a pinned Note or into local storage
    this.scratchpadSaveTimer = setTimeout(async () => {
      await this.platform.setStorageItem('planner_compact_scratchpad', text);
    }, 800);
  }

  async refreshData(): Promise<void> {
    await this.state.loadDashboard();
  }
}
