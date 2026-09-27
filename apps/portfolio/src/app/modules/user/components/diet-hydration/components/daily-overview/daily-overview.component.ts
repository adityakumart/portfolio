import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideDroplet,
  lucideFlame,
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideSparkles,
  lucidePlus,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmProgressImports } from '@spartan-ng/hel/progress';
import { DietStateService } from '../../services/diet-state.service';

@Component({
  selector: 'app-daily-overview',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmProgressImports,
  ],
  providers: [
    provideIcons({
      lucideCalendar,
      lucideChevronLeft,
      lucideChevronRight,
      lucideDroplet,
      lucideFlame,
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideSparkles,
      lucidePlus,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './daily-overview.component.html',
  styleUrls: ['./daily-overview.component.scss'],
})
export class DailyOverviewComponent {
  state = inject(DietStateService);

  get isToday(): boolean {
    const today = new Date().toISOString().slice(0, 10);
    return this.state.selectedDate() === today;
  }

  get formattedDate(): string {
    const d = new Date(this.state.selectedDate() + 'T00:00:00');
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  shiftDate(days: number): void {
    const curr = new Date(this.state.selectedDate() + 'T00:00:00');
    curr.setDate(curr.getDate() + days);
    this.state.setDate(curr.toISOString().slice(0, 10));
  }

  jumpToToday(): void {
    this.state.setDate(new Date().toISOString().slice(0, 10));
  }

  onQuickAddWater(): void {
    this.state.quickAddWater();
  }

  openJunkPrompt(): void {
    this.state.isJunkPromptOpen.set(true);
  }
}
