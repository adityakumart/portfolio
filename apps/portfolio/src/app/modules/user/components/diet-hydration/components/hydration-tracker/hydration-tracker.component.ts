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
  lucideDroplet,
  lucidePlus,
  lucideTrash2,
  lucideClock,
  lucideCoffee,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { DietStateService } from '../../services/diet-state.service';
import { HydrationSource } from '@portfolio/shared-types';

@Component({
  selector: 'app-hydration-tracker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideDroplet,
      lucidePlus,
      lucideTrash2,
      lucideClock,
      lucideCoffee,
      lucideZap,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hydration-tracker.component.html',
  styleUrls: ['./hydration-tracker.component.scss'],
})
export class HydrationTrackerComponent {
  state = inject(DietStateService);

  customAmount = signal<number | null>(null);
  selectedSource = signal<HydrationSource>('water');

  readonly presetAmounts = [250, 500, 750];

  onQuickAdd(amount: number): void {
    this.state.quickAddWater(amount);
  }

  onCustomAdd(): void {
    const val = this.customAmount();
    if (val && val > 0) {
      this.state.quickAddWater(val);
      this.customAmount.set(null);
    }
  }

  onDeleteEntry(id: string): void {
    this.state.deleteWaterEntry(id);
  }
}
