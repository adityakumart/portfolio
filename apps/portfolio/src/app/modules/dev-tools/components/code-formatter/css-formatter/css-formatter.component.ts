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
  selector: 'app-css-formatter',
  standalone: true,
  imports: [CommonModule, SharedFormatterComponent],
  template: `
    <!-- CSS Specific Smart Wrapper -->
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
export class CssFormatterComponent {
  // Configuration specific to the CSS tool
  config: FormatterConfig = {
    language: 'css',
    title: 'CSS Formatter & Validator',
    subtitle: 'Validate, beautify, sort properties, and minify stylesheets.',
    inputPlaceholder: 'Paste your raw CSS rules here...\n\ne.g., body{background:red;margin:0;} h1{color:blue;}',
    outputPlaceholder: 'Clean, formatted CSS rules will appear here...',
    showSortOption: true, // Enables alphabetical sorting of rules/properties
    sortOptionLabel: 'Sort Properties Alphabetically'
  };

  outputText = '';
  validationState: ValidationState = 'idle';
  errorMessage = '';

  constructor(private formatterService: CodeFormatterService) {}

  /**
   * Triggers CSS specific formatting options.
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
   * Invokes CSS minifier, optionally sorting properties before serialization.
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
   * Evaluates CSS brace matchups and rules layouts.
   */
  onValidate(input: string): void {
    const res = this.formatterService.validate(input, this.config.language);
    this.validationState = res.isValid ? 'valid' : 'invalid';
    this.errorMessage = res.error || '';
  }

  /**
   * Resets local CSS wrapper outputs back to their default states.
   */
  onClear(): void {
    this.outputText = '';
    this.validationState = 'idle';
    this.errorMessage = '';
  }
}
