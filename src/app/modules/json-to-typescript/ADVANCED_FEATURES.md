/**
 * ADVANCED FEATURES & CUSTOMIZATION GUIDE
 * JSON to TypeScript Component
 */

/**
 * ADVANCED FEATURE 1: Custom Type Mapping
 * 
 * Extend TypeGeneratorUtility to support custom type mappings
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomTypeMapperService {
  private typeMapping: Map<string, string> = new Map([
    ['email', 'string'],
    ['phone', 'string'],
    ['date', 'Date'],
    ['timestamp', 'number'],
    ['amount', 'number'],
    ['percentage', 'number'],
    ['isActive', 'boolean'],
    ['isDeleted', 'boolean'],
    ['id', 'number | string'],
    ['url', 'string']
  ]);

  /**
   * Map property names to custom types based on naming conventions
   * Usage: If property contains 'email', automatically assign 'string' type
   */
  getCustomType(propertyName: string, value: any): string | null {
    const lowerName = propertyName.toLowerCase();

    for (const [pattern, type] of this.typeMapping) {
      if (lowerName.includes(pattern)) {
        return type;
      }
    }

    return null;
  }

  /**
   * Add custom type mapping
   */
  addMapping(pattern: string, type: string): void {
    this.typeMapping.set(pattern, type);
  }

  /**
   * Remove custom type mapping
   */
  removeMapping(pattern: string): void {
    this.typeMapping.delete(pattern);
  }
}

/**
 * ADVANCED FEATURE 2: Export Multiple Formats
 * 
 * Support different TypeScript export formats
 */

export interface ExportOptions {
  format: 'interface' | 'class' | 'type';
  includeDocumentation: boolean;
  includeConstructor: boolean;
  includeGettersSetters: boolean;
  strict: boolean; // Use strict null checks
}

export class AdvancedTypeGenerator {
  /**
   * Generate TypeScript class instead of interface
   */
  generateClass(jsonObject: Record<string, any>, className: string): string {
    const lines: string[] = [];
    lines.push(`export class ${className} {`);

    const properties = Object.keys(jsonObject);
    properties.forEach((key) => {
      const type = this.getType(jsonObject[key]);
      lines.push(`  ${key}: ${type};`);
    });

    lines.push(`\n  constructor(data?: Partial<${className}>) {`);
    lines.push(`    Object.assign(this, data);`);
    lines.push(`  }`);
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate TypeScript type instead of interface
   */
  generateType(jsonObject: Record<string, any>, typeName: string): string {
    const lines: string[] = [];
    const properties: string[] = [];

    Object.keys(jsonObject).forEach((key) => {
      const type = this.getType(jsonObject[key]);
      properties.push(`  ${key}: ${type};`);
    });

    lines.push(`export type ${typeName} = {`);
    lines.push(properties.join('\n'));
    lines.push('};');

    return lines.join('\n');
  }

  private getType(value: any): string {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'any[]';
    if (typeof value === 'object') return 'object';
    return 'any';
  }
}

/**
 * ADVANCED FEATURE 3: JSON Schema Integration
 * 
 * Generate interfaces from JSON Schema
 */

export interface JsonSchema {
  $schema?: string;
  title?: string;
  type: string;
  properties: Record<string, any>;
  required?: string[];
  definitions?: Record<string, any>;
}

export class JsonSchemaToTypeScriptConverter {
  /**
   * Convert JSON Schema to TypeScript Interface
   */
  convertSchema(schema: JsonSchema, interfaceName: string): string {
    const lines: string[] = [];
    lines.push(`export interface ${interfaceName} {`);

    const required = schema.required || [];

    Object.entries(schema.properties).forEach(([key, property]) => {
      const isRequired = required.includes(key);
      const optional = isRequired ? '' : '?';
      const type = this.getPropertyType(property);
      lines.push(`  ${key}${optional}: ${type};`);
    });

    lines.push('}');
    return lines.join('\n');
  }

  private getPropertyType(property: any): string {
    switch (property.type) {
      case 'string':
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return `${this.getPropertyType(property.items)}[]`;
      case 'object':
        return 'object';
      default:
        return 'any';
    }
  }
}

/**
 * ADVANCED FEATURE 4: Validation Rules
 * 
 * Add custom validation rules to generated interfaces
 */

export interface ValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export class InterfaceValidationGenerator {
  /**
   * Generate form validators from interface
   */
  generateValidators(
    jsonObject: Record<string, any>,
    interfaceName: string
  ): string {
    const lines: string[] = [];
    const validatorMap: Record<string, string[]> = {};

    Object.entries(jsonObject).forEach(([key, value]) => {
      const validators: string[] = [];

      if (value === null) {
        validators.push('Validators.required');
      }

      if (typeof value === 'string') {
        if (value.length > 0) {
          validators.push(`Validators.minLength(${value.length})`);
        }
      }

      if (typeof value === 'number') {
        validators.push('Validators.required');
      }

      validatorMap[key] = validators;
    });

    lines.push(`export const ${interfaceName}Validators = {`);
    Object.entries(validatorMap).forEach(([key, validators]) => {
      lines.push(`  ${key}: [${validators.join(', ')}],`);
    });
    lines.push('};');

    return lines.join('\n');
  }
}

/**
 * ADVANCED FEATURE 5: Documentation Generation
 * 
 * Generate JSDoc comments for interfaces
 */

export class DocumentationGenerator {
  /**
   * Generate documented interface with JSDoc
   */
  generateDocumentedInterface(
    jsonObject: Record<string, any>,
    interfaceName: string,
    description?: string
  ): string {
    const lines: string[] = [];

    // JSDoc header
    lines.push('/**');
    lines.push(` * ${interfaceName}`);
    if (description) {
      lines.push(` * ${description}`);
    }
    lines.push(' *');
    lines.push(` * @interface ${interfaceName}`);
    lines.push(' */');

    // Interface definition
    lines.push(`export interface ${interfaceName} {`);

    Object.entries(jsonObject).forEach(([key, value]) => {
      const type = this.getType(value);
      lines.push(`  /**`);
      lines.push(`   * ${key}`);
      lines.push(`   * @type {${type}}`);
      lines.push(`   */`);
      lines.push(`  ${key}: ${type};`);
    });

    lines.push('}');
    return lines.join('\n');
  }

  private getType(value: any): string {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'Array';
    if (typeof value === 'object') return 'Object';
    return 'any';
  }
}

/**
 * ADVANCED FEATURE 6: Performance Optimization
 * 
 * Handle large JSON objects efficiently
 */

export class PerformanceOptimizedGenerator {
  private cache: Map<string, string> = new Map();
  private maxCacheSize = 100;

  /**
   * Cache generated interfaces for performance
   */
  generateWithCache(json: string, interfaceName: string): string {
    const cacheKey = `${interfaceName}_${JSON.stringify(json).substring(0, 50)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const result = this.generate(JSON.parse(json), interfaceName);

    // Implement LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.cache.clear();
  }

  private generate(obj: Record<string, any>, name: string): string {
    // Generation logic here
    return `export interface ${name} {}`;
  }
}

/**
 * USAGE EXAMPLES
 */

/*
// Example 1: Using Custom Type Mapper
const customMapper = new CustomTypeMapperService();
customMapper.addMapping('avatar', 'URL');
customMapper.addMapping('createdAt', 'Date');

// Example 2: Generate Class Instead of Interface
const advancedGen = new AdvancedTypeGenerator();
const classCode = advancedGen.generateClass(myObject, 'MyClass');

// Example 3: Convert from JSON Schema
const schemaConverter = new JsonSchemaToTypeScriptConverter();
const interfaceCode = schemaConverter.convertSchema(mySchema, 'MyInterface');

// Example 4: Generate with Documentation
const docGen = new DocumentationGenerator();
const documentedInterface = docGen.generateDocumentedInterface(
  myObject,
  'User',
  'Represents a user in the system'
);

// Example 5: Performance Optimized Generation
const perfGen = new PerformanceOptimizedGenerator();
const cached = perfGen.generateWithCache(jsonString, 'MyInterface');
*/
