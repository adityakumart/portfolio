import { Component, inject } from '@angular/core';
import { SharedFormatterComponent } from '../shared-formatter/shared-formatter.component';
import { CodeFormatterService } from '../services/code-formatter.service';
import { 
  FormatterConfig, 
  FormatterState, 
  ValidationState 
} from '../models/code-formatter.model';

@Component({
  selector: 'app-js-formatter',
  standalone: true,
  imports: [SharedFormatterComponent],
  template: `
    <!-- JavaScript Specific Smart Wrapper -->
    <app-shared-formatter
      [config]="config"
      [outputText]="outputText"
      [validationState]="validationState"
      [errorMessage]="errorMessage"
      (format)="onFormat($event)"
      (minify)="onMinify($event)"
      (validate)="onValidate($event)"
      (clear)="onClear()"
    ></app-shared-formatter>
  `
})
export class JsFormatterComponent {
  // Configuration specific to the JavaScript tool
  config: FormatterConfig = {
    language: 'javascript',
    title: 'JavaScript Formatter & Validator',
    subtitle: 'Verify, format syntax, and strip comments/newlines on JS snippets.',
    inputPlaceholder: 'Paste your raw JavaScript here...\n\ne.g., function hello(name){console.log("hello "+name);}',
    outputPlaceholder: 'Clean, formatted JavaScript code will appear here...',
    showSortOption: false, // JS sorting keys is not enabled out-of-the-box
    sortOptionLabel: ''
  };

  private formatterService = inject(CodeFormatterService);

  outputText = '';
  validationState: ValidationState = 'idle';
  errorMessage = '';

  /**
   * Invokes the formatting process.
   * NOTE: Future formatting algorithms (e.g. Prettier, Babel-generator) 
   * should be injected directly in CodeFormatterService.format() method.
   */
  onFormat(state: FormatterState): void {
    const res = this.formatterService.format(
      state.input, 
      this.config.language, 
      state.indent, 
      state.sort
    );

    if (res.success) {
      this.outputText = res.result;
      
      const validation = this.formatterService.validate(state.input, this.config.language);
      this.validationState = validation.isValid ? 'valid' : 'invalid';
      this.errorMessage = validation.error || '';
    } else {
      this.validationState = 'invalid';
      this.errorMessage = res.error || 'Formatting failed.';
    }
  }

  /**
   * Invokes the minifier.
   * NOTE: Future compression algorithms (e.g. Terser, UglifyJS)
   * can be integrated within CodeFormatterService.minify().
   */
  onMinify(state: FormatterState): void {
    const res = this.formatterService.minify(state.input, this.config.language, state.sort);
    if (res.success) {
      this.outputText = res.result;
      this.validationState = 'valid';
      this.errorMessage = '';
    } else {
      this.validationState = 'invalid';
      this.errorMessage = res.error || 'Minification failed.';
    }
  }

  /**
   * Evaluates JavaScript validation (matching delimiters, JS syntax parser construct check).
   * NOTE: Robust ESLint or AST validators can be added under CodeFormatterService.validate().
   */
  onValidate(input: string): void {
    const res = this.formatterService.validate(input, this.config.language);
    this.validationState = res.isValid ? 'valid' : 'invalid';
    this.errorMessage = res.error || '';
  }

  /**
   * Resets local state variables.
   */
  onClear(): void {
    this.outputText = '';
    this.validationState = 'idle';
    this.errorMessage = '';
  }
}
