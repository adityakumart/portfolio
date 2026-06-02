/**
 * Interface for JSON Transformer Service
 * Defines the contract for transforming JSON objects to TypeScript interfaces
 */

export interface TransformResult {
  success: boolean;
  interface: string;
  error?: string;
}

export interface JsonTypeInfo {
  type: string;
  isArray: boolean;
  isNullable: boolean;
}
