# Module Checkpoint & Invariant Specification: Dev Tools Module

**Module Path**: `apps/portfolio/src/app/modules/dev-tools/`  
**Route Prefix**: `/user/dev-tools/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, Standalone Components, Spartan UI / SCSS)

---

## 1. Module Overview & Global Invariants
The **Dev Tools Module** is a zero-latency, client-side developer utility suite comprising **24 tools** across 5 categories.

### Global Invariants
1. **100% Client-Side Privacy Guarantee**:
   - Zero network transmission: JWT tokens, secrets, strings, and files must never leave the browser.
2. **Default Route Redirect**:
   - Accessing `/user/dev-tools` must always redirect to `/user/dev-tools/calculator/percentage`.
3. **State Isolation**:
   - Navigating between tools via the sidebar must completely reset or isolate tool execution state.
4. **Copy-to-Clipboard**:
   - Every tool with output must provide a 1-click clipboard copy button with Spartan Sonner toast notification.

---

## 2. Page-by-Page Tool Specifications

### Category 1: Calculators

#### Page 1.1: Percentage Calculator (`/user/dev-tools/calculator/percentage`)
- **Inputs & Validations**:
  - `Mode 1`: "What is X% of Y?" ➔ Inputs: `percentage` (number), `total` (number).
  - `Mode 2`: "X is what % of Y?" ➔ Inputs: `part` (number), `total` (number != 0).
  - `Mode 3`: "Percentage change from X to Y" ➔ Inputs: `initial` (number != 0), `final` (number).
- **Calculations**:
  - Mode 1: `result = (percentage / 100) * total`.
  - Mode 2: `result = (part / total) * 100`.
  - Mode 3: `change = ((final - initial) / abs(initial)) * 100` (calculates increase or decrease label).
- **Invariants**: Division-by-zero protection (renders `0` or friendly warning instead of `Infinity` or `NaN`).

#### Page 1.2: Experience Calculator (`/user/dev-tools/calculator/experience`)
- **Inputs & Validations**:
  - Dynamic rows of work experiences: `startDate` (ISO date), `endDate` (ISO date or "Present" toggle).
  - `endDate >= startDate`.
- **Calculations**:
  - Computes exact duration per role: `Years, Months, Days`.
  - Detects overlapping date ranges across multiple jobs to avoid double-counting.
  - Computes `Total Net Experience`: Sum of non-overlapping intervals formatted as `X Years, Y Months`.

#### Page 1.3: Timezone Converter (`/user/dev-tools/calculator/timezone-converter`)
- **Inputs & Validations**:
  - Base timestamp, source timezone selector (e.g. `UTC`, `IST`, `EST`, `PST`, `GMT`), target timezone selector.
- **Calculations**:
  - Uses `Intl.DateTimeFormat` with IANA timezone identifiers.
  - Calculates hour differential (e.g. `IST is +5:30 from UTC`).

---

### Category 2: Formatters

#### Page 2.1: JSON Formatter (`/user/dev-tools/formatters/json`)
- **Inputs & Validations**:
  - Textarea JSON input. Validated via `JSON.parse`.
- **Actions & Logic**:
  - **Prettify**: `JSON.stringify(parsed, null, indentSpaces)` (indent: 2 or 4 spaces).
  - **Minify**: `JSON.stringify(parsed)`.
  - **Syntax Error Highlight**: Traps `SyntaxError` and highlights character index and line number.

#### Page 2.2: HTML Formatter (`/user/dev-tools/formatters/html`)
- **Inputs & Validations**: Raw HTML string input.
- **Logic**: Indents nested DOM tags, preserves self-closing tags (`<img>`, `<br>`, `<input>`), strips redundant whitespace.

#### Page 2.3: CSS Formatter (`/user/dev-tools/formatters/css`)
- **Inputs & Validations**: Raw CSS string input.
- **Logic**: Formats selectors, expands declarations to new lines, indents properties by 2 spaces, normalizes semicolons.

#### Page 2.4: JavaScript Formatter (`/user/dev-tools/formatters/js`)
- **Inputs & Validations**: Raw JS/TS code string.
- **Logic**: Indents blocks, normalizes curly braces, cleans trailing whitespace without altering code semantics.

---

### Category 3: Encode / Decode

#### Page 3.1: Base64 Converter (`/user/dev-tools/encode-decode/base64`)
- **Inputs**: Plain text string OR file upload.
- **Logic**:
  - Encode: Text ➔ UTF-8 byte stream ➔ `btoa` Base64 string.
  - Decode: Base64 string ➔ `atob` ➔ UTF-8 decoded text.
  - Error handling: Catches invalid Base64 character exceptions gracefully.

#### Page 3.2: MD5 Hash (`/user/dev-tools/encode-decode/md5`)
- **Inputs**: Raw string input.
- **Logic**: Client-side MD5 message digest computation outputting 32-character hexadecimal string.

#### Page 3.3: SHA-256 Hash (`/user/dev-tools/encode-decode/sha256`)
- **Inputs**: Raw string input.
- **Logic**: `crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))` outputting 64-character hexadecimal digest.

#### Page 3.4: JWT Decoder (`/user/dev-tools/encode-decode/jwt`)
- **Inputs**: JWT string (`header.payload.signature`).
- **Validation**: Regex check for 3 dot-separated Base64Url segments.
- **Calculations & Output**:
  - Decodes Header: Algorithm (`alg`), Type (`typ`).
  - Decodes Payload: Claims (`sub`, `iat`, `exp`, `roles`, etc.).
  - Calculates Expiry Status: `isExpired = Date.now() >= exp * 1000`. Shows relative time remaining or elapsed.
- **Security Invariant**: Strictly client-side decoding; signature is not transmitted anywhere.

#### Page 3.5: URL Encoder / Decoder (`/user/dev-tools/encode-decode/url`)
- **Inputs**: Raw URL or URI component.
- **Logic**:
  - Encode: `encodeURIComponent(input)`.
  - Decode: `decodeURIComponent(input)`. Handles malformed percent-encoding errors.

---

### Category 4: Converters

#### Page 4.1: JSON to CSV (`/user/dev-tools/converters/json-to-csv-ts-schema`)
- **Inputs**: JSON array of objects.
- **Logic**:
  - Flattens nested keys with dot notation (e.g. `user.address.city`).
  - Extracts unique column headers across all objects.
  - Escapes comma, quotes, and newlines in values according to RFC 4180.
  - Provides instant CSV file download.

#### Page 4.2: JSON to TypeScript (`/user/dev-tools/converters/json-to-typescript`)
- **Inputs**: Valid JSON object.
- **Logic**:
  - Infers primitive types (`string`, `number`, `boolean`, `null`, `any`).
  - Generates PascalCase interface names for nested objects and arrays (`interface RootObject { ... }`).

#### Page 4.3: Query String Converter (`/user/dev-tools/converters/query-string`)
- **Inputs**: URL Query string (`?key=val&a=1`) OR JSON object.
- **Logic**:
  - Parses query string into structured JSON.
  - Serializes JSON into URI-encoded query string with array bracket support (`ids[]=1&ids[]=2`).

#### Page 4.4: Number Base Converter (`/user/dev-tools/converters/number-base`)
- **Inputs**: Decimal, Binary, Octal, or Hexadecimal input field.
- **Calculations**:
  - Typing in any one field updates all other 3 fields in real time:
    - Decimal: `n.toString(10)`
    - Binary: `n.toString(2)` (validates `[01]`)
    - Octal: `n.toString(8)` (validates `[0-7]`)
    - Hexadecimal: `n.toString(16).toUpperCase()` (validates `[0-9A-Fa-f]`)

#### Page 4.5: Line Splitter (`/user/dev-tools/converters/line-splitter`)
- **Inputs**: Multi-line text block.
- **Options & Logic**:
  - Custom delimiter split (comma, tab, semicolon, newline).
  - Deduplication: strips duplicate lines.
  - Sorting: Alphabetical A-Z, Z-A, Natural number sort.
  - Trim whitespace per line.

---

### Category 5: Generators

#### Page 5.1: Regex Tester (`/user/dev-tools/generator/regex`)
- **Inputs**: Regular expression pattern, flags (`g`, `i`, `m`, `s`), test string.
- **Logic**:
  - Real-time match execution highlighting matches and capture groups.
  - Catches invalid regex syntax errors without breaking component.
  - ReDoS protection: Execution wrapped in timeout / bounded worker to avoid freezing the browser.

#### Page 5.2: QR Code Generator (`/user/dev-tools/generator/qr`)
- **Inputs**: Text or URL string, error correction level (`L`, `M`, `Q`, `H`), dimension size.
- **Output**: SVG / Canvas QR rendering with one-click PNG download button.

#### Page 5.3: Random Array Generator (`/user/dev-tools/generator/array`)
- **Inputs**: Array length, element type (Numbers, Strings, Objects), min/max value range.
- **Output**: Formatted JSON array.

#### Page 5.4: Random Number Generator (`/user/dev-tools/generator/number`)
- **Inputs**: Min value, Max value, Integer vs Float toggle, count of numbers.
- **Calculation**: Cryptographically secure random using `crypto.getRandomValues`.

#### Page 5.5: Random Mock Objects Generator (`/user/dev-tools/generator/objects`)
- **Inputs**: Schema definition (Name, Email, Phone, Address, Date), quantity.
- **Output**: Realistic mock JSON array.

#### Page 5.6: UUID v4 Generator (`/user/dev-tools/generator/uuid`)
- **Inputs**: Quantity count (1 to 100), Uppercase toggle, Hyphens toggle.
- **Calculation**: Standard RFC 4122 UUID v4 using `crypto.randomUUID()`.

#### Page 5.7: Password Generator (`/user/dev-tools/generator/password`)
- **Inputs**: Length slider (8 - 64 chars), Include uppercase (`A-Z`), lowercase (`a-z`), numbers (`0-9`), symbols (`!@#$%^&*`).
- **Calculations**:
  - Cryptographically secure character selection.
  - Password strength entropy score computation (`Weak`, `Medium`, `Strong`, `Very Strong`).

---

## 3. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **Dev Tools Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new tool to `devToolsRoutingList` without changing existing routes or utilities.
- 🟡 **Behavioral Modification**: Changing calculation formulas, altering output formatting, or moving category groupings.
- 🔴 **Breaking Change**: Deleting tools, changing route URLs, or making client-side tools make network requests.

### Step 2: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in Dev Tools Module
- **Question**: "The prompt alters existing tool behavior: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing tool functionality to match the new requirement"
