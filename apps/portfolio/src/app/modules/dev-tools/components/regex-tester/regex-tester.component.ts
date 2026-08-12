import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { RegexHighlightPipe } from './pipes/regex-highlight.pipe';

export interface RegexOption {
  id: string;
  name: string;
  pattern: string;
  explanation: string;
  defaultTestText: string;
}

@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
    RegexHighlightPipe,
  ],
  templateUrl: './regex-tester.component.html',
  styleUrls: ['./regex-tester.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegexTesterComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  regexError: string | null = null;
  testTextStatus: 'match' | 'nomatch' | null = null;
  selectedOption: RegexOption | null = null;
  showPasswordBuilder = false;
  parsedTokens: { token: string; meaning: string; type: 'anchor' | 'quantifier' | 'set' | 'group' | 'literal' }[] = [];

  private destroy$ = new Subject<void>();

  readonly regexOptions: RegexOption[] = [
    {
      id: 'email',
      name: 'Email Address',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      explanation: `^ matches the start of the string.
[a-zA-Z0-9._%+-]+ matches one or more alphanumeric characters and allowed symbols in the local part.
@ matches the literal "@" character.
[a-zA-Z0-9.-]+ matches the domain name.
\\. matches a literal dot character.
[a-zA-Z]{2,} matches the top-level domain (e.g., com, org, net) with at least 2 alphabet characters.
$ matches the end of the string.`,
      defaultTestText: `john.doe@example.com
hello-world@domain.org
invalid_email@domain
info@sub.domain.co`,
    },
    {
      id: 'zip',
      name: 'ZIP Code (US)',
      pattern: '^\\d{5}(-\\d{4})?$',
      explanation: `^ matches the start of the string.
\\d{5} matches exactly 5 numeric digits.
(-\\d{4})? optionally matches a hyphen followed by exactly 4 digits.
$ matches the end of the string.`,
      defaultTestText: `90210
10001-1234
9999
123456`,
    },
    {
      id: 'xml',
      name: 'XML Tags',
      pattern: '<([a-zA-Z_][\\w:\\-\\.]*)[^>]*>.*?<\\/\\1>',
      explanation: `< matches the tag opening bracket.
([a-zA-Z_][\\w:\\-\\.]*) captures the tag name (allowing letters, digits, dots, hyphens).
[^>]* matches optional attribute lists.
> matches the closing tag bracket.
.*? matches the internal contents lazily (non-greedy).
<\\/\\1> matches the closing tag, matching the tag name captured in the first group (\\1).`,
      defaultTestText: `<note>This is a valid xml tag</note>
<div>And another one</div>
<span>invalid tag</p>`,
    },
    {
      id: 'uuid',
      name: 'UUID',
      pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
      explanation: `^ and $ anchor start and end of input.
Matches hex blocks of lengths 8, 4, 4, 4, and 12 separated by hyphens.
Enforces UUID version (1 to 5) and variant bits (8, 9, a, b, A, B).`,
      defaultTestText: `123e4567-e89b-12d3-a456-426614174000
da776602-fa67-4d9d-9d50-bf659b85c156
123e4567-e89b-12d3-a456`,
    },
    {
      id: 'url',
      name: 'URL',
      pattern: '^(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)$',
      explanation: `^ and $ anchor the expression.
(https?:\\/\\/)? optionally matches http:// or https:// protocol prefixes.
(www\\.)? optionally matches www. subdomains.
[-a-zA-Z0-9@:%._\\+~#=]{1,256} matches valid domain name characters.
\\.[a-zA-Z0-9()]{1,6} matches the top-level domain (TLD).
\\b matches word boundaries.
([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*) matches path segments, query strings, and hash fragments.`,
      defaultTestText: `https://google.com
http://localhost:8080/path?query=1
www.example.org
http://invalid-url`,
    },
    {
      id: 'street',
      name: 'Street Address',
      pattern: '^\\d+\\s[A-Za-z0-9\\s\\.,#-]+$',
      explanation: `^ matches start.
\\d+ matches the building/house number.
\\s matches spacing separator.
[A-Za-z0-9\\s\\.,#-]+ matches street name, abbreviations (St, Ave, Rd), and units.
$ matches end.`,
      defaultTestText: `123 Main St
1600 Amphitheatre Pkwy
456 5th Ave Apt 3B
NoNumber Street`,
    },
    {
      id: 'ssn',
      name: 'SSN (US)',
      pattern: '^\\d{3}-\\d{2}-\\d{4}$',
      explanation: `^ anchors start.
\\d{3} matches first 3 digits.
- matches hyphen.
\\d{2} matches middle 2 digits.
- matches hyphen.
\\d{4} matches last 4 digits.
$ anchors end.`,
      defaultTestText: `123-45-6789
000-12-3456
123456789`,
    },
    {
      id: 'phone',
      name: 'Phone Number',
      pattern: '^(\\+\\d{1,3}[\\s-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$',
      explanation: `^ anchors start.
(\\+\\d{1,3}[\\s-]?)? matches country codes (e.g. +1, +44) with optional spaces or hyphens.
\\(?\\d{3}\\)? matches 3-digit area codes, optionally enclosed in parentheses.
[\\s.-]? matches formatting spacing, dots, or hyphens.
\\d{3} matches local center exchange digits.
[\\s.-]? matches separators.
\\d{4} matches last 4 digits.
$ anchors end.`,
      defaultTestText: `(123) 456-7890
123-45-67890
+1 1234567890
123-456`,
    },
    {
      id: 'password',
      name: 'Password (Strict)',
      pattern: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$',
      explanation: `^ anchors start of checking.
(?=.*?[A-Z]) lookahead assert at least 1 uppercase letter.
(?=.*?[a-z]) lookahead assert at least 1 lowercase letter.
(?=.*?[0-9]) lookahead assert at least 1 number digit.
(?=.*?[#?!@$%^&*-]) lookahead assert at least 1 special symbol.
.{8,} checks that the password is at least 8 characters in length.
$ anchors end of password.`,
      defaultTestText: `P@ssw0rd!
A1b2C3d$
password123
PASS123!`,
    },
    {
      id: 'numbers',
      name: 'Numbers Only (Digits)',
      pattern: '^\\d+$',
      explanation: `^ matches start.
\\d+ matches one or more digits.
$ matches end.`,
      defaultTestText: `123456
0
999999999
123a45
12.34`,
    },
    {
      id: 'words',
      name: 'Words Match',
      pattern: '^[a-zA-Z]+$',
      explanation: `^ matches start.
[a-zA-Z]+ matches one or more letters (both uppercase and lowercase).
$ matches end.`,
      defaultTestText: `Regex
angular
portfolio
word123`,
    },
    {
      id: 'mac',
      name: 'MAC Address',
      pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
      explanation: `^ matches start.
([0-9A-Fa-f]{2}[:-]){5} matches exactly 5 groups of 2-digit hex numbers followed by a colon or hyphen.
([0-9A-Fa-f]{2}) matches the final 2-digit hex group.
$ matches end.`,
      defaultTestText: `00:1A:2B:3C:4D:5E
00-1a-2b-3c-4d-5e
00:1A:2B:3C:4D`,
    },
    {
      id: 'ip',
      name: 'IP Address (IPv4)',
      pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
      explanation: `Matches 4 decimal blocks separated by dots.
Restricts values to 0-255 using matching options:
- 25[0-5] handles 250-255.
- 2[0-4][0-9] handles 200-249.
- [01]?[0-9][0-9]? handles 0-199.`,
      defaultTestText: `192.168.1.1
255.255.255.255
0.0.0.0
256.0.0.1`,
    },
    {
      id: 'html',
      name: 'HTML Tags',
      pattern: '<\\/?[a-zA-Z0-9]+(?:\\s+[a-zA-Z0-9\\-]+(?:=(?:"[^"]*"|\'[^\']*\'|[^>\\s]+))?)*\\s*\\/?>',
      explanation: `<\\/? matches tag start brackets, optionally with a slash / for closing tags.
[a-zA-Z0-9]+ matches HTML tag name (e.g. div, img).
(?:\\s+...) handles list of key-value attributes (e.g. href="url").
\\s*\\/?> matches closing brackets, allowing trailing slashes for self-closing elements.`,
      defaultTestText: `<div>
<input type="text" class="form-control" disabled />
</span>
< div>`,
    },
    {
      id: 'guid',
      name: 'GUID',
      pattern: '^\\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\}?$',
      explanation: `Matches standard GUID sequences, optionally enclosed inside curly braces.
Checks hex digit counts (8-4-4-4-12) separated by hyphens.`,
      defaultTestText: `{123e4567-e89b-12d3-a456-426614174000}
123e4567-e89b-12d3-a456-426614174000
123e4567`,
    },
    {
      id: 'date',
      name: 'Date (YYYY-MM-DD)',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      explanation: `^ matches start.
\\d{4} matches exactly 4 digits for year.
- matches hyphen separator.
\\d{2} matches exactly 2 digits for month.
- matches hyphen.
\\d{2} matches exactly 2 digits for day.
$ matches end.`,
      defaultTestText: `2026-08-13
1999-12-31
08/13/2026
2026-8-13`,
    },
    {
      id: 'custom',
      name: 'Custom (User Defined)',
      pattern: '',
      explanation: 'Define your own pattern in the input field above. Enter flags if necessary, and see match highlights in the playground.',
      defaultTestText: 'Type any text here and define a custom regex pattern in the input box (e.g. [a-z]+) to see highlighting.',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Initialize reactive form state
    this.form = this.fb.group({
      category: ['email'],
      pattern: ['^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'],
      testText: [`john.doe@example.com
hello-world@domain.org
invalid_email@domain
info@sub.domain.co`],
      // Flags toggles
      flags: [['g']],
      // Password interactive builder controls
      passRequireUppercase: [true],
      passRequireLowercase: [true],
      passRequireDigit: [true],
      passRequireSpecial: [true],
      passMinLength: [8],
    });

    // 2. Set default option reference
    this.selectedOption = this.regexOptions.find((o) => o.id === 'email') || null;

    // 3. Register reactive triggers
    this.setupStateSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sets up reactive state subscriptions.
   */
  private setupStateSubscriptions(): void {
    // A. Listen to dropdown category changes
    this.form.get('category')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((catId: string) => {
        const option = this.regexOptions.find((o) => o.id === catId);
        if (option) {
          this.selectedOption = option;
          this.showPasswordBuilder = catId === 'password';

          if (this.showPasswordBuilder) {
            this.buildPasswordRegex();
            this.form.patchValue({ testText: option.defaultTestText }, { emitEvent: true });
          } else {
            this.form.patchValue({
              pattern: option.pattern,
              testText: option.defaultTestText,
            }, { emitEvent: true });
          }
        }
        this.cdr.markForCheck();
      });

    // B. Listen to Password rule toggles value changes
    const passwordBuilderControls = [
      'passRequireUppercase',
      'passRequireLowercase',
      'passRequireDigit',
      'passRequireSpecial',
      'passMinLength',
    ];

    passwordBuilderControls.forEach((ctrlName) => {
      this.form.get(ctrlName)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.showPasswordBuilder) {
            this.buildPasswordRegex();
          }
        });
    });

    // C. Listen to pattern or testText changes to perform matching evaluation
    this.form.valueChanges
      .pipe(
        debounceTime(100),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.evaluateRegexTest();
      });
  }

  /**
   * Synthesize password regex pattern dynamically from selected configurations.
   */
  private buildPasswordRegex(): void {
    const uppercase = this.form.get('passRequireUppercase')?.value;
    const lowercase = this.form.get('passRequireLowercase')?.value;
    const digits = this.form.get('passRequireDigit')?.value;
    const special = this.form.get('passRequireSpecial')?.value;
    const minLengthVal = this.form.get('passMinLength')?.value;

    const minLen = minLengthVal > 0 ? minLengthVal : 8;

    let pat = '^';
    if (uppercase) pat += '(?=.*?[A-Z])';
    if (lowercase) pat += '(?=.*?[a-z])';
    if (digits) pat += '(?=.*?[0-9])';
    if (special) pat += '(?=.*?[#?!@$%^&*-])';
    pat += `.{${minLen},}$`;

    this.form.patchValue({ pattern: pat }, { emitEvent: true });
  }

  /**
   * Validates pattern syntax and tests matching status on user test text input.
   */
  /**
   * Getter for active compiled regex flags.
   */
  get activeFlags(): string {
    const flagsVal: string[] = this.form?.get('flags')?.value || [];
    return flagsVal.join('');
  }

  private evaluateRegexTest(): void {
    const pattern = this.form.get('pattern')?.value;
    const testText = this.form.get('testText')?.value;

    this.regexError = null;
    this.parsedTokens = [];

    if (!pattern) {
      this.testTextStatus = null;
      this.cdr.markForCheck();
      return;
    }

    try {
      // Validate RegExp syntax by compiling it with active flags
      const regex = new RegExp(pattern, this.activeFlags);

      // Successfully compiled! Parse the token structure for visual explanation
      this.parsedTokens = this.parseRegexTokens(pattern);

      if (!testText) {
        this.testTextStatus = null;
      } else {
        // Test pattern match status
        const checkFlags = this.activeFlags.replace('g', '');
        const checkRegex = new RegExp(pattern, checkFlags);
        this.testTextStatus = checkRegex.test(testText) ? 'match' : 'nomatch';
      }
    } catch (e: any) {
      this.regexError = e.message || 'Syntax error in regex pattern.';
      this.testTextStatus = null;
    }

    this.cdr.markForCheck();
  }

  /**
   * Safe RegExp tokenizer to provide live character-by-character visual explanation breakdowns
   * for both predefined presets and custom user regex patterns.
   */
  private parseRegexTokens(pattern: string): { token: string; meaning: string; type: 'anchor' | 'quantifier' | 'set' | 'group' | 'literal' }[] {
    if (!pattern) return [];

    const tokens: { token: string; meaning: string; type: 'anchor' | 'quantifier' | 'set' | 'group' | 'literal' }[] = [];
    let i = 0;

    while (i < pattern.length) {
      const char = pattern[i];

      // Lookahead assertions e.g. (?=.*[A-Z])
      if (pattern.startsWith('(?=', i)) {
        const endIdx = this.findMatchingParenthesis(pattern, i + 1);
        if (endIdx !== -1) {
          const sub = pattern.slice(i, endIdx + 1);
          tokens.push({
            token: sub,
            meaning: `Lookahead: assert that what follows matches "${pattern.slice(i + 3, endIdx)}"`,
            type: 'group',
          });
          i = endIdx + 1;
          continue;
        }
      }

      // Group matches e.g. (?:...) or (...)
      if (char === '(') {
        const endIdx = this.findMatchingParenthesis(pattern, i);
        if (endIdx !== -1) {
          const isNonCapture = pattern.startsWith('(?:', i);
          const sub = pattern.slice(i, endIdx + 1);
          tokens.push({
            token: sub,
            meaning: isNonCapture
              ? `Group: match "${pattern.slice(i + 3, endIdx)}" without capturing`
              : `Capturing Group: match and capture "${pattern.slice(i + 1, endIdx)}"`,
            type: 'group',
          });
          i = endIdx + 1;
          continue;
        }
      }

      // Set matches e.g. [a-z]
      if (char === '[') {
        const endIdx = pattern.indexOf(']', i);
        if (endIdx !== -1) {
          const sub = pattern.slice(i, endIdx + 1);
          const negated = pattern[i + 1] === '^';
          const inner = pattern.slice(i + (negated ? 2 : 1), endIdx);
          tokens.push({
            token: sub,
            meaning: `Character Set: match any character ${negated ? 'NOT ' : ''}in the set "${inner}"`,
            type: 'set',
          });
          i = endIdx + 1;
          continue;
        }
      }

      // Quantifiers e.g. {8,}
      if (char === '{') {
        const endIdx = pattern.indexOf('}', i);
        if (endIdx !== -1) {
          const sub = pattern.slice(i, endIdx + 1);
          const val = pattern.slice(i + 1, endIdx);
          tokens.push({
            token: sub,
            meaning: `Quantifier: repeat preceding match ${val} times`,
            type: 'quantifier',
          });
          i = endIdx + 1;
          continue;
        }
      }

      // Escape chars e.g. \d
      if (char === '\\') {
        if (i + 1 < pattern.length) {
          const nextChar = pattern[i + 1];
          const token = '\\' + nextChar;
          let meaning = `Escape sequence matching literal "${nextChar}"`;
          let type: 'anchor' | 'quantifier' | 'set' | 'group' | 'literal' = 'literal';

          switch (nextChar) {
            case 'd': meaning = 'Digit character (0-9)'; type = 'set'; break;
            case 'D': meaning = 'Non-digit character'; type = 'set'; break;
            case 'w': meaning = 'Word character (alphanumeric and underscore)'; type = 'set'; break;
            case 'W': meaning = 'Non-word character'; type = 'set'; break;
            case 's': meaning = 'Whitespace character (spaces, tabs, linebreaks)'; type = 'set'; break;
            case 'S': meaning = 'Non-whitespace character'; type = 'set'; break;
            case 't': meaning = 'Tab character'; type = 'literal'; break;
            case 'n': meaning = 'Newline character'; type = 'literal'; break;
            case 'r': meaning = 'Carriage return'; type = 'literal'; break;
            case 'b': meaning = 'Word boundary'; type = 'anchor'; break;
            case 'B': meaning = 'Non-word boundary'; type = 'anchor'; break;
          }

          tokens.push({ token, meaning, type });
          i += 2;
          continue;
        }
      }

      // Standalone tokens
      let meaning = '';
      let type: 'anchor' | 'quantifier' | 'set' | 'group' | 'literal' = 'literal';
      switch (char) {
        case '^': meaning = 'Asserts position at start of input line'; type = 'anchor'; break;
        case '$': meaning = 'Asserts position at end of input line'; type = 'anchor'; break;
        case '.': meaning = 'Wildcard: match any single character (except newlines)'; type = 'set'; break;
        case '*': meaning = 'Quantifier: match 0 or more times'; type = 'quantifier'; break;
        case '+': meaning = 'Quantifier: match 1 or more times'; type = 'quantifier'; break;
        case '?': meaning = 'Quantifier: match 0 or 1 time (or makes quantifier non-greedy)'; type = 'quantifier'; break;
        case '|': meaning = 'Alternation: act as logical OR operand'; type = 'group'; break;
      }

      if (meaning) {
        tokens.push({ token: char, meaning, type });
        i++;
        continue;
      }

      // Match raw literals
      let literal = char;
      let nextIdx = i + 1;
      while (nextIdx < pattern.length) {
        const nextChar = pattern[nextIdx];
        const isSpecial = '^$.*+?()[]{\\|'.includes(nextChar);
        if (isSpecial) break;
        literal += nextChar;
        nextIdx++;
      }

      tokens.push({
        token: literal,
        meaning: `Match literal text "${literal}"`,
        type: 'literal',
      });
      i = nextIdx;
    }

    return tokens;
  }

  /**
   * Helper to locate matching parentheses bounds.
   */
  private findMatchingParenthesis(pattern: string, startIdx: number): number {
    let depth = 0;
    for (let idx = startIdx; idx < pattern.length; idx++) {
      if (pattern[idx] === '(') depth++;
      else if (pattern[idx] === ')') {
        depth--;
        if (depth === 0) return idx;
      }
    }
    return -1;
  }

  /**
   * Copies the current active pattern string into clipboard.
   */
  copyPattern(): void {
    const pattern = this.form.get('pattern')?.value;
    if (pattern) {
      this.clipboard.copy(pattern);
      this.snackBar.open('Pattern copied to clipboard!', 'Dismiss', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['clipboard-snackbar'],
      });
    }
  }

  /**
   * Helper scrolling handler to sync transparent textarea offset scrolling
   * with the highlighted background div.
   */
  syncScroll(textarea: HTMLTextAreaElement, highlightDiv: HTMLDivElement): void {
    highlightDiv.scrollTop = textarea.scrollTop;
    highlightDiv.scrollLeft = textarea.scrollLeft;
  }
}
