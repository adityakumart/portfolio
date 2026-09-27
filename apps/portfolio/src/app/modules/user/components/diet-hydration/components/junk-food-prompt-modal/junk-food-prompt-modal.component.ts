import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheckCircle2,
  lucideAlertCircle,
  lucideX,
  lucideSparkles,
  lucideCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { DietStateService } from '../../services/diet-state.service';
import { CravingTrigger, ILogJunkFoodDto } from '@portfolio/shared-types';

interface CravingOption {
  trigger: CravingTrigger;
  label: string;
  emoji: string;
}

@Component({
  selector: 'app-junk-food-prompt-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle2,
      lucideAlertCircle,
      lucideX,
      lucideSparkles,
      lucideCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './junk-food-prompt-modal.component.html',
  styleUrls: ['./junk-food-prompt-modal.component.scss'],
})
export class JunkFoodPromptModalComponent {
  state = inject(DietStateService);

  consumed = signal<boolean | null>(null);
  itemsDescription = signal<string>('');
  selectedTrigger = signal<CravingTrigger | null>(null);

  readonly cravingOptions: CravingOption[] = [
    { trigger: 'stress', label: 'Stress / Emotional', emoji: '😣' },
    { trigger: 'social', label: 'Social Event / Friends', emoji: '🎉' },
    { trigger: 'late_night', label: 'Late Night Craving', emoji: '🌙' },
    { trigger: 'boredom', label: 'Boredom', emoji: '🥱' },
    { trigger: 'routine', label: 'Habit / Routine', emoji: '⏰' },
    { trigger: 'other', label: 'Other', emoji: '💭' },
  ];

  constructor() {
    const existing = this.state.dashboardData()?.junkFood;
    if (existing && existing.recorded) {
      this.consumed.set(existing.consumed);
      this.itemsDescription.set(existing.itemsDescription || '');
      this.selectedTrigger.set(existing.cravingTrigger || null);
    }
  }

  setConsumed(value: boolean): void {
    this.consumed.set(value);
    if (!value) {
      this.itemsDescription.set('');
      this.selectedTrigger.set(null);
    }
  }

  setTrigger(trigger: CravingTrigger): void {
    this.selectedTrigger.set(trigger);
  }

  async onSave(): Promise<void> {
    if (this.consumed() === null) return;

    const dto: ILogJunkFoodDto = {
      date: this.state.selectedDate(),
      consumed: !!this.consumed(),
      itemsDescription: this.consumed()
        ? this.itemsDescription().trim()
        : undefined,
      cravingTrigger: this.consumed()
        ? this.selectedTrigger() || undefined
        : undefined,
    };

    await this.state.saveJunkFoodReflection(dto);
  }

  close(): void {
    this.state.isJunkPromptOpen.set(false);
  }
}
