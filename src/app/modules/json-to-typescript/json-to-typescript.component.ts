import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { JsonTransformerService } from './services/json-transformer.service';

/**
 * Component for converting JSON to TypeScript Interfaces
 * Provides a user-friendly interface for JSON validation and interface generation
 */
@Component({
  selector: 'app-json-to-typescript',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './json-to-typescript.component.html',
  styleUrls: ['./json-to-typescript.component.scss']
})
export class JsonToTypeScriptComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  generatedInterface: string = '';
  isLoading: boolean = false;
  showOutput: boolean = false;
  copySuccess: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private jsonTransformer: JsonTransformerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the reactive form with validation
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      jsonInput: ['', [Validators.required, this.jsonValidator.bind(this)]],
      interfaceName: ['GeneratedInterface', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)
      ]]
    });
  }

  /**
   * Custom validator for JSON input
   * Validates that the input is valid JSON
   */
  private jsonValidator(control: any): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    if (!this.jsonTransformer.isValidJson(control.value)) {
      return { invalidJson: true };
    }

    return null;
  }

  /**
   * Generates TypeScript interface from JSON input
   */
  generateInterface(): void {
    if (this.form.invalid) {
      this.showErrorMessage('Please enter valid JSON');
      return;
    }

    this.isLoading = true;
    const jsonInput = this.form.get('jsonInput')?.value;
    const interfaceName = this.form.get('interfaceName')?.value;

    try {
      const result = this.jsonTransformer.transformJsonToInterface(
        jsonInput,
        interfaceName
      );

      if (result.success) {
        this.generatedInterface = result.interface;
        this.showOutput = true;
        this.showSuccessMessage('Interface generated successfully!');
      } else {
        this.showErrorMessage(result.error || 'Failed to generate interface');
      }
    } catch (error) {
      this.showErrorMessage(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Clears the input form
   */
  clearInput(): void {
    this.form.reset({ interfaceName: 'GeneratedInterface' });
    this.generatedInterface = '';
    this.showOutput = false;
    this.copySuccess = false;
  }

  /**
   * Copies the generated interface to clipboard
   */
  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedInterface).then(
      () => {
        this.copySuccess = true;
        this.showSuccessMessage('Copied to clipboard!');
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      },
      () => {
        this.showErrorMessage('Failed to copy to clipboard');
      }
    );
  }

  /**
   * Downloads the generated interface as a TypeScript file
   */
  downloadInterface(): void {
    const element = document.createElement('a');
    const interfaceName = this.form.get('interfaceName')?.value;
    const filename = `${interfaceName}.ts`;

    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(this.generatedInterface)
    );
    element.setAttribute('download', filename);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    this.showSuccessMessage(`Downloaded as ${filename}`);
  }

  /**
   * Displays an error message via snackbar
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Displays a success message via snackbar
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Getter for form controls
   */
  get jsonInput() {
    return this.form.get('jsonInput');
  }

  get interfaceName() {
    return this.form.get('interfaceName');
  }
}
