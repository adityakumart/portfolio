import { TestBed } from '@angular/core/testing';
import { JsonTransformerService } from './json-transformer.service';
import { TypeGeneratorUtility } from '../utilities/type-generator.utility';

describe('JsonTransformerService', () => {
  let service: JsonTransformerService;
  let typeGenerator: TypeGeneratorUtility;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonTransformerService, TypeGeneratorUtility],
    });

    service = TestBed.inject(JsonTransformerService);
    typeGenerator = TestBed.inject(TypeGeneratorUtility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate correct JSON', () => {
    const validJson = '{"name": "test", "age": 30}';
    expect(service.isValidJson(validJson)).toBe(true);
  });

  it('should invalidate incorrect JSON', () => {
    const invalidJson = '{invalid json}';
    expect(service.isValidJson(invalidJson)).toBe(false);
  });

  it('should handle string type', () => {
    const typeInfo = service.getTypeInfo('test');
    expect(typeInfo.type).toBe('string');
    expect(typeInfo.isArray).toBe(false);
  });

  it('should handle number type', () => {
    const typeInfo = service.getTypeInfo(42);
    expect(typeInfo.type).toBe('number');
    expect(typeInfo.isArray).toBe(false);
  });

  it('should handle boolean type', () => {
    const typeInfo = service.getTypeInfo(true);
    expect(typeInfo.type).toBe('boolean');
    expect(typeInfo.isArray).toBe(false);
  });

  it('should handle array type', () => {
    const typeInfo = service.getTypeInfo([1, 2, 3]);
    expect(typeInfo.type).toBe('number[]');
    expect(typeInfo.isArray).toBe(true);
  });

  it('should handle null value', () => {
    const typeInfo = service.getTypeInfo(null);
    expect(typeInfo.type).toBe('any');
    expect(typeInfo.isNullable).toBe(true);
  });

  it('should transform simple JSON object to interface', () => {
    const json = '{"name": "John", "age": 30, "isActive": true}';
    const result = service.transformJsonToInterface(json, 'User');

    expect(result.success).toBe(true);
    expect(result.interface).toContain('export interface User');
    expect(result.interface).toContain('name: string');
    expect(result.interface).toContain('age: number');
    expect(result.interface).toContain('isActive: boolean');
  });

  it('should reject non-object JSON', () => {
    const json = '"just a string"';
    const result = service.transformJsonToInterface(json, 'Test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('must be an object');
  });

  it('should reject array as root element', () => {
    const json = '[1, 2, 3]';
    const result = service.transformJsonToInterface(json, 'Test');

    expect(result.success).toBe(false);
    expect(result.error).toContain('must be an object, not an array');
  });
});
