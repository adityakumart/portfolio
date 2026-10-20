# Implementation Plan: Playwright Test Coverage Across All Modules & Components

## 1. Overview & Objectives

The goal of this initiative is to achieve comprehensive end-to-end (E2E) and component-level UI test coverage using **Playwright** across all feature modules and shared components in the `portfolio` application (`apps/portfolio`).

This plan includes:
1. **Component & Module Audit**: Identifying existing coverage and locating every module and component that currently lacks Playwright test cases.
2. **Standardized Playwright Architecture**: Consistent mock authentication, routing guards bypass, viewport responsiveness, accessibility, and offline simulation patterns.
3. **New Test Suites**: Implementing Playwright tests for all uncovered modules (DevTools, FormBuilder, Movie Importer, Admin Console, Game Arena, RR Announcements, Advance Bookings, Root Shell & Shared UI).
4. **Configuration & Tooling Updates**: Expanding `playwright.config.ts` and `package.json` test scripts for seamless execution in CI and local development.

---

## 2. Git Information

- **Suggested Branch Name**: `test/playwright-all-modules-and-components`
- **Alternative Branch Name**: `test/playwright-e2e-test-coverage`
- **Suggested Commit Message**:
  ```text
  test(e2e): implement Playwright test coverage across all modules and components

  - Add Playwright test suites for DevTools module (calculators, formatters, converters, generators)
  - Add Playwright test suite for FormBuilder creation interface and form controls
  - Add Playwright test suite for Movie Importer dataset upload and validation
  - Add Playwright test suite for Master Admin Panel user management and permissions
  - Add Playwright test suite for Telugu Movie Guesser arena and game loop
  - Add Playwright test suites for RR Announcements and Advance Booking components
  - Add Playwright test suite for root AppComponent and shared UI components
  - Update playwright.config.ts testMatch glob patterns and package.json test scripts
  ```

---

## 3. Comprehensive Audit: Current vs. Missing Coverage

### 3.1 Module 1: Portfolio (`apps/portfolio/src/app/modules/portfolio`)
- **Status**: **Fully Covered** (9 test suites)
- **Existing Specs**:
  - `portfolio.component.spec.ts` (Main page integration, SEO, theme toggle, mobile layout)
  - `sub-components/hero/hero.component.spec.ts`
  - `sub-components/summary/summary.component.spec.ts`
  - `sub-components/experience/experience.component.spec.ts`
  - `sub-components/education/education.component.spec.ts`
  - `sub-components/skills/skills.component.spec.ts`
  - `sub-components/certificates/certificates.component.spec.ts`
  - `sub-components/awards/awards.component.spec.ts`
  - `sub-components/projects/projects.component.spec.ts`
- **Action Needed**: None. Maintain and ensure regression stability.

---

### 3.2 Module 2: RoadReady / Royal Rides (`apps/portfolio/src/app/modules/rr`)
- **Status**: **Partially Covered** (12 existing specs, 2 missing subcomponents)
- **Existing Specs**:
  - `rr.spec.ts` (Module integration and navigation)
  - `components/homepage/homepage.component.spec.ts`
  - `components/login/rr-login.component.spec.ts`
  - `components/lock-screen/rr-lock-screen.component.spec.ts`
  - `components/dashboard/dashboard.component.spec.ts`
  - `components/dashboard/components/activity-logs/activity-logs.component.spec.ts`
  - `components/dashboard/components/booking-list/booking-list.component.spec.ts`
  - `components/dashboard/components/customer-list/customer-list.component.spec.ts`
  - `components/dashboard/components/employee-list/employee-list.component.spec.ts`
  - `components/dashboard/components/history/history.component.spec.ts`
  - `components/dashboard/components/stats-view/stats-view.component.spec.ts`
  - `components/dashboard/components/vehicle-list/vehicle-list.component.spec.ts`
  - `shared/booking-dialogs.spec.ts`
- **Gaps / Missing Test Cases**:
  - `components/dashboard/components/advance-booking-list/advance-booking-list.component.ts`: **No Playwright spec**
  - `components/dashboard/components/announcements/announcements.component.ts`: **No Playwright spec**
  - Shared RR components (`aadhar-input`, `car-loader`, `vehicle-card`, `vehicle-image-carousel`): No standalone component specs (partially exercised through dialogs).
- **Action Needed**:
  - Create `advance-booking-list.component.spec.ts`
  - Create `announcements.component.spec.ts`

---

### 3.3 Module 3: User Workspace & Platform Hub (`apps/portfolio/src/app/modules/user`)
- **Status**: **Partially Covered** (8 existing specs, 2 major modules missing)
- **Existing Specs**:
  - `user.spec.ts` (Auth guard, sign-in redirects, module hub navigation)
  - `components/no-modules/no-modules.component.spec.ts`
  - `components/profile/profile.component.spec.ts`
  - `components/profile/profile-ai-chat.component.spec.ts`
  - `components/ai-chat/ai-chat.component.spec.ts`
  - `components/file-manager/file-manager.component.spec.ts`
  - `components/diet-hydration/diet-hydration.spec.ts`
  - `components/planner/planner.spec.ts`
- **Gaps / Missing Test Cases**:
  - `components/admin-panel/admin-panel.component.ts`: **No Playwright spec** (Master admin console: user permissions, module activation, data management)
  - `components/game/game.component.ts` and subcomponents (`game-dashboard`, `gameplay`, `game-over-modal`): **No Playwright spec** (Telugu movie guesser game)
  - `components/login/login.ts`: Only high-level redirect tests exist in `user.spec.ts`; lacks dedicated component spec for validation errors, tab toggling (Sign In vs Sign Up), and credential error toasts.
- **Action Needed**:
  - Create `admin-panel.component.spec.ts`
  - Create `game.component.spec.ts`
  - Create `login.component.spec.ts`

---

### 3.4 Module 4: DevTools (`apps/portfolio/src/app/modules/dev-tools`)
- **Status**: **Completely Uncovered in Playwright** (0 Playwright tests; only TestBed unit tests)
- **Components Requiring Tests**:
  - `dev-tools.component.ts`: Tool catalog hub, category search, tool filtering, card navigation.
  - Calculators:
    - `components/calculator/experience/experience.component.ts` (Total experience calculator, overlap reduction, company list dialog)
    - `components/calculator/percentage-calculator/percentage-calculator.component.ts` (What is X% of Y, X is what % of Y, percentage increase/decrease)
    - `components/calculator/timezone-converter/timezone-converter.component.ts` (Multi-city timezone synchronization and meeting planner)
  - Code & JSON Utilities:
    - `components/json-to-typescript/json-to-typescript.component.ts` (JSON parsing, TypeScript interface generation, copy/download)
    - `components/json-formatter/json-formatter.component.ts` & `json-csv-converter/json-csv-converter.component.ts`
    - `components/code-formatter/` (HTML, CSS, JS formatter components)
    - `components/encoder-hash-tools/encoder-hash-tools.component.ts` (MD5, SHA-256, URL encode/decode)
    - `components/jwt-decoder/jwt-decoder.component.ts` (JWT header/payload decoding, expiry validation)
    - `components/regex-tester/regex-tester.component.ts` (Regex expression match, flags, group highlight)
    - `components/qr-code-generator/qr-code-generator.component.ts` (QR generation, download options)
    - `components/base64-converter/base64-converter.component.ts`, `line-splitter/line-splitter.component.ts`, `number-base-converter/number-base-converter.component.ts`, `random-generator/random-generator.component.ts`
- **Action Needed**:
  - Create `dev-tools.spec.ts` (Main hub, category filtering, search, routing to tools)
  - Create `calculators.spec.ts` (Experience, Percentage, Timezone calculators)
  - Create `formatters-converters.spec.ts` (JSON-to-TS, JSON/CSV, JWT decoder, Base64, Hash encoder, Regex tester, QR generator)

---

### 3.5 Module 5: FormBuilder (`apps/portfolio/src/app/modules/formbuilder`)
- **Status**: **Completely Uncovered in Playwright** (0 Playwright tests; only TestBed unit tests)
- **Components Requiring Tests**:
  - `create/create.component.ts`: Form canvas, field drag-and-drop / selector (Text, Number, Select, Checkbox, Radio, Date), field properties editing, live preview mode, form schema export/import.
- **Action Needed**:
  - Create `formbuilder.spec.ts`

---

### 3.6 Module 6: Telugu Movie Importer (`apps/portfolio/src/app/modules/movie-importer`)
- **Status**: **Completely Uncovered in Playwright** (0 tests exist)
- **Components Requiring Tests**:
  - `movie-importer.component.ts`: File upload drag-and-drop, JSON dataset parsing, preview table, validation rules, batch save/upload to backend, error handling.
- **Action Needed**:
  - Create `movie-importer.spec.ts`

---

### 3.7 Root Shell & Shared UI Components (`apps/portfolio/src/app/shared/components` & `app.component.ts`)
- **Status**: **Completely Uncovered in Playwright** (Only isolated TestBed tests)
- **Components Requiring Tests**:
  - `app.component.ts`: Root app shell, navigation bar, dark/light theme persistence, service worker update prompt, offline alert banner.
  - `shared/components/network-toast/network-toast.component.ts`: Online/offline status notification toast.
  - `shared/components/notification-inbox/notification-inbox.component.ts`: Global notification drawer/inbox.
  - `shared/components/profile-menu/profile-menu.component.ts`: User avatar dropdown, profile links, logout action.
  - `shared/components/sidebar/sidebar.component.ts`: Responsive navigation drawer.
- **Action Needed**:
  - Create `app-shell-and-shared.spec.ts`

---

## 4. Proposed Test Specifications & File Architecture

```text
apps/portfolio/src/app/
├── app.spec.ts                                            <-- [NEW] App shell, theme, network toast, shared navigation
├── modules/
│   ├── dev-tools/
│   │   ├── dev-tools.spec.ts                              <-- [NEW] Hub, search, navigation
│   │   ├── calculators.spec.ts                            <-- [NEW] Experience, Percentage, Timezone calculators
│   │   └── data-tools.spec.ts                             <-- [NEW] JSON-to-TS, JWT, Formatters, Base64, Regex, QR
│   ├── formbuilder/
│   │   └── formbuilder.spec.ts                            <-- [NEW] Canvas, field builder, properties, preview, export
│   ├── movie-importer/
│   │   └── movie-importer.spec.ts                         <-- [NEW] File upload, JSON preview, validation, import action
│   ├── rr/
│   │   └── components/dashboard/components/
│   │       ├── advance-booking-list/
│   │       │   └── advance-booking-list.component.spec.ts  <-- [NEW] Advance bookings table, filter, status actions
│   │       └── announcements/
│   │           └── announcements.component.spec.ts        <-- [NEW] Ticker config, announcement CRUD & preview
│   └── user/
│       └── components/
│           ├── admin-panel/
│           │   └── admin-panel.component.spec.ts          <-- [NEW] Master admin RBAC, user module switches, analytics
│           ├── game/
│           │   └── game.component.spec.ts                 <-- [NEW] Game setup, round timer, guess validation, scoring
│           └── login/
│               └── login.component.spec.ts                <-- [NEW] Sign In / Sign Up form validation, auth feedback
```

---

## 5. Implementation Details for New Test Suites

### 5.1 DevTools Module Tests (`dev-tools.spec.ts`, `calculators.spec.ts`, `data-tools.spec.ts`)
- **Authentication**: Seed mock user session with `devTools: true`.
- **Route**: `/user/dev-tools`
- **Test Scenarios**:
  1. *Hub & Filtering*:
     - Render category tabs (All, Calculators, Formatters, Encoders, Converters, Generators).
     - Search input dynamically filters card grid (e.g. typing "jwt" displays only JWT Decoder).
     - Clicking a tool card navigates to the dedicated tool subroute.
  2. *Experience Calculator*:
     - Enter company name, start date, and end date; verify calculated years, months, and days.
     - Add overlapping experience periods and verify that duplicate durations are not double-counted.
  3. *Percentage Calculator*:
     - Fill in values for "What is X% of Y" and verify output.
     - Verify percentage increase/decrease calculations.
  4. *Timezone Converter*:
     - Select origin timezone and target timezone; verify accurate hour and date conversions.
  5. *JSON to TypeScript Converter*:
     - Paste sample JSON object with nested keys and arrays; click convert; verify generated interface syntax.
     - Verify copy to clipboard button and syntax formatting.
  6. *JWT Decoder*:
     - Input valid JWT string; verify parsed header, payload claims, and token expiration badge.
  7. *Regex Tester & Base64 Converter*:
     - Input test string and regex pattern; verify match highlight count.
     - Encode and decode ASCII text to Base64; verify roundtrip fidelity.

### 5.2 FormBuilder Module Tests (`formbuilder.spec.ts`)
- **Authentication**: Seed mock user session with `formBuilder: true`.
- **Route**: `/user/formbuilder`
- **Test Scenarios**:
  1. Render FormBuilder workspace with toolbox/palette and empty form canvas.
  2. Add form fields (Text Input, Number, Dropdown, Checkbox).
  3. Edit field attributes (Field Label, Placeholder, Required toggle).
  4. Switch to Preview Mode; fill out inputs and verify validation feedback.
  5. Export schema as JSON; verify exported structure matches canvas state.

### 5.3 Movie Importer Module Tests (`movie-importer.spec.ts`)
- **Authentication**: Seed mock user session with `movies: true` and admin role.
- **Route**: `/user/movies` and `/user/admin/importer`
- **Test Scenarios**:
  1. Render drag-and-drop file upload area and paste JSON textarea.
  2. Upload valid Telugu movie JSON dataset; verify parsed records table appears with titles, release years, and translations.
  3. Test invalid JSON parsing; verify descriptive error alert is shown.
  4. Verify pagination, search within imported records, and batch upload trigger.

### 5.4 Master Admin Console Tests (`admin-panel.component.spec.ts`)
- **Authentication**: Seed mock session with `role: 'admin'` and master admin credentials.
- **Route**: `/user/admin`
- **Test Scenarios**:
  1. Non-admin redirection: Unauthenticated or non-admin user redirected away by `masterAdminGuard`.
  2. User Management Table: View registered users list, search by email/name, and filter by status.
  3. Module Permissions Toggle: Toggle feature module switches (e.g. toggle `aiAssistant`, `planner`, `rr`) for a user and verify optimistic UI / state change.
  4. Admin Analytics / System Metrics: Verify platform metric cards (total users, active sessions, module usage).

### 5.5 Telugu Movie Guesser Game Tests (`game.component.spec.ts`)
- **Authentication**: Public or user access (`/game` or `/user/game`).
- **Route**: `/user/game`
- **Test Scenarios**:
  1. Game Setup Screen: Configure player count, player names, and round duration.
  2. Game Start: Click "Start Game", verify game transitions from `setup` to `in_progress` state.
  3. Gameplay UI: Clue card displayed, timer countdown active, audio clue trigger button visible.
  4. Guess Submission: Input guess, submit, verify correct/incorrect feedback score update.
  5. Game Over: Trigger game completion or timeout; verify `game-over-modal` with leaderboard and restart options.

### 5.6 RR Advance Bookings & Announcements Tests
- **Route**: `/user/rr/dashboard`
- **Test Scenarios**:
  1. *Advance Booking List*:
     - Verify table renders future bookings with pickup dates, customer info, vehicle type, and advance status badges.
     - Test status filtering (Pending, Confirmed, Cancelled).
  2. *Announcements & Ticker Console*:
     - Navigate to Announcements tab.
     - Edit scrolling ticker text, toggle visibility, and update scrolling speed.
     - Add a new announcement item (title, category: `offer` | `intimation` | `festival`, priority).
     - Verify updated announcement appears in preview list and on the public RR homepage.

### 5.7 App Shell & Shared UI Tests (`app.spec.ts`)
- **Route**: `/`
- **Test Scenarios**:
  1. Theme Persistence: Verify dark mode switch sets `localStorage` and toggles `html.dark`.
  2. Network Status Toast: Dispatch `window.dispatchEvent(new Event('offline'))` and verify `network-toast` appears with offline notice; dispatch `online` and verify reconnect toast.
  3. Navigation & Responsive Drawer: Verify desktop sidebar vs mobile bottom bar / hamburger drawer behavior.
  4. Notification Inbox: Click notification bell; verify inbox popover opens and displays recent notifications or empty state.

---

## 6. Configuration & Script Updates

### 6.1 `playwright.config.ts` Updates
Ensure `testMatch` encompasses all new module test files:
```typescript
testMatch: [
  '**/portfolio.component.spec.ts',
  '**/modules/portfolio/**/*.spec.ts',
  '**/user.spec.ts',
  '**/modules/user/**/*.component.spec.ts',
  '**/modules/user/**/*.spec.ts',
  '**/modules/dev-tools/**/*.spec.ts',
  '**/modules/formbuilder/**/*.spec.ts',
  '**/modules/movie-importer/**/*.spec.ts',
  '**/modules/rr/**/*.spec.ts',
  '**/app.spec.ts',
],
testIgnore: [
  '**/services/auth.spec.ts',
  '**/*.util.spec.ts',
  // Ignore TestBed unit specs that import @angular/core/testing
  '**/shared-types/**',
],
```

### 6.2 `package.json` Test Scripts
Add dedicated test shortcuts:
```json
"test:all": "playwright test",
"test:devtools": "playwright test apps/portfolio/src/app/modules/dev-tools",
"test:formbuilder": "playwright test apps/portfolio/src/app/modules/formbuilder",
"test:movies": "playwright test apps/portfolio/src/app/modules/movie-importer",
"test:admin": "playwright test apps/portfolio/src/app/modules/user/components/admin-panel",
"test:game": "playwright test apps/portfolio/src/app/modules/user/components/game"
```

---

## 7. Phased Implementation Plan

| Phase | Tasks | Target Files |
| :--- | :--- | :--- |
| **Phase 1** | **Configuration & Shared Fixtures**<br>• Update `playwright.config.ts`<br>• Create shared Playwright test helpers (auth session injector, mock user generator, network helpers) in `apps/portfolio/src/app/test-utils/playwright-helpers.ts` | `playwright.config.ts`, `package.json`, `apps/portfolio/src/app/test-utils/playwright-helpers.ts` |
| **Phase 2** | **DevTools Module Suites**<br>• Implement `dev-tools.spec.ts`<br>• Implement `calculators.spec.ts`<br>• Implement `data-tools.spec.ts` | `apps/portfolio/src/app/modules/dev-tools/*.spec.ts` |
| **Phase 3** | **FormBuilder & Movie Importer Suites**<br>• Implement `formbuilder.spec.ts`<br>• Implement `movie-importer.spec.ts` | `apps/portfolio/src/app/modules/formbuilder/formbuilder.spec.ts`, `apps/portfolio/src/app/modules/movie-importer/movie-importer.spec.ts` |
| **Phase 4** | **User Missing Modules: Admin Console, Game & Login**<br>• Implement `admin-panel.component.spec.ts`<br>• Implement `game.component.spec.ts`<br>• Implement `login.component.spec.ts` | `apps/portfolio/src/app/modules/user/components/admin-panel/admin-panel.component.spec.ts`, `game/game.component.spec.ts`, `login/login.component.spec.ts` |
| **Phase 5** | **RR Module Gap Closure**<br>• Implement `advance-booking-list.component.spec.ts`<br>• Implement `announcements.component.spec.ts` | `apps/portfolio/src/app/modules/rr/components/dashboard/components/advance-booking-list/advance-booking-list.component.spec.ts`, `announcements/announcements.component.spec.ts` |
| **Phase 6** | **App Shell & Shared UI Suites**<br>• Implement `app.spec.ts` covering theme toggle, offline banner, header/navigation, profile menu, and notification inbox | `apps/portfolio/src/app/app.spec.ts` |
| **Phase 7** | **End-to-End Verification & CI Validation**<br>• Execute complete Playwright test suite (`pnpm test`)<br>• Verify HTML report and ensure 100% test pass rate with zero flakes | `playwright-report/` |

---

## 8. Verification & Test Commands

Run individual module suites:
```bash
# Test DevTools
pnpm exec playwright test apps/portfolio/src/app/modules/dev-tools

# Test FormBuilder
pnpm exec playwright test apps/portfolio/src/app/modules/formbuilder

# Test Movie Importer
pnpm exec playwright test apps/portfolio/src/app/modules/movie-importer

# Test User Admin Panel & Game
pnpm exec playwright test apps/portfolio/src/app/modules/user/components/admin-panel
pnpm exec playwright test apps/portfolio/src/app/modules/user/components/game

# Test RR Advance Bookings and Announcements
pnpm exec playwright test apps/portfolio/src/app/modules/rr/components/dashboard/components/announcements
pnpm exec playwright test apps/portfolio/src/app/modules/rr/components/dashboard/components/advance-booking-list

# Run entire test suite across all modules
pnpm exec playwright test
```
