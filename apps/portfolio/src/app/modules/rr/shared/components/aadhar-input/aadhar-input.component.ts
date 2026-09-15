import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { formatAadharVisible, maskAadhar } from '../../utils/aadhar-mask.util';

@Component({
  selector: 'rr-aadhar-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmInputImports,
    NgIconComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RRAadharInputComponent),
      multi: true,
    },
    provideIcons({ lucideEye, lucideEyeOff }),
  ],
  template: `
    <div class="relative flex items-center w-full">
      <input
        #inputRef
        hlmInput
        type="text"
        [disabled]="disabled"
        [placeholder]="placeholder"
        [value]="displayValue"
        (keydown)="onKeyDown($event)"
        (input)="onInput($event)"
        (paste)="onPaste($event)"
        (blur)="onBlur()"
        class="w-full text-sm font-mono tracking-wide pr-10 {{ customClass }}"
        autocomplete="off"
        spellcheck="false"
      />
      <button
        type="button"
        tabindex="-1"
        (click)="toggleShow()"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded focus:outline-none"
        [attr.aria-label]="
          showRaw ? 'Mask Aadhaar number' : 'Show full Aadhaar number'
        "
        [title]="showRaw ? 'Mask Aadhaar' : 'Show full Aadhaar'"
      >
        <ng-icon
          [name]="showRaw ? 'lucideEyeOff' : 'lucideEye'"
          class="text-sm block"
        ></ng-icon>
      </button>
    </div>
  `,
})
export class RRAadharInputComponent implements ControlValueAccessor {
  @ViewChild('inputRef') inputRef?: ElementRef<HTMLInputElement>;

  @Input() placeholder = 'XXXX XXXX 1234';
  @Input() customClass = '';

  disabled = false;
  showRaw = false;
  rawValue = '';
  displayValue = '';

  private onChange: (val: string) => void = () => {
    // noop
  };
  private onTouched: () => void = () => {
    // noop
  };

  writeValue(val: any): void {
    if (val === null || val === undefined) {
      this.rawValue = '';
    } else {
      this.rawValue = String(val).replace(/\D/g, '').slice(0, 12);
    }
    this.updateDisplayValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleShow(): void {
    this.showRaw = !this.showRaw;
    this.updateDisplayValue();
  }

  onBlur(): void {
    this.onTouched();
  }

  onKeyDown(event: KeyboardEvent): void {
    // Allow navigation, selection, and control keys
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Tab',
        'Enter',
        'Escape',
        'Home',
        'End',
      ].includes(event.key)
    ) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const isAllSelected =
      input.selectionStart !== null &&
      input.selectionEnd !== null &&
      input.selectionEnd - input.selectionStart >= input.value.length;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (isAllSelected) {
        this.rawValue = '';
      } else if (this.rawValue.length > 0) {
        this.rawValue = this.rawValue.slice(0, -1);
      }
      this.propagateChange();
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      if (isAllSelected) {
        this.rawValue = '';
        this.propagateChange();
      }
      return;
    }

    // Accept numeric digits 0-9
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      if (isAllSelected) {
        this.rawValue = event.key;
        this.propagateChange();
      } else if (this.rawValue.length < 12) {
        this.rawValue += event.key;
        this.propagateChange();
      }
      return;
    }

    // Prevent any other characters
    event.preventDefault();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Fallback for virtual keyboards or autofill
    const digits = input.value.replace(/\D/g, '').slice(0, 12);
    if (digits !== this.rawValue) {
      // If user typed only the last digit or inserted characters
      this.rawValue = digits;
      this.propagateChange();
    } else {
      this.updateDisplayValue();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const pastedDigits = pastedText.replace(/\D/g, '');
    if (!pastedDigits) return;

    const input = event.target as HTMLInputElement;
    const isAllSelected =
      input.selectionStart !== null &&
      input.selectionEnd !== null &&
      input.selectionEnd - input.selectionStart >= input.value.length;

    if (isAllSelected) {
      this.rawValue = pastedDigits.slice(0, 12);
    } else {
      this.rawValue = (this.rawValue + pastedDigits).slice(0, 12);
    }
    this.propagateChange();
  }

  private propagateChange(): void {
    this.onChange(this.rawValue);
    this.updateDisplayValue();
  }

  private updateDisplayValue(): void {
    if (!this.rawValue) {
      this.displayValue = '';
    } else if (this.showRaw) {
      this.displayValue = formatAadharVisible(this.rawValue);
    } else {
      this.displayValue = maskAadhar(this.rawValue);
    }

    if (this.inputRef?.nativeElement) {
      this.inputRef.nativeElement.value = this.displayValue;
    }
  }
}
