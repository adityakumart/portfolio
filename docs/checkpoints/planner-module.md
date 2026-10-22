# Module Checkpoint & Invariant Specification: Planner Module

**Module Path**: `apps/portfolio/src/app/modules/user/components/planner/` (Web App)  
**Related Paths**: `apps/portfolio-core/` (Backend/SSE), `apps/extension-planner/` (Chrome Extension)  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI, Tailwind / SCSS)

---

## 1. Module Overview & Core Responsibilities
The **Planner Module** is an advanced task management and productivity application supporting Kanban boards, compact list views, Markdown notes, hierarchical projects, reminder notifications, and cross-platform sync (Web App + Chrome Extension) backed by real-time Server-Sent Events (SSE).

---

## 2. Core Architecture & Component Hierarchy

| Component / Service | Type | Role & Protected Invariant |
|---|---|---|
| `PlannerComponent` | Container | Main workspace layout, top toolbar, view toggle, project switcher |
| `KanbanBoardComponent` | UI View | Multi-column board (Todo, In Progress, Done) with drag-and-drop |
| `CompactViewComponent` | UI View | High-density task checklist for rapid completion |
| `ProjectsListComponent` | Navigation | Project sidebar, project creation, color coding, task count badges |
| `ProjectSettingsDialogComponent` | Modal | Project rename, color selection, archive, delete operations |
| `NoteCardComponent` / `NoteEditorSheetComponent` | Notes UI | Markdown note cards and sliding sheet editor |
| `TodoItemComponent` / `TodoFormSheetComponent` | Task UI | Task item card and comprehensive edit sheet (due dates, priority, subtasks) |
| `ReminderSettingsDialogComponent` | Dialog | Reminder alarms, recurring frequency, alert preferences |
| `MobileFabComponent` | Mobile UI | Quick-action floating button on small screens |
| `PlannerStateService` | State | Central Angular Signals state machine (tasks, projects, notes, active filters) |
| `PlannerApiService` | HTTP / API | REST communications with `portfolio-core` API |
| `PlannerReminderService` | Service | Browser notification scheduling & alert triggering |
| `PlatformAdapterService` | Platform | Abstraction ensuring compatibility across Web & Extension environments |

---

## 3. Core Business Logic, Validations & Calculations

### A. Task Creation & Form Validations (`TodoFormSheetComponent`)
- **Title Validation**:
  - Required, trimmed, cannot be empty or whitespace-only.
- **Due Date & Time**:
  - Optional; if provided, must be a valid date.
  - Due status calculations:
    - `isOverdue`: `dueDateTime < now && status !== 'done'`.
    - `isDueToday`: `format(dueDateTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')`.
- **Priority Enum**:
  - Strictly constrained to `'low' | 'medium' | 'high' | 'urgent'`.
- **Subtasks**:
  - Array of `{ id, title, completed }`. Total subtask progress percentage: `(completedCount / totalCount) * 100`.

### B. Kanban Column & Drag-and-Drop Calculations
- **Column Status Partitioning**:
  - Filtered into 3 canonical columns: `todo`, `in_progress`, and `done`.
  - Column counter badges calculate dynamic totals based on active project and search filter.
- **Order Index Calculation**:
  - Moving a card computes an updated `orderIndex` between preceding and succeeding cards to prevent full-array re-indexing.
  - Optimistic UI updates update signals immediately; re-syncs if API call fails.

### C. Reminder Trigger & Snooze Math (`PlannerReminderService`)
- **Offset Calculation**:
  - Reminders trigger at `triggerTime = dueDateTime - reminderOffsetMs` (e.g., 15m, 1h, 1d).
- **Snooze Calculations**:
  - Standard snooze increments `triggerTime` by `+10 minutes` or `+1 hour`.
- **Browser Notification Permissions**:
  - Must check `Notification.permission === 'granted'` before triggering browser alerts; falls back to in-app toast/banner notifications.

### D. Multi-Project & Extension Synchronization
- **Active Project Filter**:
  - `selectedProjectId === 'all' ? allTasks : tasks.filter(t => t.projectId === selectedProjectId)`.
- **Chrome Extension Sync**:
  - Uses `PlatformAdapterService` to avoid direct browser DOM references in background workers or popup scripts.
  - SSE listener merges remote updates into `PlannerStateService` without overwriting active local edit sheet state.

---

## 4. Critical Invariants (Non-Negotiables)
1. **Task Data Integrity**:
   - Every task must preserve its ID, `projectId`, `status`, `priority`, `createdAt`, `updatedAt`, and `tags`.
   - Modifying a task must never erase nested subtasks or associated reminders.
2. **Kanban Status Machine**:
   - Status transitions (e.g. `todo` ➔ `in_progress` ➔ `done`) must trigger accurate status updates and optimistic UI reflection.
3. **Cross-Platform Compatibility (Web + Extension)**:
   - Changes to `todo.model.ts`, `planner-project.model.ts`, or shared types must **not** break `apps/extension-planner`.
   - Never use Web-only APIs (like direct `window` or `document` calls) in shared services without `PlatformAdapterService`.
4. **Offline & Optimistic State**:
   - UI should remain responsive via optimistic state updates in `PlannerStateService`.
5. **Real-time Synchronization (SSE)**:
   - Must handle reconnection and updates without duplicating tasks or wiping uncommitted local drafts.

---

## 5. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **Planner Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new task filter (e.g. filter by tag), new sorting option, export to markdown, or new badge indicator.
- 🟡 **Behavioral Modification**: Changing default status columns, modifying task priority levels, altering project deletion rules, or changing reminder notification timing.
- 🔴 **Breaking Change**: Changing the task data model in a way that breaks existing stored tasks or the Chrome Extension, removing Kanban drag-and-drop, or deprecating the API endpoints.

### Step 2: Checkpoint Gate Table
Include in the plan:
```markdown
| Target File / Feature | Impact | Existing Behavior | Proposed Behavior | Checkpoint Result |
|---|---|---|---|---|
| ... | 🟢 / 🟡 / 🔴 | ... | ... | Proceed / Needs User Question |
```

### Step 3: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in Planner Module
- **Question**: "The prompt modifies existing Planner functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing Planner functionality to match the new requirement"
