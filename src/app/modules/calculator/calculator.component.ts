import {  Component, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorComponent {
  calculatorForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      initialValue: new FormControl('', Validators.required),
      finalValue: new FormControl('', Validators.required)
    });
  }

  showCalculated = signal(false);

  calculatedPercentage = signal(0);

  onSubmit() {
    console.log('submited values: ', this.calculatorForm.value);
    let valueToSet = 0;
    if (this.calculatorForm.value.initialValue && this.calculatorForm.value.finalValue) {
      valueToSet = (this.calculatorForm.value.finalValue - this.calculatorForm.value.initialValue) / this.calculatorForm.value.initialValue * 100;
      valueToSet = Number(valueToSet.toFixed(2));
    }
    this.calculatedPercentage.set(valueToSet);
    this.showCalculated.set(true);
  }
}
