# Module Checkpoint & Invariant Specification: User Module

**Module Path**: `apps/portfolio/src/app/modules/user/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / Tailwind)

---

## 1. Module Overview & Core Responsibilities
The **User Module** handles authentication, user session state, personal workspace features, module permissions gating, and user-facing applications (File Manager, AI Chat, Diet & Hydration, Games, and Admin Panel).

---

## 2. Protected Routes & Guard Architecture

| Route Path | Component / Target | Access Guard | Protected Invariant |
|---|---|---|---|
| `/user/login` | `LoginComponent` | None (Public) | Must always allow user sign-in flow and redirect back to previous URL |
| `/user` | `ProfileComponent` | `authGuard`, `userHubGuard` | Landing page for authenticated users; redirects if single module active |
| `/user/no-modules` | `NoModulesComponent` | `authGuard`, `noModulesGuard` | Shown only when user has zero enabled modules |
| `/user/ai` | `ProfileAiChatComponent` | `authGuard`, `createModuleGuard('aiAssistant')` | In-profile AI assistant |
| `/user/chat` | `AiChatComponent` | `authGuard`, `createModuleGuard('aiSpace')` | Dedicated AI workspace chat |
| `/user/files` | `FileManagerComponent` | `authGuard`, `createModuleGuard('fileManager')` | Cloud storage & media explorer |
| `/user/diet-hydration` | `DietHydrationComponent` | `authGuard`, `createModuleGuard('dietHydration')` | Calorie and water intake logging |
| `/user/planner` | `PlannerComponent` | `authGuard`, `createModuleGuard('planner')` | Personal productivity suite |
| `/user/movies` | `MovieImporterComponent` | `authGuard`, `createModuleGuard('movies')` | Movie dataset management |
| `/user/admin` | `AdminPanelComponent` | `authGuard`, `masterAdminGuard` | Master admin privileges only |
| `/user/game` | `GameComponent` | Public / Session | Telugu Movie Guesser game arena |
| `/user/barricade` | `BarricadeComponent` (Upcoming) | Public / Session | Barricade board game |
| `/user/dev-tools` | `DevToolsRoutingModule` | Nested module | Developer utilities |
| `/user/formbuilder` | `FormbuilderModule` | Nested module | Form building module |
| `/user/rr` | `RRModule` | Nested module | Royal Rentals car platform |

---

## 3. Core Business Logic, Validations & Calculations

### A. Destination Resolution Logic (`resolveUserDestination`)
- Evaluates `user.modules` flags:
  - **Mode `'none'`**: If 0 modules enabled, redirect to `/user/no-modules`.
  - **Mode `'single'`**: If exactly 1 module enabled, automatically bypass profile hub and navigate directly to that module's target route (e.g. `/user/planner`).
  - **Mode `'multiple'`**: If 2 or more modules enabled, display the full `ProfileComponent` workspace hub.

### B. Module Permission Guard (`createModuleGuard`)
- Evaluates `user.modules[moduleKey] === true`.
- If permission is denied, dynamically falls back to `resolveUserDestination` (either `/user` or single assigned module) instead of a broken 404 page.

### C. Telugu Movie Guesser Game Calculations (`GameComponent`)
- **Timer Countdown**:
  - Time-limited rounds (e.g. 30 seconds per movie prompt).
- **Scoring Algorithm**:
  - `roundScore = basePoints + (secondsRemaining * timeBonusMultiplier) * streakMultiplier`.
  - Incorrect guess resets or decrements streak multiplier.
- **Audio & TTS Clue Trigger**:
  - Clue synthesis reads English translated clues aloud via SpeechSynthesis API.

### D. Diet & Hydration Tracker Calculations (`DietHydrationComponent`)
- **Calorie Progress**:
  - `totalConsumed = sum(meals.calories)`.
  - `percentage = min(100, (totalConsumed / dailyGoal) * 100)`.
- **Hydration Logging**:
  - Daily target (e.g. 2500ml); logged in increments of 250ml (1 cup).
  - Daily reset occurs automatically at local midnight.

---

## 4. Critical Invariants (Non-Negotiables)
1. **Module Access Gating**:
   - `createModuleGuard(moduleKey)` controls feature flag access based on `user.modules[moduleKey] === true`.
   - Never disable or remove module checks unless the prompt explicitly requests changing permission logic.
2. **Auth Flow & Session**:
   - `AuthService.currentUser` signal drives user state.
   - Unauthenticated access to protected routes must always redirect to `/user/login`.
3. **Sidebar & Hub Navigation**:
   - The user hub must dynamically list all modules available to the user.
   - Any new user sub-module must be registered in `user-modules.config.ts`.
4. **Existing Feature Preservation**:
   - Adding a new module or game (e.g., Barricade) must **never** break or replace `/user/game` (Telugu Movie Guesser).

---

## 5. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt is submitted for the **User Module**, execute this checkpoint:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new sub-component, new route, or new helper service without changing existing signatures.
- 🟡 **Behavioral Modification**: Changing existing guard behavior, modifying `user-modules.config.ts` resolution logic, modifying profile layout, or changing existing game behavior.
- 🔴 **Breaking Change**: Removing routes, modifying `UserModules` type without backward compatibility, removing auth checks.

### Step 2: Checkpoint Gate Table
Fill out this table in the implementation plan:
```markdown
| Target File / Feature | Impact | Existing Behavior | Proposed Behavior | Checkpoint Result |
|---|---|---|---|---|
| ... | 🟢 / 🟡 / 🔴 | ... | ... | Proceed / Needs User Question |
```

### Step 3: Interactive Question Trigger
If any change is classified as **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in User Module
- **Question**: "The prompt requires modifying existing functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing functionality to match the new requirement"
