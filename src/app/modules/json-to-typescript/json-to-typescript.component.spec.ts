import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { JsonToTypeScriptComponent } from './json-to-typescript.component';
import { JsonTransformerService } from './services/json-transformer.service';
import { TypeGeneratorUtility } from './utilities/type-generator.utility';

describe('JsonToTypeScriptComponent', () => {
  let component: JsonToTypeScriptComponent;
  let fixture: ComponentFixture<JsonToTypeScriptComponent>;
  let jsonTransformer: JsonTransformerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JsonToTypeScriptComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [JsonTransformerService, TypeGeneratorUtility]
    }).compileComponents();

    fixture = TestBed.createComponent(JsonToTypeScriptComponent);
    component = fixture.componentInstance;
    jsonTransformer = TestBed.inject(JsonTransformerService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('interfaceName')?.value).toBe('GeneratedInterface');
    expect(component.form.get('jsonInput')?.value).toBe('');
  });

  it('should validate JSON input correctly', () => {
    const validJson = '{"name": "test"}';
    const invalidJson = '{invalid json}';

    expect(jsonTransformer.isValidJson(validJson)).toBe(true);
    expect(jsonTransformer.isValidJson(invalidJson)).toBe(false);
  });

  it('should transform valid JSON to interface', () => {
    const jsonInput = '{"name": "John", "age": 30}';
    const result = jsonTransformer.transformJsonToInterface(jsonInput, 'User');

    expect(result.success).toBe(true);
    expect(result.interface).toContain('export interface User');
    expect(result.interface).toContain('name: string');
    expect(result.interface).toContain('age: number');
  });

  it('should clear form and reset state', () => {
    component.form.patchValue({
      jsonInput: '{"test": "value"}',
      interfaceName: 'TestInterface'
    });
    component.generatedInterface = 'some interface';
    component.showOutput = true;

    component.clearInput();

    expect(component.form.get('jsonInput')?.value).toBeNull();
    expect(component.form.get('interfaceName')?.value).toBe('GeneratedInterface');
    expect(component.generatedInterface).toBe('');
    expect(component.showOutput).toBe(false);
  });

  it('should have invalid form when jsonInput is empty', () => {
    component.form.patchValue({
      jsonInput: '',
      interfaceName: 'TestInterface'
    });

    expect(component.form.invalid).toBe(true);
  });

  it('should have invalid form when interfaceName is invalid', () => {
    component.form.patchValue({
      jsonInput: '{"test": "value"}',
      interfaceName: 'invalid-name' // contains hyphen
    });

    expect(component.form.invalid).toBe(true);
  });
});
