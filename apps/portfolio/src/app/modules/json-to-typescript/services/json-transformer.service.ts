import { Injectable } from '@angular/core';
import {
  JsonTypeInfo,
  TransformResult,
} from '../models/json-transformer.interface';
import { TypeGeneratorUtility } from '../utilities/type-generator.utility';

/**
 * Service responsible for transforming JSON objects into TypeScript interfaces
 * Handles validation, parsing, and interface generation
 */
@Injectable({
  providedIn: 'root',
})
export class JsonTransformerService {
  constructor(private typeGenerator: TypeGeneratorUtility) {}

  /**
   * Validates if the provided string is valid JSON
   * @param jsonString - The JSON string to validate
   * @returns boolean indicating if JSON is valid
   */
  isValidJson(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Transforms a JSON object to a TypeScript interface
   * @param jsonString - Raw JSON string input
   * @param interfaceName - Name for the generated interface (default: 'GeneratedInterface')
   * @returns TransformResult containing generated interface or error message
   */
  transformJsonToInterface(
    jsonString: string,
    interfaceName: string = 'GeneratedInterface',
  ): TransformResult {
    try {
      // Validate and parse JSON
      if (!this.isValidJson(jsonString)) {
        return {
          success: false,
          interface: '',
          error: 'Invalid JSON format. Please check your input.',
        };
      }

      const parsedJson = JSON.parse(jsonString);

      // Handle edge cases
      if (typeof parsedJson !== 'object' || parsedJson === null) {
        return {
          success: false,
          interface: '',
          error: 'JSON input must be an object, not a primitive value.',
        };
      }

      if (Array.isArray(parsedJson)) {
        return {
          success: false,
          interface: '',
          error:
            'JSON input must be an object, not an array. Try wrapping it in an object.',
        };
      }

      // Generate the interface
      const generatedInterface = this.typeGenerator.generateInterface(
        parsedJson,
        interfaceName,
      );

      return {
        success: true,
        interface: generatedInterface,
      };
    } catch (error) {
      return {
        success: false,
        interface: '',
        error: `An error occurred while processing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Determines the TypeScript type for a given value
   * @param value - The value to analyze
   * @returns JsonTypeInfo containing type information
   */
  getTypeInfo(value: any): JsonTypeInfo {
    const info: JsonTypeInfo = {
      type: 'any',
      isArray: false,
      isNullable: value === null,
    };

    if (value === null || value === undefined) {
      info.type = 'any';
      info.isNullable = true;
      return info;
    }

    if (Array.isArray(value)) {
      info.isArray = true;
      if (value.length === 0) {
        info.type = 'any[]';
      } else {
        const firstElement = value[0];
        const elementType = this.getValueType(firstElement);
        info.type = `${elementType}[]`;
      }
      return info;
    }

    info.type = this.getValueType(value);
    return info;
  }

  /**
   * Determines the base TypeScript type for a value
   * @param value - The value to analyze
   * @returns TypeScript type as string
   */
  private getValueType(value: any): string {
    if (typeof value === 'string') {
      return 'string';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (value instanceof Date) {
      return 'Date';
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? `${this.getValueType(value[0])}[]` : 'any[]';
    }
    if (typeof value === 'object' && value !== null) {
      return 'object';
    }
    return 'any';
  }
}
