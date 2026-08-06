import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedFormatterComponent } from '../shared-formatter/shared-formatter.component';
import { CodeFormatterService } from '../services/code-formatter.service';
import { 
  FormatterConfig, 
  FormatterState, 
  ValidationState 
} from '../models/code-formatter.model';

@Component({
  selector: 'app-html-formatter',
  standalone: true,
  imports: [CommonModule, SharedFormatterComponent],
  template: `
    <!-- HTML Specific Smart Wrapper -->
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
export class HtmlFormatterComponent {
  // Configuration specific to the HTML tool
  config: FormatterConfig = {
    language: 'html',
    title: 'HTML Formatter & Validator',
    subtitle: 'Beautify, validate, and minify HTML markup structure.',
    inputPlaceholder: 'Paste your raw HTML string here...\n\ne.g., <div><h1>Hello</h1><p>World</p></div>',
    outputPlaceholder: 'Clean, formatted HTML markup output will appear here...',
    showSortOption: false, // HTML parsing does not support property sorting
    sortOptionLabel: ''
  };

  outputText = '';
  validationState: ValidationState = 'idle';
  errorMessage = '';

  constructor(private formatterService: CodeFormatterService) {}

  /**
   * Triggers the formatting algorithm via the service and updates view bindings.
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
      
      // Auto-validate formatted output for confirmation
      const validation = this.formatterService.validate(state.input, this.config.language);
      this.validationState = validation.isValid ? 'valid' : 'invalid';
      this.errorMessage = validation.error || '';
    } else {
      this.validationState = 'invalid';
      this.errorMessage = res.error || 'Formatting failed.';
    }
  }

  /**
   * Invokes HTML minification: strips spacing and comments.
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
   * Evaluates the tags structure to find mismatch elements.
   */
  onValidate(input: string): void {
    const res = this.formatterService.validate(input, this.config.language);
    this.validationState = res.isValid ? 'valid' : 'invalid';
    this.errorMessage = res.error || '';
  }

  /**
   * Resets local smart wrapper outputs back to their default states.
   */
  onClear(): void {
    this.outputText = '';
    this.validationState = 'idle';
    this.errorMessage = '';
  }
}
