export type LanguageType = 'html' | 'css' | 'javascript';
export type IndentOption = '2' | '4' | 'tab';
export type ValidationState = 'idle' | 'valid' | 'invalid';

export interface FormatterConfig {
  language: LanguageType;
  title: string;
  subtitle: string;
  inputPlaceholder: string;
  outputPlaceholder: string;
  showSortOption: boolean;
  sortOptionLabel: string;
}

export interface FormatterState {
  input: string;
  indent: IndentOption;
  sort: boolean;
}

export interface FormattingResult {
  success: boolean;
  result: string;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  detail?: string;
}
