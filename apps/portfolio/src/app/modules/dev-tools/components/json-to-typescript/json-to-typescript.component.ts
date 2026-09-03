import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { HlmSpinnerComponent } from '@spartan-ng/hel/spinner';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSparkles,
  lucideTrash2,
  lucideCheckCircle,
  lucideCopy,
  lucideDownload,
  lucideX,
} from '@ng-icons/lucide';
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
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    HlmSpinnerComponent,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideSparkles,
      lucideTrash2,
      lucideCheckCircle,
      lucideCopy,
      lucideDownload,
      lucideX,
    }),
  ],
  templateUrl: './json-to-typescript.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./json-to-typescript.component.scss'],
})
export class JsonToTypeScriptComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private jsonTransformer = inject(JsonTransformerService);

  form!: FormGroup;
  generatedInterface = '';
  isLoading = false;
  showOutput = false;
  copySuccess = false;

  private destroy$ = new Subject<void>();

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
      interfaceName: [
        'GeneratedInterface',
        [Validators.required, Validators.pattern(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/)],
      ],
    });
  }

  /**
   * Custom validator for JSON input
   * Validates that the input is valid JSON
   */
  private jsonValidator(control: AbstractControl): ValidationErrors | null {
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
        interfaceName,
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
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      },
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
      'data:text/plain;charset=utf-8,' +
        encodeURIComponent(this.generatedInterface),
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
    toast.error(message);
  }

  private showSuccessMessage(message: string): void {
    toast.success(message);
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
