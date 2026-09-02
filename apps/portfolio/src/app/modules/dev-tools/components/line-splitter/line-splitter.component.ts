import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTable,
  lucideColumns2,
  lucideCopy,
  lucideTrash2,
  lucideDownload,
  lucideCheckCircle,
} from '@ng-icons/lucide';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

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
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    NgIconComponent,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
  ],
  providers: [
    provideIcons({
      lucideTable,
      lucideColumns2,
      lucideCopy,
      lucideTrash2,
      lucideDownload,
      lucideCheckCircle,
    }),
  ],
  templateUrl: './line-splitter.component.html',
  styleUrls: ['./line-splitter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineSplitterComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

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

  // Displayed columns for the mat-table
  displayedColumns: string[] = ['index', 'content', 'actions'];
  dataSource = new MatTableDataSource<ProcessedLine>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
    // Automatically update table source data when processedLines updates
    effect(() => {
      this.dataSource.data = this.processedLines();
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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Sanitizes input to only allow standard keyboard keys (printable ASCII and whitespace)
   */
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

      // Restore cursor position on the next tick to ensure DOM is updated
      setTimeout(() => {
        inputEl.selectionStart = selectionStart - removedBeforeCursor;
        inputEl.selectionEnd = selectionEnd - removedBeforeCursor;
      });
    }
  }

  /**
   * Copies a single line content to clipboard
   */
  copyLine(content: string, index: number): void {
    navigator.clipboard.writeText(content).then(
      () => {
        this.copiedLines.update((state) => ({ ...state, [index]: true }));
        this.showSuccessMessage(`Copied line #${index}`);
        setTimeout(() => {
          this.copiedLines.update((state) => {
            const newState = { ...state };
            delete newState[index];
            return newState;
          });
        }, 2000);
      },
      () => {
        this.showErrorMessage(`Failed to copy line #${index}`);
      },
    );
  }

  /**
   * Copies all processed lines joined by the active delimiter to clipboard
   */
  copyAllLines(): void {
    const lines = this.processedLines().map((l) => l.content);
    if (lines.length === 0) {
      this.showErrorMessage('No lines to copy');
      return;
    }

    let delimiter = '\n';
    const type = this.delimiterType();
    if (type === 'comma') delimiter = ',';
    else if (type === 'semicolon') delimiter = ';';
    else if (type === 'space') delimiter = ' ';
    else if (type === 'custom') delimiter = this.customDelimiter() || '\n';

    const outputText = lines.join(delimiter);

    navigator.clipboard.writeText(outputText).then(
      () => {
        this.showSuccessMessage('Copied all lines to clipboard!');
      },
      () => {
        this.showErrorMessage('Failed to copy lines');
      },
    );
  }

  /**
   * Resets input fields and options to default
   */
  clearInput(): void {
    this.form.patchValue({
      textInput: '',
      trim: true,
      ignoreEmpty: true,
      unique: false,
      delimiter: 'newline',
      customDelim: '',
    });
    this.showSuccessMessage('Cleared input and settings');
  }

  /**
   * Downloads the processed lines as a .txt file
   */
  downloadAsTxt(): void {
    const lines = this.processedLines().map((l) => l.content);
    if (lines.length === 0) {
      this.showErrorMessage('No content to download');
      return;
    }

    let delimiter = '\n';
    const type = this.delimiterType();
    if (type === 'comma') delimiter = ',';
    else if (type === 'semicolon') delimiter = ';';
    else if (type === 'space') delimiter = ' ';
    else if (type === 'custom') delimiter = this.customDelimiter() || '\n';

    const outputText = lines.join(delimiter);
    this.triggerDownload(outputText, 'split-lines.txt', 'text/plain');
  }

  /**
   * Downloads the processed lines as a .csv file
   */
  downloadAsCsv(): void {
    const lines = this.processedLines();
    if (lines.length === 0) {
      this.showErrorMessage('No content to download');
      return;
    }

    // Generate CSV contents escaping quotes
    let csvContent = 'Line Number,Content\n';
    lines.forEach((line) => {
      const escapedContent = `"${line.content.replace(/"/g, '""')}"`;
      csvContent += `${line.index},${escapedContent}\n`;
    });

    this.triggerDownload(csvContent, 'split-lines.csv', 'text/csv');
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
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar'],
    });
  }
}
