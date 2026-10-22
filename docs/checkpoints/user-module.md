# Module Checkpoint & Invariant Specification: User Module

**Module Path**: `apps/portfolio/src/app/modules/user/`  
**Route Prefix**: `/user/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / Tailwind)

---

## 1. Module Overview & Global Invariants
The **User Module** is the authenticated core of the platform. It controls session state, module access gating (`UserModules`), personal workspaces, administrative control panels, and interactive applications.

### Global Invariants
1. **Module Access Gating**:
   - `createModuleGuard(moduleKey)` controls feature flag access based on `user.modules[moduleKey] === true`.
   - Never disable or remove module checks unless the prompt explicitly requests changing permission logic.
2. **Auth Flow & Session**:
   - `AuthService.currentUser` signal drives user state.
   - Unauthenticated access to protected routes must always redirect to `/user/login` preserving `returnUrl`.
3. **Destination Resolution (`resolveUserDestination`)**:
   - 0 enabled modules ➔ Redirect to `/user/no-modules`.
   - Exactly 1 enabled module ➔ Bypass profile hub and auto-redirect to that module (e.g. `/user/planner`).
   - 2 or more enabled modules ➔ Open full workspace profile hub (`/user`).
4. **Existing Feature Preservation**:
   - Adding a new module or game (e.g., Barricade) must **never** break or replace `/user/game` (Telugu Movie Guesser).

---

## 2. Page-by-Page Specifications

### Page 2.1: Sign In (`/user/login`)
- **Component**: `LoginComponent`
- **Access Guard**: None (Public)
- **Inputs & Validations**:
  - `email`: Required, valid email format regex.
  - `password`: Required, minimum length validation.
  - `rememberMe`: Boolean toggle.
- **Actions & State Logic**:
  - Submits credentials to `AuthService.login()`.
  - On success: navigates to `returnUrl` query parameter or executes `resolveUserDestination`.
  - On failure: Displays inline error alert without clearing user's email input.

---

### Page 2.2: Profile & Workspace Hub (`/user`)
- **Component**: `ProfileComponent`
- **Access Guard**: `authGuard`, `userHubGuard`
- **Features & Logic**:
  - Displays user avatar, full name, role badge (`ADMIN` vs `USER`), and email.
  - Renders dynamic cards for all assigned modules (`getAssignedUserModules(user)`).
  - Quick action shortcuts: Edit profile, Theme toggle, Notification settings, Sign Out.
  - Clicking any module card navigates directly to that module route.

---

### Page 2.3: No Modules Notice (`/user/no-modules`)
- **Component**: `NoModulesComponent`
- **Access Guard**: `authGuard`, `noModulesGuard`
- **Features & Invariants**:
  - Rendered strictly when an authenticated user has zero active permissions in `user.modules`.
  - Displays an informative lock card directing the user to contact the platform administrator.
  - Safe Sign Out button that clears session and returns to login.

---

### Page 2.4: Profile AI Assistant (`/user/ai`)
- **Component**: `ProfileAiChatComponent`
- **Access Guard**: `authGuard`, `createModuleGuard('aiAssistant')`
- **Features & Logic**:
  - Contextual AI assistant trained on Aditya Kumar T's developer portfolio, resume, and projects.
  - Preset suggestion prompts (e.g., *"What is Aditya's experience with Angular & Signals?"*, *"Tell me about the Barricade game architecture"*).
  - Streaming markdown responses with syntax-highlighted code blocks.

---

### Page 2.5: AI Workspace Chat (`/user/chat`)
- **Component**: `AiChatComponent`
- **Access Guard**: `authGuard`, `createModuleGuard('aiSpace')`
- **Features & Logic**:
  - Full-screen developer coding assistant and interactive workspace.
  - Chat history session persistence in local storage.
  - Code snippet copy-to-clipboard button with visual confirmation.
  - Clear conversation action with confirmation prompt.

---

### Page 2.6: Cloud File Manager (`/user/files`)
- **Component**: `FileManagerComponent`
- **Access Guard**: `authGuard`, `createModuleGuard('fileManager')`
- **Inputs, Validations & Logic**:
  - **Breadcrumbs**: Hierarchical folder path (`Root ➔ Folder A ➔ Folder B`) with instant jump links.
  - **Folder Creation**: Requires non-empty name; disallows illegal characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`).
  - **File Upload**:
    - Drag-and-drop zone or system file picker.
    - Size limit validation (e.g. 25MB max per file).
    - Real-time percentage upload progress bar (`HlmProgressImports`).
  - **File Preview Modal (`FilePreviewDialogComponent`)**:
    - Instant in-browser viewer for images (`png`, `jpg`, `webp`, `svg`), PDF documents, and text/code files.
  - **Actions**: One-click download, copy shareable URL to clipboard, and deletion with confirmation dialog.

---

### Page 2.7: Diet & Hydration Tracker (`/user/diet-hydration`)
- **Component**: `DietHydrationComponent`
- **Access Guard**: `authGuard`, `createModuleGuard('dietHydration')`
- **Calculations & Formulas**:
  - **Calorie Tracker**:
    - Meal logs categorized under: *Breakfast*, *Lunch*, *Dinner*, *Snacks*.
    - `totalCaloriesConsumed = sum(meals.calories)`.
    - `calorieGoalPercentage = min(100, round((totalCaloriesConsumed / dailyCalorieTarget) * 100))`.
    - Macro distribution: calculates Protein (g), Carbohydrates (g), and Fat (g) totals.
  - **Hydration Tracker**:
    - Daily target (default 2500ml); logged in increments of 250ml (1 cup).
    - `waterGoalPercentage = min(100, round((waterConsumedMl / dailyWaterGoalMl) * 100))`.
    - Automatic reset at local midnight.

---

### Page 2.8: Master Admin Console (`/user/admin`)
- **Component**: `AdminPanelComponent`
- **Access Guard**: `authGuard`, `masterAdminGuard` (`user.role === 'ADMIN'`)
- **Tab-by-Tab Specifications**:
  - **Tab 1: Overview (`'overview'`)**: System KPI cards (Total registered users, Active module licenses, Movie dataset counts).
  - **Tab 2: User Permissions Management (`'users'`)**:
    - User directory table with live search and email filter.
    - Feature flag toggles: checkboxes for `aiAssistant`, `aiSpace`, `fileManager`, `dietHydration`, `planner`, `movies`, `rr`.
    - Role elevation / demotion dropdown (`ADMIN` vs `USER`).
    - Save action sends payload via `AdminApiService.updateUserPermissions()`.
  - **Tab 3: Movie Dataset CRUD (`'movies'`)**:
    - Management of Telugu movie dataset with English translation clues.
    - Add/Edit dialog: Movie title, English translation clue, release year, hints, difficulty.
    - Delete action with confirmation.
  - **Tab 4: JSON Movie Importer (`'importer'`)**:
    - File upload and JSON paste box for bulk movie dataset imports.
    - Schema validation parser that highlights invalid movie entries before committing to the database.
  - **Tab 5: RR CMS Home Content (`'rr-home'`)**:
    - Live CMS editor for Royal Rentals homepage hero banners, promotional text, and featured vehicle spotlights.

---

### Page 2.9: Telugu Movie Guesser Arena (`/user/game`)
- **Component**: `GameComponent`
- **Access Guard**: Public / Session
- **Game Engine & Scoring Calculations**:
  - **Round Timer**: 30-second countdown with animated SVG progress ring.
  - **Text-to-Speech Clues**: Speaks the English translated clue aloud via Web Speech API (`SpeechSynthesisUtterance`).
  - **Answer Validation**: Case-insensitive, whitespace-trimmed comparison against Telugu movie title and acceptable aliases.
  - **Scoring Formula**:
    - `roundScore = basePoints + (secondsRemaining * timeBonusMultiplier) * streakMultiplier`.
    - Correct guess increments streak counter (`streakMultiplier = min(3, streakMultiplier + 0.5)`).
    - Incorrect guess or timeout resets streak to `1.0x`.
  - **Game Summary**: Displays final score, correct guess count, and high-score badge.

---

### Page 2.10: Barricade (Malefiz) Board Game (`/user/barricade`) *(Upcoming)*
- **Component**: `BarricadeComponent`
- **Access Guard**: Public / Session
- **Game Engine & Rules**:
  - Pyramid graph board topology leading to summit Castle node.
  - 2-Player Pass & Play mode and Computer AI Mode.
  - Breadth-First Search (BFS) movement calculation respecting barricade obstruction.
  - Collision resolution: capturing opponent tokens and dynamic barricade relocation.
  - Win condition: First token to reach Castle summit.

---

## 3. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **User Module**, execute this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new sub-component, new route, or new helper service without changing existing signatures.
- 🟡 **Behavioral Modification**: Changing existing guard behavior, modifying `user-modules.config.ts` resolution logic, modifying profile layout, or changing existing game behavior.
- 🔴 **Breaking Change**: Removing routes, modifying `UserModules` type without backward compatibility, removing auth checks.

### Step 2: Interactive Question Trigger
If any change is classified as **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in User Module
- **Question**: "The prompt requires modifying existing functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing functionality to match the new requirement"
