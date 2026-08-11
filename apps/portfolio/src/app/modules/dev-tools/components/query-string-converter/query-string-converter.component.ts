import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';

export interface ParamPair {
  key: string;
  value: string;
}

export interface ParsedResult {
  json: Record<string, any>;
  params: ParamPair[];
  error: string | null;
}

@Component({
  selector: 'app-query-string-converter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './query-string-converter.component.html',
  styleUrls: ['./query-string-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryStringConverterComponent {
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  // Raw query string/URL input signal
  rawInput = signal<string>('');
  
  // Sort toggle signal
  sortKeys = signal<boolean>(false);

  // Computed state for the parsed result, handling both full URLs and raw query strings
  parsedResult = computed<ParsedResult>(() => {
    const input = this.rawInput().trim();
    if (!input) {
      return { json: {}, params: [], error: null };
    }

    try {
      let queryString = input;

      // Check if it's a URL or contains '?'
      if (queryString.includes('?')) {
        queryString = queryString.substring(queryString.indexOf('?') + 1);
      } else {
        // If it starts with standard URL schemas or hostnames but does not contain query parameters,
        // treat it as having no parameters (avoiding parsing the hostname as a query parameter key).
        const looksLikeUrlWithoutQuery = 
          (queryString.startsWith('http://') || 
           queryString.startsWith('https://') || 
           queryString.startsWith('//') || 
           /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/|$)/.test(queryString)) && 
          !queryString.includes('=');

        if (looksLikeUrlWithoutQuery) {
          return { json: {}, params: [], error: null };
        }
      }

      // Parse the query string using the browser's native URLSearchParams.
      // This handles standard key=value formatting, character decoding, and multiple values automatically.
      const searchParams = new URLSearchParams(queryString);
      
      const json: Record<string, any> = {};
      const params: ParamPair[] = [];

      // Extract unique keys to construct the structured JSON
      const keys = Array.from(new Set(searchParams.keys()));
      
      if (this.sortKeys()) {
        keys.sort((a, b) => a.localeCompare(b));
      }

      for (const key of keys) {
        const values = searchParams.getAll(key);
        // If there's only one value, map it as a string. E.g. { foo: 'bar' }
        // If there are duplicate keys, group them into an array. E.g. { tags: ['ng', 'rxjs'] }
        if (values.length === 1) {
          json[key] = values[0];
        } else if (values.length > 1) {
          json[key] = values;
        }
      }

      // Construct a flat list of all parameter key-value pairs (with duplicate keys preserved as separate rows)
      if (this.sortKeys()) {
        const entries = Array.from(searchParams.entries());
        entries.sort((a, b) => a[0].localeCompare(b[0]));
        for (const [key, value] of entries) {
          params.push({ key, value });
        }
      } else {
        for (const [key, value] of searchParams.entries()) {
          params.push({ key, value });
        }
      }

      return { json, params, error: null };
    } catch (err: any) {
      // Capture malformed URL or decoding errors (like URIError from bad percent encoding)
      return {
        json: {},
        params: [],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  });

  // Computed helper for formatted output JSON
  jsonOutputString = computed<string>(() => {
    const json = this.parsedResult().json;
    if (Object.keys(json).length === 0) {
      return '';
    }
    return JSON.stringify(json, null, 2);
  });

  // Computed helper for error message
  errorMessage = computed<string | null>(() => this.parsedResult().error);

  // Computed helper for parameters list
  paramsList = computed<ParamPair[]>(() => this.parsedResult().params);

  /**
   * Loads a sample URL into the input to demonstrate parsing capabilities.
   */
  loadSampleUrl(): void {
    this.rawInput.set('https://api.example.com/v1/search?category=electronics&query=mechanical+keyboard&tags=wireless&tags=rgb&sort=price_asc&page=1&active=true');
    this.showSnackBar('Loaded sample URL', 'info');
  }

  /**
   * Loads a raw query string containing duplicate keys and spaces into the input.
   */
  loadSampleQueryString(): void {
    this.rawInput.set('user=alex_smith&role=admin&permissions=read&permissions=write&permissions=delete&location=San+Francisco&zip=94103');
    this.showSnackBar('Loaded sample query string', 'info');
  }

  /**
   * Clears all inputs and resets the parsed results.
   */
  clearInput(): void {
    this.rawInput.set('');
    this.showSnackBar('Cleared input', 'info');
  }

  /**
   * Copies the stringified JSON output to the system clipboard.
   */
  copyJson(): void {
    const text = this.jsonOutputString();
    if (!text) {
      this.showSnackBar('No JSON output to copy', 'error');
      return;
    }

    if (this.clipboard.copy(text)) {
      this.showSnackBar('Copied JSON to clipboard!', 'success');
    } else {
      this.showSnackBar('Failed to copy JSON', 'error');
    }
  }

  /**
   * Copies a single text fragment (e.g. parameter key or value) to clipboard.
   * @param text String to copy
   * @param label Visual label for notification
   */
  copyText(text: string, label: string): void {
    if (this.clipboard.copy(text)) {
      this.showSnackBar(`Copied ${label} to clipboard!`, 'success');
    } else {
      this.showSnackBar(`Failed to copy ${label}`, 'error');
    }
  }

  /**
   * Helper to display snackbar notifications.
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    const panelClass =
      type === 'success'
        ? 'success-snackbar'
        : type === 'error'
        ? 'error-snackbar'
        : 'info-snackbar';

    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: [panelClass],
    });
  }
}
