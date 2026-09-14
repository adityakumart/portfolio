import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { toast } from '@spartan-ng/hel/sonner';
import { ConversionMetadata, Delimiter, csvToJson, jsonToCsv } from './json-csv-converter.utils';

@Component({
  selector: 'app-json-csv-converter',
  standalone: true,
  imports: [
    FormsModule,
    HlmInputImports,
    HlmButtonImports,
  ],
  templateUrl: './json-csv-converter.component.html',
  styleUrl: './json-csv-converter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonCsvConverterComponent {
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
      this.handleError(e, 'Invalid CSV input.');
    }
  }

  copyJson(): void {
    this.copyToClipboard(this.outputText(), 'JSON');
  }

  copyCsv(): void {
    this.copyToClipboard(this.outputText(), 'CSV');
  }

  clear(): void {
    this.inputText.set('');
    this.resetState();
  }

  // --- Private Helper Methods ---

  private resetState(): void {
    this.outputText.set('');
    this.error.set(null);
    this.metadata.set(null);
  }

  private handleError(error: unknown, friendlyMessage: string): void {
    this.error.set(friendlyMessage);
    console.error('Conversion Error:', error);
  }

  private async copyToClipboard(text: string, type: 'JSON' | 'CSV'): Promise<void> {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${type} to clipboard!`);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard.');
    }
  }
}