import { 
  Component, 
  OnInit, 
  OnChanges, 
  Input, 
  Output, 
  EventEmitter, 
  SimpleChanges, 
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlignLeft,
  lucideMinimize2,
  lucideCheckCheck,
  lucideEraser,
  lucideCheckCircle,
  lucideAlertCircle,
  lucideHelpCircle,
  lucideAlertTriangle,
  lucideCopy,
} from '@ng-icons/lucide';
import { 
  FormatterConfig, 
  FormatterState, 
  ValidationState 
} from '../models/code-formatter.model';

@Component({
  selector: 'app-shared-formatter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    NgIconComponent,
    UpperCasePipe,
  ],
  providers: [
    provideIcons({
      lucideAlignLeft,
      lucideMinimize2,
      lucideCheckCheck,
      lucideEraser,
      lucideCheckCircle,
      lucideAlertCircle,
      lucideHelpCircle,
      lucideAlertTriangle,
      lucideCopy,
    }),
  ],
  templateUrl: './shared-formatter.component.html',
  styleUrls: ['./shared-formatter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedFormatterComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  @Input() config!: FormatterConfig;
  @Input() outputText = '';
  @Input() validationState: ValidationState = 'idle';
  @Input() errorMessage = '';

  @Output() format = new EventEmitter<FormatterState>();
  @Output() minify = new EventEmitter<FormatterState>();
  @Output() validate = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  form!: FormGroup;
  copySuccess = false;



  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When output updates from smart wrapper component, synchronize form value
    if (changes['outputText'] && this.form) {
      this.form.get('outputCode')?.setValue(this.outputText);
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      inputCode: ['', Validators.required],
      outputCode: [''],
      selectedIndent: ['2'], // Default to 2 spaces
      sortKeys: [false],
    });

    // Reset status badge to idle when input text changes to avoid showing outdated info
    this.form.get('inputCode')?.valueChanges.subscribe(() => {
      if (this.validationState !== 'idle') {
        this.clearValidationState();
      }
    });
  }

  /**
   * Resets local validation state internally when text is edited.
   */
  private clearValidationState(): void {
    this.validationState = 'idle';
    this.errorMessage = '';
  }

  /**
   * Emit format command to parent
   */
  onFormat(): void {
    const state: FormatterState = {
      input: this.form.get('inputCode')?.value || '',
      indent: this.form.get('selectedIndent')?.value || '2',
      sort: this.form.get('sortKeys')?.value || false,
    };
    this.format.emit(state);
  }

  /**
   * Emit minify command to parent
   */
  onMinify(): void {
    const state: FormatterState = {
      input: this.form.get('inputCode')?.value || '',
      indent: this.form.get('selectedIndent')?.value || '2',
      sort: this.form.get('sortKeys')?.value || false,
    };
    this.minify.emit(state);
  }

  /**
   * Emit validate command to parent
   */
  onValidate(): void {
    const code = this.form.get('inputCode')?.value || '';
    this.validate.emit(code);
  }

  /**
   * Clears form locally and notifies parent wrapper
   */
  onClear(): void {
    this.form.reset({
      inputCode: '',
      outputCode: '',
      selectedIndent: '2',
      sortKeys: false,
    });
    this.clearValidationState();
    this.clear.emit();
    this.showSnackBar('Cleared all fields.', 'info');
  }

  /**
   * Copies formatted output from textarea to clipboard
   */
  onCopy(): void {
    const output = this.form.get('outputCode')?.value;
    if (!output || output.trim() === '') {
      this.showSnackBar('No formatted code to copy.', 'error');
      return;
    }

    navigator.clipboard.writeText(output).then(
      () => {
        this.copySuccess = true;
        this.showSnackBar('Output copied to clipboard!', 'success');
        setTimeout(() => {
          this.copySuccess = false;
        }, 2000);
      },
      () => {
        this.showSnackBar('Failed to copy to clipboard.', 'error');
      }
    );
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  }
}
