import { Injectable } from '@angular/core';

export interface FormatterResult {
  success: boolean;
  result: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  type?: 'array' | 'object';
}

@Injectable({
  providedIn: 'root',
})
export class JsonFormatterService {
  /**
   * Safely parses the input JSON string to check if it's valid.
   * @param jsonStr Raw JSON input string
   */
  validate(jsonStr: string): ValidationResult {
    if (!jsonStr || jsonStr.trim() === '') {
      return { isValid: false, error: 'JSON input is empty.' };
    }

    try {
      const parsed = JSON.parse(jsonStr) as unknown;
      if (parsed === null || typeof parsed !== 'object') {
        return {
          isValid: false,
          error: 'JSON input must be a valid array or object, not a primitive value.',
        };
      }
      const type = Array.isArray(parsed) ? 'array' : 'object';
      return { isValid: true, type };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown syntax error',
      };
    }
  }

  /**
   * Recursively sorts object keys alphabetically.
   * Does not mutate the original object; returns a new deep-sorted copy.
   * @param value The value to sort (could be object, array, or primitive)
   */
  sortObjectKeys(value: unknown): unknown {
    // Return early if the value is null, undefined, or not an object (primitives)
    if (value === null || typeof value !== 'object') {
      return value;
    }

    // If it's an array, recursively sort all elements in the array
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObjectKeys(item));
    }

    // Cast the object to record string -> unknown
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: Record<string, unknown> = {};

    // Recursively sort nested values for each key in alphabetical order
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }

    return sortedObj;
  }

  /**
   * Formats a JSON string with the specified indentation and optional sorting.
   * @param jsonStr Raw JSON input string
   * @param indent Indentation setting ('2' | '4' | 'tab')
   * @param sort Whether to sort keys alphabetically
   */
  format(
    jsonStr: string,
    indent: '2' | '4' | 'tab',
    sort: boolean,
  ): FormatterResult {
    const validation = this.validate(jsonStr);
    if (!validation.isValid) {
      return { success: false, result: '', error: validation.error };
    }

    try {
      let parsed = JSON.parse(jsonStr) as unknown;

      if (sort) {
        parsed = this.sortObjectKeys(parsed);
      }

      const space = indent === 'tab' ? '\t' : parseInt(indent, 10);
      const formatted = JSON.stringify(parsed, null, space);
      return { success: true, result: formatted };
    } catch (error) {
      return {
        success: false,
        result: '',
        error:
          error instanceof Error
            ? error.message
            : 'Error occurred during formatting',
      };
    }
  }

  /**
   * Minifies a JSON string by removing all whitespace and optionally sorting keys.
   * @param jsonStr Raw JSON input string
   * @param sort Whether to sort keys alphabetically
   */
  minify(jsonStr: string, sort: boolean): FormatterResult {
    const validation = this.validate(jsonStr);
    if (!validation.isValid) {
      return { success: false, result: '', error: validation.error };
    }

    try {
      let parsed = JSON.parse(jsonStr) as unknown;

      if (sort) {
        parsed = this.sortObjectKeys(parsed);
      }

      const minified = JSON.stringify(parsed);
      return { success: true, result: minified };
    } catch (error) {
      return {
        success: false,
        result: '',
        error:
          error instanceof Error
            ? error.message
            : 'Error occurred during minification',
      };
    }
  }
}
