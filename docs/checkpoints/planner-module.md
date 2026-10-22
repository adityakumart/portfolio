# Module Checkpoint & Invariant Specification: Planner Module

**Module Path**: `apps/portfolio/src/app/modules/user/components/planner/` (Web App)  
**Related Paths**: `apps/portfolio-core/` (Backend/SSE), `apps/extension-planner/` (Chrome Extension)  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI, Tailwind / SCSS)

---

## 1. Module Overview & Global Invariants
The **Planner Module** is an enterprise-grade personal productivity and team collaboration suite. It integrates Kanban task boards, high-density checklist views, Markdown note-taking, hierarchical multi-tenant projects with granular custom roles/permissions, real-time Server-Sent Events (SSE) synchronization, and seamless cross-platform support across both the Web Application and the Chrome Extension with instant offline caching.

### Global Invariants
1. **Task & Note Data Integrity**:
   - Modifying a task must never erase nested subtasks, tags, or reminder configurations.
   - Pinned notes must never lose pinned status during tag filtering or searching.
2. **Cross-Platform Compatibility (Web + Extension)**:
   - Changes to `todo.model.ts`, `planner-project.model.ts`, or shared types must **not** break `apps/extension-planner`.
   - Never use direct `window`, `document`, or DOM APIs in shared services without `PlatformAdapterService`.
3. **Role & Permission Isolation**:
   - Collaborative members without `canManageMembers` permission must never see invitation or role management actions.
4. **Offline Resilience**:
   - Planner must remain viewable and interactive even when network connectivity drops.

---

## 2. View-by-View & Dialog Specifications

### View 2.1: Main Workspace Header (`PlannerComponent`)
- **Header Controls**:
  - **Project Switcher Dropdown**: Switches between "All Tasks", personal projects, and collaborative shared workspaces.
  - **Active Tab Bar**: `todos` | `notes` | `projects` (persisted to `localStorage.getItem('portfolio_planner_active_tab')`).
  - **Search Input**: Live debounced search querying titles and descriptions across active tab.
  - **Tag Filter Chips**: Horizontal scrollable badges of all unique tags in the system (`allTags`). Clicking a tag filters active tasks/notes; clicking again clears filter.
  - **View Mode Switcher**:
    - For Tasks: Toggles between `'list'` (Compact View) and `'kanban'` (Kanban Board).
    - For Notes: Toggles between `'grid'` and `'list'`.

---

### View 2.2: Kanban Board View (`KanbanBoardComponent`)
- **Column Structure & Computations**:
  - **Pending Column**: Tasks with `status === 'pending'`, filtered by search and selected tag.
  - **In Progress Column**: Tasks with `status === 'in_progress'`, filtered by search and selected tag.
  - **Completed Column**: Tasks with `status === 'completed'`, filtered by search and selected tag.
  - **Custom Stages**: Dynamically loads custom project stages if active project defines them.
- **Drag-and-Drop Order Calculation**:
  - Computes fractional `orderIndex` between neighboring cards upon drop:
    - Dropped at top: `newOrderIndex = firstCard.orderIndex / 2`.
    - Dropped between cards: `newOrderIndex = (prevCard.orderIndex + nextCard.orderIndex) / 2`.
    - Dropped at bottom: `newOrderIndex = lastCard.orderIndex + 1000`.
- **Invariants**: Optimistic UI updates update signals immediately; re-syncs and shows toast if API fails.

---

### View 2.3: Compact Task Checklist View (`CompactViewComponent`)
- **Filter Tabs**:
  - `'all'`: All non-archived tasks.
  - `'today'`: `dueDate === todaysDateStr && status !== 'completed'`.
  - `'upcoming'`: `dueDate > todaysDateStr && status !== 'completed'`.
  - `'completed'`: `status === 'completed'`.
- **Strict Priority Sorting Precedence**:
  1. Uncompleted tasks appear before completed tasks.
  2. Priority differential: `urgent: 4, high: 3, medium: 2, low: 1`.
  3. Due date (earlier dates appear first; tasks with due dates precede tasks without).
  4. Creation date (descending).
- **Actions**: One-click checkbox completion instantly triggers status update and decrements pending badge.

---

### View 2.4: Notes Workspace (`NoteCardComponent` & `NoteEditorSheetComponent`)
- **Note Card Presentation**:
  - Pinned indicator pin icon (`isPinned === true`).
  - Markdown rendered preview.
  - Colored category chips and last edited relative timestamp.
- **Sorting Logic**:
  - `isPinned === true` notes strictly appear first.
  - Secondary sort: descending `updatedAt`.
- **Note Editor Sheet**:
  - Full-featured sliding sheet with Title input, Markdown editor textarea, Tag chip manager, and Pin toggle button.

---

### View 2.5: Collaborative Projects & Team Roles (`ProjectsListComponent`)
- **Project Structure**:
  - `myProjects`: Projects created by current user (`isProjectOwner === true`).
  - `collaborativeProjects`: Shared projects where user is an invited member.
  - `pendingInvitations`: Received invites awaiting user acceptance/rejection.
- **Permissions Gate (`IProjectPermissions`)**:
  - `canManageMembers`: Invite collaborators or modify member roles.
  - `canEditProject`: Rename project, change color palette, or archive project.
  - `canManageStages`: Add, reorder, or delete custom Kanban stages.
  - `canCreateTasks`: Add tasks to the project.
  - `canDeleteTasks`: Remove tasks from the project.

---

### Dialog 2.6: Task Form Sheet (`TodoFormSheetComponent`)
- **Inputs & Validations**:
  - `title`: Required, trimmed, cannot be whitespace-only.
  - `description`: Optional Markdown notes.
  - `projectId`: Dropdown selection of active project.
  - `status`: Strictly `'pending' | 'in_progress' | 'completed' | 'archived'`.
  - `priority`: Strictly `'urgent' | 'high' | 'medium' | 'low'`.
  - `dueDate`: Optional ISO date-time string.
  - `subtasks`: Dynamic array of `{ id, title, completed }`. Computes progress %: `round((completed / total) * 100)`.
  - `reminder`: Reminder toggle configuring alert offset.

---

### Dialog 2.7: Reminder Settings Dialog (`ReminderSettingsDialogComponent`)
- **Calculations & Actions**:
  - Computes reminder trigger timestamp: `triggerTime = dueDate - offsetMs` (e.g. 15 minutes, 1 hour, 1 day before).
  - Snooze actions calculate new trigger time: `+10 minutes` or `+1 hour`.
  - Verifies browser permission via `Notification.permission === 'granted'`; falls back to in-app toast/banner alerts.

---

### System 2.8: Offline Cache Engine & Cross-Platform Sync
- **Cache Key**: `portfolio_planner_offline_cache`.
- **Restoration Sequence**:
  1. On component init, instantly restores notes and todos from `PlatformAdapterService.getStorageItem`.
  2. Dispatches background HTTP request to `/api/planner/dashboard`.
  3. Updates signals, rewrites cache, and syncs extension badge count (`platform.updateBadge(pendingTodos.length)`).
- **SSE Realtime Stream**:
  - Merges remote task mutations from other browser windows or extension popups without clobbering active user edits.

---

## 3. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **Planner Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new task filter, new export format, new badge indicator, or additional note color theme.
- 🟡 **Behavioral Modification**: Changing default status columns, modifying priority sort weight, altering project permissions, or changing reminder notification timing.
- 🔴 **Breaking Change**: Changing the task data model in a way that breaks existing stored tasks or the Chrome Extension, removing Kanban drag-and-drop, or modifying API endpoints.

### Step 2: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in Planner Module
- **Question**: "The prompt modifies existing Planner functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing Planner functionality to match the new requirement"
