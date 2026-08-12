import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'regexHighlight',
  standalone: true,
})
export class RegexHighlightPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  /**
   * Transforms input text by checking line-by-line matches against the active pattern,
   * wrapping matches in block-level green highlight tags and non-matches in block-level red highlight tags.
   *
   * @param text The raw input test text from the user.
   * @param pattern The active regex pattern string to evaluate.
   * @param flags Optional flags for RegExp. Default is 'g'.
   */
  transform(text: string, pattern: string, flags: string = 'g'): SafeHtml {
    if (!text) {
      return '';
    }
    if (!pattern) {
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }

    try {
      const activeFlags = flags.replace(/g/g, '');
      const regex = new RegExp(pattern, activeFlags);
      const lines = text.split('\n');

      const highlightedLines = lines.map((line) => {
        // Return blank block line with zero-width space to keep spacing heights in sync
        if (line === '') {
          return '<span class="regex-line-empty">&#8203;</span>';
        }

        const isMatch = regex.test(line);
        const escapedLine = this.escapeHtml(line);

        if (isMatch) {
          return `<span class="regex-line-match">${escapedLine}</span>`;
        } else {
          return `<span class="regex-line-no-match">${escapedLine}</span>`;
        }
      });

      let result = highlightedLines.join('\n');

      // Append space to trailing newline to prevent layout collapse in overlay sync
      if (result.endsWith('\n')) {
        result += ' ';
      }

      return this.sanitizer.bypassSecurityTrustHtml(result);
    } catch (e) {
      // Return safely escaped plain text if regex compiles with syntax errors
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(text));
    }
  }

  /**
   * Standard HTML escaping helper to prevent script injection (XSS).
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
