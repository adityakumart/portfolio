import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-number-base-converter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './number-base-converter.component.html',
  styleUrls: ['./number-base-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberBaseConverterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private clipboard = inject(Clipboard);

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  // Signal to store the math explanation HTML string
  explanation = signal<string>('');

  // Lock flag to prevent valueChanges subscriptions from triggering circular loops
  private isUpdating = false;

  ngOnInit(): void {
    this.initializeForm();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the form controls with base-specific validators.
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      decimal: ['', [Validators.pattern(/^[0-9]*$/)]],
      binary: ['', [Validators.pattern(/^[01]*$/)]],
      octal: ['', [Validators.pattern(/^[0-7]*$/)]],
      hexadecimal: ['', [Validators.pattern(/^[0-9a-fA-F]*$/)]],
    });
  }

  /**
   * Sets up individual subscriptions to form controls for real-time reactivity.
   */
  private setupSubscriptions(): void {
    const fields = [
      { name: 'decimal', base: 10 },
      { name: 'binary', base: 2 },
      { name: 'octal', base: 8 },
      { name: 'hexadecimal', base: 16 }
    ];

    fields.forEach(field => {
      this.form.get(field.name)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(value => {
          this.onValueChange(value, field.name, field.base);
        });
    });
  }

  /**
   * Triggers when any input changes. Performs standard radix conversion
   * and patches other fields using emitEvent: false to prevent loops.
   */
  private onValueChange(value: string, sourceFieldName: string, base: number): void {
    // Return early if the change is programmatically triggered from our own patchValue
    if (this.isUpdating) {
      return;
    }

    // Reset all fields if input is empty
    if (!value || value.trim() === '') {
      this.isUpdating = true;
      this.form.reset(undefined, { emitEvent: false });
      this.explanation.set('');
      this.isUpdating = false;
      return;
    }

    const control = this.form.get(sourceFieldName);
    if (control?.invalid) {
      // Clear the other fields if the source input is invalid (e.g. invalid copy-paste)
      this.isUpdating = true;
      const patchValues: Record<string, string> = {};
      ['decimal', 'binary', 'octal', 'hexadecimal'].forEach(name => {
        if (name !== sourceFieldName) {
          patchValues[name] = '';
        }
      });
      this.form.patchValue(patchValues, { emitEvent: false });
      this.explanation.set('');
      this.isUpdating = false;
      return;
    }

    try {
      this.isUpdating = true;

      // 1. Parse the changed input into a standard Decimal (Base-10) integer
      const decimalValue = parseInt(value, base);

      if (isNaN(decimalValue)) {
        throw new Error('NaN parsed');
      }

      // 2. Convert Decimal representation into other bases using native radix toString
      const convertedValues: Record<string, string> = {
        decimal: decimalValue.toString(10),
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        hexadecimal: decimalValue.toString(16).toUpperCase(),
      };

      // 3. Patch the other fields and lock event propagation to prevent recursion
      const patchValues: Record<string, string> = {};
      ['decimal', 'binary', 'octal', 'hexadecimal'].forEach(name => {
        if (name !== sourceFieldName) {
          patchValues[name] = convertedValues[name];
        }
      });
      this.form.patchValue(patchValues, { emitEvent: false });

      // 4. Generate dynamic mathematical conversion explanation
      this.generateExplanation(value, sourceFieldName, base, decimalValue, convertedValues);

      this.isUpdating = false;
    } catch {
      // Gracefully clear conversion outputs on parsing failures
      const patchValues: Record<string, string> = {};
      ['decimal', 'binary', 'octal', 'hexadecimal'].forEach(name => {
        if (name !== sourceFieldName) {
          patchValues[name] = '';
        }
      });
      this.form.patchValue(patchValues, { emitEvent: false });
      this.explanation.set('');
      this.isUpdating = false;
    }
  }

  /**
   * Filters input keypresses to prevent typing invalid characters.
   */
  onKeyDown(event: KeyboardEvent, base: number): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ];

    // Allow command modifiers (copy, paste, etc.)
    if (
      allowedKeys.includes(event.key) ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }

    let regex: RegExp;
    if (base === 2) {
      regex = /^[01]$/;
    } else if (base === 8) {
      regex = /^[0-7]$/;
    } else if (base === 10) {
      regex = /^[0-9]$/;
    } else if (base === 16) {
      regex = /^[0-9a-fA-F]$/;
    } else {
      return;
    }

    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Dynamically formats mathematical conversion formulas for presentation in UI.
   */
  private generateExplanation(
    rawValue: string,
    sourceFieldName: string,
    sourceBase: number,
    decimalValue: number,
    converted: Record<string, string>
  ): void {
    const sourceLabel = sourceFieldName.charAt(0).toUpperCase() + sourceFieldName.slice(1);

    // Part A: Polynomial expansion mapping input radix back to decimal representation
    let baseToDecimalStep = '';
    if (sourceBase === 10) {
      baseToDecimalStep = `
        <div class="step-card">
          <h3>Step 1: Convert ${sourceLabel} (Base 10) to Decimal</h3>
          <p>The input value is already in <strong>Decimal (Base 10)</strong>, so no expansion is needed. Base value = <code>${decimalValue}</code>.</p>
        </div>
      `;
    } else {
      const cleanVal = rawValue.toUpperCase().trim();
      const formulaParts: string[] = [];
      const mathParts: string[] = [];
      let totalSum = 0;

      for (let i = 0; i < cleanVal.length; i++) {
        const char = cleanVal.charAt(i);
        const digitVal = parseInt(char, sourceBase);
        const power = cleanVal.length - 1 - i;

        formulaParts.push(`(${char} &times; ${sourceBase}<sup>${power}</sup>)`);
        mathParts.push(`(${digitVal} &times; ${Math.pow(sourceBase, power)})`);
        totalSum += digitVal * Math.pow(sourceBase, power);
      }

      baseToDecimalStep = `
        <div class="step-card">
          <h3>Step 1: Convert ${sourceLabel} (Base ${sourceBase}) to Decimal (Base 10)</h3>
          <p>We use polynomial expansion. Each digit is multiplied by its positional weight (the base raised to the index power, starting from 0 on the right):</p>
          <div class="math-block">
            <div class="math-line"><code>${cleanVal}<sub>${sourceBase}</sub> = ${formulaParts.join(' + ')}</code></div>
            <div class="math-line"><code>= ${mathParts.join(' + ')}</code></div>
            <div class="math-line"><code>= ${totalSum}<sub>10</sub></code></div>
          </div>
        </div>
      `;
    }

    // Part B: Convert decimal representation to target systems via successive division
    const targets = [
      { name: 'binary', base: 2, label: 'Binary' },
      { name: 'octal', base: 8, label: 'Octal' },
      { name: 'hexadecimal', base: 16, label: 'Hexadecimal' }
    ].filter(t => t.base !== sourceBase);

    let decimalToTargetSteps = '';
    targets.forEach(target => {
      let tempDec = decimalValue;
      const divisionRows: string[] = [];

      if (tempDec === 0) {
        divisionRows.push(`<tr><td><code>0 &divide; ${target.base}</code></td><td><code>0</code></td><td><code>0</code></td></tr>`);
      } else {
        while (tempDec > 0) {
          const quotient = Math.floor(tempDec / target.base);
          const remainder = tempDec % target.base;
          let remainderRep = remainder.toString();
          if (target.base === 16 && remainder >= 10) {
            remainderRep = `${remainder} (${remainder.toString(16).toUpperCase()})`;
          }

          divisionRows.push(`
            <tr>
              <td><code>${tempDec} &divide; ${target.base}</code></td>
              <td><code>${quotient}</code></td>
              <td class="highlight-remainder"><code>${remainderRep}</code></td>
            </tr>
          `);
          tempDec = quotient;
        }
      }

      decimalToTargetSteps += `
        <div class="target-step">
          <h4>Convert Decimal ${decimalValue} to ${target.label} (Base ${target.base})</h4>
          <p>Divide the decimal value successively by target radix <strong>${target.base}</strong> and capture the remainders. Reading the remainders from <strong>bottom to top</strong> yields the result:</p>
          <table class="math-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Quotient</th>
                <th>Remainder</th>
              </tr>
            </thead>
            <tbody>
              ${divisionRows.join('')}
            </tbody>
          </table>
          <p class="math-result">Result: <code>${converted[target.name]}<sub>${target.base}</sub></code></p>
        </div>
      `;
    });

    const finalHtml = `
      <div class="explanation-flow">
        ${baseToDecimalStep}
        <div class="steps-divider"></div>
        <div class="step-card">
          <h3>Step 2: Convert Decimal to Target Bases</h3>
          <div class="targets-container">
            ${decimalToTargetSteps}
          </div>
        </div>
      </div>
    `;

    this.explanation.set(finalHtml);
  }

  /**
   * Resets the entire form.
   */
  onClear(): void {
    this.isUpdating = true;
    this.form.reset({
      decimal: '',
      binary: '',
      octal: '',
      hexadecimal: ''
    });
    this.explanation.set('');
    this.isUpdating = false;
    this.showSnackBar('Cleared all fields', 'info');
  }

  /**
   * Copies the contents of a control to the system clipboard.
   */
  copyField(fieldName: string): void {
    const text = this.form.get(fieldName)?.value;
    if (!text) {
      this.showSnackBar('No value to copy', 'error');
      return;
    }

    if (this.clipboard.copy(text)) {
      this.showSnackBar(`Copied ${fieldName} value!`, 'success');
    } else {
      this.showSnackBar('Failed to copy', 'error');
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass =
      type === 'success'
        ? 'success-snackbar'
        : type === 'error'
        ? 'error-snackbar'
        : 'info-snackbar';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }
}
