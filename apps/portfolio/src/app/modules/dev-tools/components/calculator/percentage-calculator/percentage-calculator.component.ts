import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-percentage-calculator',
  standalone: true,
  imports: [
    FormsModule,
    HlmCardImports,
    HlmInputImports,
  ],
  templateUrl: './percentage-calculator.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './percentage-calculator.component.scss',
})
export class PercentageCalculatorComponent {
  initialValue = signal<number>(0);
  finalValue = signal<number>(0);

  percentageIncrease = computed(() => {
    const initial = this.initialValue();
    const final = this.finalValue();

    if (!initial || !final) {
      return 0;
    }

    const increase = final - initial;
    const result = (increase / initial) * 100;

    // Return rounded to two decimal places
    return Math.round(result * 100) / 100;
  });
}
