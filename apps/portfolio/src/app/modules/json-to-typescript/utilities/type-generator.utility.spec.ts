import { TestBed } from '@angular/core/testing';
import { TypeGeneratorUtility } from './type-generator.utility';

describe('TypeGeneratorUtility', () => {
  let service: TypeGeneratorUtility;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypeGeneratorUtility],
    });

    service = TestBed.inject(TypeGeneratorUtility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate simple interface', () => {
    const json = { name: 'test', age: 30 };
    const result = service.generateInterface(json, 'TestInterface');

    expect(result).toContain('export interface TestInterface');
    expect(result).toContain('name: string');
    expect(result).toContain('age: number');
  });

  it('should handle nested objects', () => {
    const json = {
      user: {
        name: 'John',
        contact: {
          email: 'john@test.com',
        },
      },
    };

    const result = service.generateInterface(json, 'Response');

    expect(result).toContain('export interface Response');
    expect(result).toContain('user: {');
    expect(result).toContain('contact: {');
    expect(result).toContain('email: string');
  });

  it('should handle arrays', () => {
    const json = {
      items: [1, 2, 3],
      tags: ['a', 'b', 'c'],
    };

    const result = service.generateInterface(json, 'Collection');

    expect(result).toContain('items: number[]');
    expect(result).toContain('tags: string[]');
  });

  it('should sanitize reserved keywords', () => {
    const json = {
      class: 'test',
      interface: 'value',
      import: 'module',
    };

    const result = service.generateInterface(json, 'Reserved');

    expect(result).toContain('class_: string');
    expect(result).toContain('interface_: string');
    expect(result).toContain('import_: string');
  });

  it('should handle special characters in property names', () => {
    const json = {
      'user-name': 'test',
      'email@address': 'value',
    };

    const result = service.generateInterface(json, 'Special');

    expect(result).toContain('user_name: string');
    expect(result).toContain('email_address: string');
  });

  it('should handle numeric starting property names', () => {
    const json = {
      '1stProperty': 'value',
      '2ndProperty': 'another',
    };

    const result = service.generateInterface(json, 'Numeric');

    expect(result).toContain('_1stProperty: string');
    expect(result).toContain('_2ndProperty: string');
  });
});
