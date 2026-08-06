import { Injectable } from '@angular/core';
import { 
  LanguageType, 
  IndentOption, 
  FormattingResult, 
  ValidationResult 
} from '../models/code-formatter.model';

@Injectable({
  providedIn: 'root'
})
export class CodeFormatterService {

  /**
   * Formats the source code based on language, indent preference, and sort options.
   * Injected here are custom regex-based formatters to provide interactive behavior without
   * heavy external libraries.
   */
  format(input: string, language: LanguageType, indentOption: IndentOption, sort: boolean): FormattingResult {
    if (!input || input.trim() === '') {
      return { success: true, result: '' };
    }

    try {
      const indentStr = this.getIndentString(indentOption);
      let result = '';

      switch (language) {
        case 'javascript':
          result = this.formatJS(input, indentStr);
          break;
        case 'css':
          result = this.formatCSS(input, indentStr, sort);
          break;
        case 'html':
          result = this.formatHTML(input, indentStr);
          break;
        default:
          return { success: false, result: '', error: `Unsupported language: ${language}` };
      }

      return { success: true, result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, result: '', error: `Formatting failed: ${msg}` };
    }
  }

  /**
   * Minifies the source code by removing comments, extra whitespaces, and newlines.
   */
  minify(input: string, language: LanguageType, sort: boolean): FormattingResult {
    if (!input || input.trim() === '') {
      return { success: true, result: '' };
    }

    try {
      let result = '';
      switch (language) {
        case 'javascript':
          result = this.minifyJS(input);
          break;
        case 'css':
          result = this.minifyCSS(input, sort);
          break;
        case 'html':
          result = this.minifyHTML(input);
          break;
        default:
          return { success: false, result: '', error: `Unsupported language: ${language}` };
      }

      return { success: true, result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, result: '', error: `Minification failed: ${msg}` };
    }
  }

  /**
   * Validates syntax of the input code for unmatched brackets, basic structures, etc.
   */
  validate(input: string, language: LanguageType): ValidationResult {
    if (!input || input.trim() === '') {
      return { isValid: true };
    }

    try {
      switch (language) {
        case 'javascript':
          return this.validateJS(input);
        case 'css':
          return this.validateCSS(input);
        case 'html':
          return this.validateHTML(input);
        default:
          return { isValid: false, error: `Unsupported language: ${language}` };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { isValid: false, error: `Validation error: ${msg}` };
    }
  }

  // ==========================================
  // Helper / Utility Methods
  // ==========================================

  private getIndentString(option: IndentOption): string {
    if (option === 'tab') return '\t';
    const spaces = parseInt(option, 10) || 2;
    return ' '.repeat(spaces);
  }

  // ==========================================
  // JavaScript Formatting & Verification
  // ==========================================

  private formatJS(input: string, indent: string): string {
    // Basic regex formatting for JavaScript structure
    let formatted = '';
    let depth = 0;
    
    // Clean and split on brackets / semicolons
    const tokens = input
      .replace(/\s*([\{\};])\s*/g, '$1') // normalize around key punctuation
      .replace(/([{};])/g, '\n$1\n')     // put them on their own lines temporarily
      .split('\n');

    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;

      if (token.startsWith('}')) {
        depth = Math.max(0, depth - 1);
      }

      formatted += indent.repeat(depth) + token + '\n';

      if (token.endsWith('{')) {
        depth++;
      }
    }

    // Clean up empty lines and return
    return formatted.trim()
      .replace(/\n\s*;/g, ';') // Put semicolon back on the same line if split
      .replace(/\{\s*\}/g, '{}'); // collapse empty blocks
  }

  private minifyJS(input: string): string {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
      .replace(/\/\/.*/g, '')          // remove single-line comments
      .replace(/\s+/g, ' ')            // collapse consecutive whitespace
      .replace(/\s*([\{\}\(\)=\+\-\*\/;:,])\s*/g, '$1') // remove spaces around syntax punctuation
      .trim();
  }

  private validateJS(input: string): ValidationResult {
    // Check braces, brackets, and parentheses matching
    const stack: string[] = [];
    const open = ['{', '[', '('];
    const close = ['}', ']', ')'];
    const matching: { [key: string]: string } = { '}': '{', ']': '[', ')': '(' };

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (open.includes(char)) {
        stack.push(char);
      } else if (close.includes(char)) {
        const expected = matching[char];
        if (stack.length === 0 || stack.pop() !== expected) {
          return {
            isValid: false,
            error: `Unmatched closing token '${char}' at character index ${i}`,
            detail: `Found '${char}' with no matching '${expected}'`
          };
        }
      }
    }

    if (stack.length > 0) {
      return {
        isValid: false,
        error: `Unclosed tokens left: ${stack.join(', ')}`,
        detail: `The following elements were opened but never closed properly: ${stack.join(', ')}`
      };
    }

    // Try a direct parse to catch syntax errors
    try {
      // Use standard Function constructor to validate script parsing
      new Function(input);
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : String(e);
      return {
        isValid: false,
        error: `Syntax Error: ${err}`
      };
    }

    return { isValid: true };
  }

  // ==========================================
  // CSS Formatting & Verification
  // ==========================================

  private formatCSS(input: string, indent: string, sort: boolean): string {
    // Quick regex styling formatter
    const cleaned = input
      .replace(/\/\*[\s\S]*?\*\//g, '') // strip comments
      .replace(/\s+/g, ' ')            // normalize whitespace
      .trim();

    const rules = cleaned.split('}');
    let formatted = '';

    for (const rule of rules) {
      const parts = rule.split('{');
      if (parts.length < 2) continue;

      const selector = parts[0].trim();
      const body = parts[1].trim();
      
      if (!selector) continue;

      formatted += `${selector} {\n`;

      let properties = body
        .split(';')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      if (sort) {
        properties.sort();
      }

      for (const prop of properties) {
        formatted += `${indent}${prop};\n`;
      }

      formatted += '}\n\n';
    }

    return formatted.trim();
  }

  private minifyCSS(input: string, sort: boolean): string {
    if (sort) {
      // Formats it first with sort to order properties, then strips spacing
      const sortedStr = this.formatCSS(input, '', true);
      return sortedStr.replace(/\s+/g, '').replace(/;}/g, '}');
    }
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([\{\};:])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }

  private validateCSS(input: string): ValidationResult {
    // Ensure matching open and close braces
    const openBraces = (input.match(/\{/g) || []).length;
    const closeBraces = (input.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      return {
        isValid: false,
        error: `Mismatched curly braces: found ${openBraces} open '{' and ${closeBraces} close '}'`
      };
    }

    // Check for standard declaration structures (e.g. selectors matching curly braces)
    // regex pattern matching simple declarations
    const bracePairs = input.split('}');
    for (let i = 0; i < bracePairs.length - 1; i++) {
      const part = bracePairs[i];
      if (!part.includes('{')) {
        return {
          isValid: false,
          error: `Missing opening brace '{' before CSS block at or near: "${part.substring(0, 30)}..."`
        };
      }
    }

    return { isValid: true };
  }

  // ==========================================
  // HTML Formatting & Verification
  // ==========================================

  private formatHTML(input: string, indent: string): string {
    // Format HTML elements
    let formatted = '';
    let depth = 0;

    // Regexp to split elements and tags cleanly
    const tokens = input
      .replace(/>\s*</g, '><')
      .replace(/(<[^>]+>)/g, '\n$1\n')
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const selfClosing = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];

    for (const token of tokens) {
      if (token.startsWith('</')) {
        // Closing tag
        depth = Math.max(0, depth - 1);
        formatted += indent.repeat(depth) + token + '\n';
      } else if (token.startsWith('<') && !token.startsWith('<!') && !token.endsWith('/>')) {
        // Opening tag
        const tagNameMatch = token.match(/<([a-zA-Z0-9\-]+)/);
        const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
        const isSelfClosed = selfClosing.includes(tagName);

        formatted += indent.repeat(depth) + token + '\n';
        if (!isSelfClosed) {
          depth++;
        }
      } else {
        // Content text or comments/doctype
        formatted += indent.repeat(depth) + token + '\n';
      }
    }

    return formatted.trim();
  }

  private minifyHTML(input: string): string {
    return input
      .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
      .replace(/>\s+</g, '><')        // strip spaces between tags
      .replace(/\s+/g, ' ')           // collapse normal spacing
      .trim();
  }

  private validateHTML(input: string): ValidationResult {
    // Verify tag matching using regex
    const tokens = input.match(/<[^>]+>/g) || [];
    const stack: string[] = [];

    const selfClosing = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];

    for (const token of tokens) {
      if (token.startsWith('<!')) {
        // Doctype or comment, ignore
        continue;
      }

      if (token.startsWith('</')) {
        // Closing tag
        const closeTagNameMatch = token.match(/<\/([a-zA-Z0-9\-]+)/);
        if (!closeTagNameMatch) continue;
        const tagName = closeTagNameMatch[1].toLowerCase();

        const expected = stack.pop();
        if (expected !== tagName) {
          return {
            isValid: false,
            error: `Mismatched closing tag: expected '</${expected}>' but found '${token}'`
          };
        }
      } else {
        // Opening tag
        const openTagNameMatch = token.match(/<([a-zA-Z0-9\-]+)/);
        if (!openTagNameMatch) continue;
        const tagName = openTagNameMatch[1].toLowerCase();

        const isSelfClosed = token.endsWith('/>') || selfClosing.includes(tagName);
        if (!isSelfClosed) {
          stack.push(tagName);
        }
      }
    }

    if (stack.length > 0) {
      return {
        isValid: false,
        error: `Unclosed tags remaining: ${stack.map(t => `<${t}>`).join(', ')}`
      };
    }

    return { isValid: true };
  }
}
