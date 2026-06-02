import { Injectable } from '@angular/core';

/**
 * Utility service for generating TypeScript interface code from JSON objects
 * Handles recursive parsing of nested objects and type inference
 */
@Injectable({
  providedIn: 'root'
})
export class TypeGeneratorUtility {
  private readonly INDENT = '  '; // 2 spaces for indentation
  private readonly INTERFACE_SUFFIX = ' {';

  /**
   * Generates a complete TypeScript interface from a JSON object
   * @param jsonObject - The parsed JSON object
   * @param interfaceName - The name for the interface
   * @returns Formatted TypeScript interface as string
   */
  generateInterface(jsonObject: Record<string, any>, interfaceName: string): string {
    const lines: string[] = [];
    lines.push(`export interface ${interfaceName}${this.INTERFACE_SUFFIX}`);

    const properties = this.generateProperties(jsonObject, 1);
    lines.push(properties);
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generates property definitions recursively
   * @param obj - The object containing properties
   * @param depth - Current indentation depth
   * @returns Formatted properties as string
   */
  private generateProperties(obj: Record<string, any>, depth: number): string {
    const lines: string[] = [];
    const keys = Object.keys(obj);

    keys.forEach((key, index) => {
      const value = obj[key];
      const typeDefinition = this.getTypeDefinition(value, key, depth);
      lines.push(typeDefinition);
    });

    return lines.join('\n');
  }

  /**
   * Generates a type definition for a single property
   * @param value - The value of the property
   * @param key - The property key
   * @param depth - Current indentation depth
   * @returns Type definition line
   */
  private getTypeDefinition(value: any, key: string, depth: number): string {
    const indent = this.INDENT.repeat(depth);
    const sanitizedKey = this.sanitizePropertyName(key);
    const isOptional = value === null || value === undefined ? '?' : '';

    if (value === null || value === undefined) {
      return `${indent}${sanitizedKey}${isOptional}: any;`;
    }

    if (Array.isArray(value)) {
      return this.getArrayTypeDefinition(value, sanitizedKey, indent, depth);
    }

    if (typeof value === 'object') {
      return this.getObjectTypeDefinition(value, sanitizedKey, indent, key, depth);
    }

    const typeString = this.getValueType(value);
    return `${indent}${sanitizedKey}: ${typeString};`;
  }

  /**
   * Generates type definition for an array property
   * @param array - The array value
   * @param key - The property key
   * @param indent - Current indentation string
   * @param depth - Current indentation depth
   * @returns Type definition line
   */
  private getArrayTypeDefinition(
    array: any[],
    key: string,
    indent: string,
    depth: number
  ): string {
    if (array.length === 0) {
      return `${indent}${key}: any[];`;
    }

    // Check if all elements are of the same type
    const firstElement = array[0];
    const allSameType = array.every(
      (element) => typeof element === typeof firstElement
    );

    if (allSameType && typeof firstElement === 'object' && !Array.isArray(firstElement)) {
      // Array of objects - create interface for array element
      const elementInterfaceName = this.generateInterfaceNameFromProperty(key);
      const elementInterface = this.generateInterface(firstElement, elementInterfaceName);

      // Store the nested interface (will be returned separately or handled)
      return `${indent}${key}: ${elementInterfaceName}[];`;
    }

    const elementType = this.getValueType(firstElement);
    return `${indent}${key}: ${elementType}[];`;
  }

  /**
   * Generates type definition for an object property
   * @param obj - The object value
   * @param key - The property key
   * @param indent - Current indentation string
   * @param originalKey - Original key before sanitization
   * @param depth - Current indentation depth
   * @returns Type definition line
   */
  private getObjectTypeDefinition(
    obj: Record<string, any>,
    key: string,
    indent: string,
    originalKey: string,
    depth: number
  ): string {
    const nestedInterfaceName = this.generateInterfaceNameFromProperty(originalKey);
    const properties = this.generateProperties(obj, depth + 1);

    const nestedInterface = [
      `${indent}${key}: {`,
      properties,
      `${indent}};`
    ].join('\n');

    return nestedInterface;
  }

  /**
   * Determines the TypeScript type for a primitive value
   * @param value - The value to analyze
   * @returns TypeScript type as string
   */
  private getValueType(value: any): string {
    if (value === null || value === undefined) {
      return 'any';
    }

    switch (typeof value) {
      case 'string':
        return 'string';
      case 'number':
        return Number.isInteger(value) ? 'number' : 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'any';
    }
  }

  /**
   * Sanitizes a property name to be valid in TypeScript
   * Handles reserved keywords and invalid identifiers
   * @param key - The original key name
   * @returns Sanitized property name
   */
  private sanitizePropertyName(key: string): string {
    // Handle keys that are reserved keywords or contain invalid characters
    const reservedKeywords = [
      'abstract', 'arguments', 'await', 'boolean', 'break', 'byte', 'case', 'catch',
      'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
      'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final',
      'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
      'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new',
      'null', 'package', 'private', 'protected', 'public', 'return', 'short',
      'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while',
      'with', 'yield'
    ];

    let sanitized = key;

    // Replace invalid characters with underscores
    sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, '_');

    // Ensure it doesn't start with a number
    if (/^\d/.test(sanitized)) {
      sanitized = '_' + sanitized;
    }

    // Check if it's a reserved keyword and append underscore if needed
    if (reservedKeywords.includes(sanitized)) {
      sanitized = sanitized + '_';
    }

    return sanitized;
  }

  /**
   * Generates a PascalCase interface name from a property name
   * @param propertyName - The property name
   * @returns Generated interface name
   */
  private generateInterfaceNameFromProperty(propertyName: string): string {
    // Remove special characters and convert to PascalCase
    const cleanName = propertyName.replace(/[^a-zA-Z0-9]/g, ' ');
    const words = cleanName.split(' ').filter((word) => word.length > 0);
    const pascalCase = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    return pascalCase || 'NestedObject';
  }
}
