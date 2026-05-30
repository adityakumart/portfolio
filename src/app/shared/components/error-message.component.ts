import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-error-message',
  standalone: true,
  template: `{{ errorMessage }}`
})
export class ErrorMessageComponent {
  /** The reactive form control to check for errors */
  @Input({ required: true }) control!: AbstractControl | null;
  
  /** Name of the field to display in default error messages */
  @Input() fieldName: string = 'Field';
  
  /** Optional overrides for specific error keys */
  @Input() customMessages?: Record<string, string>;

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors) {
      return null;
    }

    const errors = this.control.errors;
    
    // 1. Check if a custom message override is provided
    if (this.customMessages) {
      for (const errorKey of Object.keys(errors)) {
        if (this.customMessages[errorKey]) {
          return this.customMessages[errorKey];
        }
      }
    }

    // 2. Fallback to default centralized messages
    if (errors['required']) {
      return `${this.fieldName} is required`;
    }
    if (errors['email']) {
      return 'Invalid email format';
    }
    if (errors['matStartDateInvalid']) {
      return 'Invalid start date';
    }
    if (errors['matEndDateInvalid']) {
      return 'Invalid end date';
    }
    if (errors['minlength']) {
      return `${this.fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    return 'Invalid input';
  }
}