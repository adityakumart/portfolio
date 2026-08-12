import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { JsonFormatterService } from './services/json-formatter.service';

export type ValidationState = 'idle' | 'valid' | 'invalid';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './json-formatter.component.html',
  styleUrls: ['./json-formatter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonFormatterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private formatterService = inject(JsonFormatterService);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  validationState: ValidationState = 'idle';
  errorMessage = '';
  copySuccess = false;
  parsedType: 'array' | 'object' | null = null;

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initializes the form with fields for input, output, and configuration.
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      inputJson: ['', Validators.required],
      outputJson: [''],
      selectedIndent: ['2'], // '2' | '4' | 'tab'
      sortKeys: [false],
    });

    // Reset validation state on input change to prevent outdated validation status
    this.form.get('inputJson')?.valueChanges.subscribe(() => {
      this.validationState = 'idle';
      this.errorMessage = '';
      this.parsedType = null;
    });
  }

  /**
   * Validates the input JSON. Updates validation state and displays a snackbar.
   */
  onValidate(): void {
    const input = this.form.get('inputJson')?.value;
    if (!input || input.trim() === '') {
      this.showSnackBar('Please enter JSON input to validate.', 'error');
      return;
    }

    const validation = this.formatterService.validate(input);
    if (validation.isValid) {
      this.validationState = 'valid';
      this.errorMessage = '';
      this.parsedType = validation.type || null;
      this.showSnackBar(`Valid JSON ${validation.type}!`, 'success');
    } else {
      this.validationState = 'invalid';
      this.errorMessage = validation.error || 'Syntax Error';
      this.parsedType = null;
      this.showSnackBar('Invalid JSON. See error details.', 'error');
    }
  }

  /**
   * Formats the input JSON with indentations and optional sorting.
   */
  onFormat(): void {
    const input = this.form.get('inputJson')?.value;
    if (!input || input.trim() === '') {
      this.showSnackBar('Please enter JSON input to format.', 'error');
      return;
    }

    const indent = this.form.get('selectedIndent')?.value;
    const sort = this.form.get('sortKeys')?.value;

    const res = this.formatterService.format(input, indent, sort);
    if (res.success) {
      this.form.patchValue({ outputJson: res.result });
      this.validationState = 'valid';
      this.errorMessage = '';
      const validation = this.formatterService.validate(input);
      this.parsedType = validation.type || null;
      this.showSnackBar('JSON formatted successfully.', 'success');
    } else {
      this.validationState = 'invalid';
      this.errorMessage = res.error || 'Formatting failed.';
      this.parsedType = null;
      this.showSnackBar('Formatting failed. Check syntax.', 'error');
    }
  }

  /**
   * Minifies the input JSON by stripping all whitespace.
   */
  onMinify(): void {
    const input = this.form.get('inputJson')?.value;
    if (!input || input.trim() === '') {
      this.showSnackBar('Please enter JSON input to minify.', 'error');
      return;
    }

    const sort = this.form.get('sortKeys')?.value;

    const res = this.formatterService.minify(input, sort);
    if (res.success) {
      this.form.patchValue({ outputJson: res.result });
      this.validationState = 'valid';
      this.errorMessage = '';
      const validation = this.formatterService.validate(input);
      this.parsedType = validation.type || null;
      this.showSnackBar('JSON minified successfully.', 'success');
    } else {
      this.validationState = 'invalid';
      this.errorMessage = res.error || 'Minification failed.';
      this.parsedType = null;
      this.showSnackBar('Minification failed. Check syntax.', 'error');
    }
  }

  /**
   * Resets the entire form and validation state.
   */
  onClear(): void {
    this.form.reset({
      inputJson: '',
      outputJson: '',
      selectedIndent: '2',
      sortKeys: false,
    });
    this.validationState = 'idle';
    this.errorMessage = '';
    this.parsedType = null;
    this.showSnackBar('Cleared all fields.', 'info');
  }

  /**
   * Copies the output JSON to the clipboard.
   */
  onCopy(): void {
    const output = this.form.get('outputJson')?.value;
    if (!output || output.trim() === '') {
      this.showSnackBar('No formatted JSON output to copy.', 'error');
      return;
    }

    navigator.clipboard.writeText(output).then(
      () => {
        this.copySuccess = true;
        this.showSnackBar('Copied output to clipboard!', 'success');
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      },
      () => {
        this.showSnackBar('Failed to copy to clipboard.', 'error');
      }
    );
  }

  /**
   * Helper to display snackbar alerts.
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass =
      type === 'success'
        ? 'success-snackbar'
        : type === 'error'
        ? 'error-snackbar'
        : 'info-snackbar';

    this.snackBar.open(message, 'Close', {
      duration: 3500,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }
}
