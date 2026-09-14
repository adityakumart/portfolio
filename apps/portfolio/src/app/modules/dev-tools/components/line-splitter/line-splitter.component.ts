import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  effect,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorImports } from '@spartan-ng/hel/separator';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTable,
  lucideColumns2,
  lucideCopy,
  lucideTrash2,
  lucideDownload,
  lucideCheckCircle,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';

interface ProcessedLine {
  index: number;
  content: string;
}

@Component({
  selector: 'app-line-splitter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmSeparatorImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideTable,
      lucideColumns2,
      lucideCopy,
      lucideTrash2,
      lucideDownload,
      lucideCheckCircle,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './line-splitter.component.html',
  styleUrls: ['./line-splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineSplitterComponent implements OnInit {
  private fb = inject(FormBuilder);

  // Form group for reactive inputs
  form!: FormGroup;

  // Signals for state management
  inputText = signal<string>('');
  trimLines = signal<boolean>(true);
  ignoreEmpty = signal<boolean>(true);
  uniqueLines = signal<boolean>(false);
  delimiterType = signal<string>('newline');
  customDelimiter = signal<string>('');
  copiedLines = signal<{ [key: number]: boolean }>({});

  // Pagination state
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  // Computed signals for data derivation
  readonly processedLines = computed<ProcessedLine[]>(() => {
    const text = this.inputText();
    if (!text && text !== ' ') {
      return [];
    }

    // Determine the delimiter
    let delimiter = '\n';
    const type = this.delimiterType();
    if (type === 'comma') {
      delimiter = ',';
    } else if (type === 'semicolon') {
      delimiter = ';';
    } else if (type === 'space') {
      delimiter = ' ';
    } else if (type === 'custom') {
      delimiter = this.customDelimiter();
    }

    if (!delimiter) {
      delimiter = '\n'; // fallback
    }

    // Split raw text
    let lines = text.split(delimiter);

    // Trim lines if enabled
    if (this.trimLines()) {
      lines = lines.map((line) => line.trim());
    }

    // Ignore empty lines if enabled
    if (this.ignoreEmpty()) {
      lines = lines.filter((line) => line.trim().length > 0);
    }

    // Filter to unique lines if enabled
    if (this.uniqueLines()) {
      lines = [...new Set(lines)];
    }

    // Map to the formatted object array
    return lines.map((line, idx) => ({
      index: idx + 1,
      content: line,
    }));
  });

  // Analytics/Statistics derived from input/processed data
  readonly totalCount = computed(() => this.processedLines().length);
  readonly charCount = computed(() => this.inputText().length);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));

  readonly paginatedLines = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.processedLines().slice(start, start + this.pageSize());
  });

  readonly emptyCount = computed(() => {
    const text = this.inputText();
    if (!text) return 0;
    const type = this.delimiterType();
    let delimiter = '\n';
    if (type === 'comma') delimiter = ',';
    else if (type === 'semicolon') delimiter = ';';
    else if (type === 'space') delimiter = ' ';
    else if (type === 'custom') delimiter = this.customDelimiter() || '\n';

    const lines = text.split(delimiter);
    return lines.filter((line) => line.trim().length === 0).length;
  });

  readonly duplicateCount = computed(() => {
    const text = this.inputText();
    if (!text) return 0;
    const type = this.delimiterType();
    let delimiter = '\n';
    if (type === 'comma') delimiter = ',';
    else if (type === 'semicolon') delimiter = ';';
    else if (type === 'space') delimiter = ' ';
    else if (type === 'custom') delimiter = this.customDelimiter() || '\n';

    const lines = text.split(delimiter);
    return lines.length - new Set(lines).size;
  });

  constructor() {
    effect(() => {
      // Access processedLines to trigger dependency tracking
      this.processedLines();
      this.pageIndex.set(0);
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      textInput: [''],
      trim: [true],
      ignoreEmpty: [true],
      unique: [false],
      delimiter: ['newline'],
      customDelim: [''],
    });

    // Listen to changes in form and update signals
    this.form.valueChanges.subscribe((values) => {
      let text = values.textInput || '';
      const cleaned = text.replace(/[^\x20-\x7E\r\n\t]/g, '');
      if (cleaned !== text) {
        this.form.get('textInput')?.setValue(cleaned, { emitEvent: false });
        text = cleaned;
      }
      this.inputText.set(text);
      this.trimLines.set(!!values.trim);
      this.ignoreEmpty.set(!!values.ignoreEmpty);
      this.uniqueLines.set(!!values.unique);
      this.delimiterType.set(values.delimiter || 'newline');
      this.customDelimiter.set(values.customDelim || '');
    });
  }

  nextPage(): void {
    if (this.pageIndex() + 1 < this.totalPages()) {
      this.pageIndex.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.pageIndex() > 0) {
      this.pageIndex.update((p) => p - 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.pageSize.set(Number(target.value));
      this.pageIndex.set(0);
    }
  }

  sanitizeInput(event: Event): void {
    const inputEl = event.target as HTMLTextAreaElement;
    if (!inputEl) return;

    const originalValue = inputEl.value;
    const cleanedValue = originalValue.replace(/[^\x20-\x7E\r\n\t]/g, '');

    if (originalValue !== cleanedValue) {
      const selectionStart = inputEl.selectionStart;
      const selectionEnd = inputEl.selectionEnd;

      let removedBeforeCursor = 0;
      for (let i = 0; i < selectionStart; i++) {
        if (originalValue[i].match(/[^\x20-\x7E\r\n\t]/)) {
          removedBeforeCursor++;
        }
      }

      this.form.get('textInput')?.setValue(cleanedValue, { emitEvent: true });

      setTimeout(() => {
        const newCursorPos = Math.max(0, selectionStart - removedBeforeCursor);
        inputEl.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  }

  copyLine(content: string, index: number): void {
    if (!navigator.clipboard) {
      this.showErrorMessage('Clipboard API not supported in your browser.');
      return;
    }

    navigator.clipboard
      .writeText(content)
      .then(() => {
        this.copiedLines.update((current) => ({
          ...current,
          [index]: true,
        }));

        setTimeout(() => {
          this.copiedLines.update((current) => ({
            ...current,
            [index]: false,
          }));
        }, 1500);

        this.showSuccessMessage(`Line ${index} copied to clipboard`);
      })
      .catch((err) => {
        this.showErrorMessage('Failed to copy line to clipboard.');
      });
  }

  copyAllLines(): void {
    const lines = this.processedLines();
    if (lines.length === 0) return;

    const joinedText = lines.map((l) => l.content).join('\n');
    if (!navigator.clipboard) {
      this.showErrorMessage('Clipboard API not supported in your browser.');
      return;
    }

    navigator.clipboard
      .writeText(joinedText)
      .then(() => {
        this.showSuccessMessage(
          `All ${lines.length} lines copied to clipboard`,
        );
      })
      .catch(() => {
        this.showErrorMessage('Failed to copy lines.');
      });
  }

  clearInput(): void {
    this.form.get('textInput')?.setValue('');
    this.inputText.set('');
    this.showSuccessMessage('Input cleared');
  }

  downloadAsCsv(): void {
    const lines = this.processedLines();
    if (lines.length === 0) return;

    let csvContent = 'Line Number,Content\n';
    lines.forEach((l) => {
      const escapedContent = `"${l.content.replace(/"/g, '""')}"`;
      csvContent += `${l.index},${escapedContent}\n`;
    });

    this.triggerDownload(csvContent, 'split-lines.csv', 'text/csv');
  }

  downloadAsTxt(): void {
    const lines = this.processedLines();
    if (lines.length === 0) return;

    const txtContent = lines.map((l) => l.content).join('\n');
    this.triggerDownload(txtContent, 'split-lines.txt', 'text/plain');
  }

  private triggerDownload(
    content: string,
    filename: string,
    mimeType: string,
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.showSuccessMessage(`Downloaded as ${filename}`);
  }

  private showSuccessMessage(message: string): void {
    toast.success(message);
  }

  private showErrorMessage(message: string): void {
    toast.error(message);
  }
}
