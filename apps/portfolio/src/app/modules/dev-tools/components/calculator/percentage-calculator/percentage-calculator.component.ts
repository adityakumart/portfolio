import {
  Component,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-percentage-calculator',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
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
