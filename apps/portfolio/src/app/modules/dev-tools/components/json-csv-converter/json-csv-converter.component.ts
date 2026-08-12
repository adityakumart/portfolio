import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConversionMetadata, Delimiter, csvToJson, jsonToCsv } from './json-csv-converter.utils';

@Component({
  selector: 'app-json-csv-converter',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './json-csv-converter.component.html',
  styleUrl: './json-csv-converter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonCsvConverterComponent {
  private _snackBar = inject(MatSnackBar);

  // --- State Management using Angular Signals ---
  inputText = signal<string>('');
  outputText = signal<string>('');
  selectedDelimiter = signal<Delimiter>(',');
  error = signal<string | null>(null);
  metadata = signal<ConversionMetadata | null>(null);

  delimiters: { value: Delimiter; viewValue: string }[] = [
    { value: ',', viewValue: 'Comma (,)' },
    { value: ';', viewValue: 'Semicolon (;)' },
    { value: '\t', viewValue: 'Tab (\\t)' },
  ];



  // --- Action Handlers ---

  handleJsonToCsv(): void {
    this.resetState();
    try {
      const [csv, meta] = jsonToCsv(this.inputText(), this.selectedDelimiter());
      this.outputText.set(csv);
      this.metadata.set(meta);
    } catch (e) {
      this.handleError(e, 'Invalid JSON input.');
    }
  }

  handleCsvToJson(): void {
    this.resetState();
    try {
      const [json, meta] = csvToJson(this.inputText(), this.selectedDelimiter());
      this.outputText.set(json);
      this.metadata.set(meta);
    } catch (e) {
      this.handleError(e, 'Invalid CSV format.');
    }
  }

  async copyJson(): Promise<void> {
    await this.copyToClipboard(this.outputText(), 'JSON');
  }

  async copyCsv(): Promise<void> {
    await this.copyToClipboard(this.outputText(), 'CSV');
  }

  clear(): void {
    this.inputText.set('');
    this.resetState();
  }

  // --- Private Helper Methods ---

  /**
   * Resets output, error, and metadata state before a new conversion.
   */
  private resetState(): void {
    this.outputText.set('');
    this.error.set(null);
    this.metadata.set(null);
  }

  /**
   * Sets the error signal to display a message in the UI.
   * @param error The caught error object.
   * @param friendlyMessage A user-friendly message to display.
   */
  private handleError(error: unknown, friendlyMessage: string): void {
    this.error.set(friendlyMessage);
    console.error('Conversion Error:', error);
  }

  /**
   * Uses the Clipboard API to copy text and shows a confirmation snackbar.
   * @param text The text to copy.
   * @param type The type of content being copied (for the message).
   */
  private async copyToClipboard(text: string, type: 'JSON' | 'CSV'): Promise<void> {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this._snackBar.open(`Copied ${type} to clipboard!`, 'Close', { duration: 2000 });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      this._snackBar.open('Failed to copy to clipboard.', 'Close', { duration: 3000 });
    }
  }
}