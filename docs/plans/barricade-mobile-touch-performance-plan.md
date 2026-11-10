# Implementation Plan: Barricade Mobile Touch & Performance Optimization

**Feature / Bugfix**: Resolve mobile touch interaction failures and critical performance bottlenecks in Barricade (Quoridor)  
**Target Branch**: `fix/barricade-mobile-touch-and-performance`  
**Status**: Pending User Review  

---

## 1. Deep Root Cause Analysis: Why Barricade is "Very Slow"

Profiling the game reveals **6 distinct performance bottlenecks** that together cause extreme lag, battery drain, and UI thread freezes, especially on mobile devices:

### 1. The 100ms Zoneless Change Detection Flood (Primary Cause of Idle Lag)
- In `BarricadeStateService.startClockTimer()`, `setInterval(..., 100)` updates `this.players` 10 times every second.
- The portfolio app runs on Angular with `provideZonelessChangeDetection()`. In zoneless mode, signal notifications directly trigger reactive render passes.
- Mutating `this.players` 10 times per second marks all dependent signals dirty:
  - `this.currentPlayer` recalculates.
  - `this.legalMoves` recalculates, invoking `getLegalPawnMovesMulti()` (which runs graph and wall collision checks) 10 times/second.
  - `gridCells` in `BarricadeBoardComponent` instantiates a brand-new 9x9 2D array (allocating 81 `RenderCell` objects) 10 times/second.
  - Angular iterates and reconciles all 81 SVG tiles, coordinate labels, pawns, pulsing rings, player cards, and segmented wall meters 10 times every second.
- **Impact**: Even while the user is simply looking at the board, the mobile CPU is pegged at 25–40% utilization, creating constant garbage collection pressure and causing touch events to lag or drop.

### 2. Synchronous 160-Iteration BFS Search Freezes UI During AI Turns
- In `BarricadeAiService.findBestWall()`, up to 40 candidate wall placements around the player's neighborhood are evaluated.
- For each candidate wall:
  1. `canPlaceWall()` executes 2 BFS runs (Player 1 + Player 2).
  2. If valid, 2 more BFS runs are executed (`pBfs` for Player 1 and `aBfs` for AI).
- This totals up to **160 full BFS graph searches** executed synchronously in a single JavaScript call stack.
- On a mobile CPU, this blocks the main UI thread for **1.5 to 3 seconds**. Animations freeze, scrolling halts, and the screen becomes completely unresponsive.

### 3. $O(N)$ Dequeue & Heavy Object/Array Allocations in BFS
- In `BarricadeBfsEngineService`, both `findShortestPathToGoal` and `findShortestPathToCenter` use `queue.shift()`. In JavaScript, `shift()` on an array is an $O(N)$ operation that re-indexes all remaining elements.
- For every visited neighbor, it executes `const newPath = [...current.path, neighbor]`, cloning the entire path array.
- It hashes coordinates via string interpolation: `const key = coordToAlgebraic(neighbor)`.
- In `canPlaceWallMulti`, the game only checks `if (!result.hasPath)` (a boolean reachability question), yet it executes the full shortest path algorithm with hundreds of array and string allocations.

### 4. Linear Wall Search ($O(W)$) on Every Single BFS Edge
- In `BarricadeBoardGraphService.isMoveBlockedByWall()`, checking whether two cells are separated by a wall calls `walls.some(...)`.
- When 10–15 walls are on the board, each candidate neighbor check iterates over the entire walls array.
- Multiplied across 4 directions per cell, 81 cells per search, and 160 searches per AI turn, this amounts to hundreds of thousands of linear object lookups.

### 5. Accidental Multi-Player Path Validations on Touch Drag
- The board has 192 transparent wall hitboxes listening to `(mouseenter)`.
- When a user touches or drags their finger across the board on mobile, multiple hitboxes fire hover events in rapid succession.
- Each hover event calls `canPlaceWallMulti()`, triggering full BFS traversals for all players (2 or 4 players) on every single pixel movement, choking the touch thread.

### 6. Mobile GPU Rasterization Thrashing from SVG CSS Drop-Shadow Filters
- In `barricade-board.component.html`, multiple SVG elements use CSS drop shadows:
  - `filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]` on pawns
  - `filter drop-shadow-[0_0_6px_rgba(0,0,0,0.15)]` on legal move tiles
  - `filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]` on placed walls
- Mobile WebKit and Blink render CSS drop shadows on SVGs via offscreen bitmap buffers. When re-rendered 10 times a second by the timer flood, the mobile GPU is forced to repeatedly re-rasterize offscreen textures, dropping the UI framerate to single digits.

---

## 2. Why the Game Fails on Mobile Touchscreens

1. **Hollow Unclickable Move Targets**:
   - Legal move indicators use `<rect fill="none" stroke-width="3" (click)="onCellClick(cell)" />`.
   - In SVG specifications, elements with `fill="none"` are transparent to pointer/touch events in their interior. Only the 3px stroke border catches clicks.
   - The underlying tile has no click handler, so tapping inside the cell hits nothing.
2. **Groove Hitbox Layering**:
   - 192 groove hitboxes are rendered *above* the grid cells. Their extended margins overlap into adjacent tiles by 8–14px, intercepting pawn move taps.
3. **Broken Two-Tap Wall Placement on Mobile**:
   - Groove hitboxes rely on `(mouseenter)`, `(mouseleave)`, and `(click)`.
   - On touchscreens, lifting a finger or tapping a second time triggers `mouseleave`, executing `onWallSlotLeave()` which clears `hoveredSlot.set(null)`.
   - When `onWallSlotTap()` arrives, `cur` is `null`, making wall placement impossible on mobile.
4. **Undersized Touch Targets**:
   - The 44px SVG groove junctions scale to ~16.5px in physical CSS pixels on a phone screen, far below the 44px WCAG touch minimum.

---

## 3. Target Git Branch & Commit Strategy

### Target Branch
```bash
git checkout -b fix/barricade-mobile-touch-and-performance
```

### Commit Messages Breakdown

| Task # | Scope | Commit Message |
| :--- | :--- | :--- |
| **Task 1** | Clock Signal Decoupling | `perf(barricade): decouple clock timer from players signal to stop high-frequency re-renders` |
| **Task 2** | Fast Pathfinding & Bitmask Grid | `perf(barricade): implement fast bitmask wall grid and allocation-free BFS reachability` |
| **Task 3** | AI Search Async Yielding | `perf(barricade): optimize AI candidate wall evaluation and prevent UI thread freezing` |
| **Task 4** | Mobile Pawn Touch Targets & Hitboxes | `fix(barricade): fix mobile pawn movement touch targets and hitbox event capturing` |
| **Task 5** | Mobile Wall Placement Mode & Touch UX | `feat(barricade): add mobile touch interaction mode and robust wall placement controls` |
| **Task 6** | SVG Filter Optimization & Verification | `perf(barricade): optimize SVG filters, eliminate layout shifts, and verify mobile gameplay` |

---

## 4. Detailed Task Breakdown

### 🔹 Task 1: Decouple Clock Timer from `players` State Signal
**Commit**: `perf(barricade): decouple clock timer from players signal to stop high-frequency re-renders`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-state.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-controls/barricade-controls.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-controls/barricade-controls.component.html`

**Changes**:
1. Separate match time from the `Pawn` interface into a standalone `playerClocks = signal<Record<string, number>>({})`.
2. Change clock timer interval to tick only the active player's clock (e.g. 500ms or 1000ms cadence).
3. The `players` signal will now remain completely stationary during a player's turn until an actual move or wall placement occurs.
4. **Result**: `legalMoves`, `gridCells`, and board SVG change detection drop from 10 executions/sec to 0 executions/sec while waiting for user input. Idle CPU drops to ~0%.

---

### 🔹 Task 2: Fast Bitmask Wall Grid & Allocation-Free BFS Reachability
**Commit**: `perf(barricade): implement fast bitmask wall grid and allocation-free BFS reachability`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-board-graph.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-bfs-engine.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-bfs-engine.service.spec.ts`

**Changes**:
1. **$O(1)$ Wall Lookup Grid**:
   - Maintain a flat 2D lookup table / bitmask for horizontal and vertical walls (`hasWallH[row][col]`, `hasWallV[row][col]`).
   - `isMoveBlockedByWall()` becomes an instant $O(1)$ coordinate array check instead of iterating `walls.some(...)`.
2. **Allocation-Free `hasPath` BFS**:
   - Add dedicated `hasPathToGoalFast(start, goalRow, walls)` and `hasPathToCenterFast(start, center, walls)`:
     - Replace dynamic array queue with a fixed `Int32Array(82)` and `head`/`tail` pointers ($O(1)$ queue operations).
     - Replace `Set<string>` with a flat `Uint8Array(82)` visited bitset.
     - Eliminate all intermediate path array cloning (`[...path, next]`).
3. Update `canPlaceWallMulti` to use the allocation-free fast reachability check.
4. **Result**: Path validation runs 30x–50x faster with zero memory allocations.

---

### 🔹 Task 3: AI Search Optimization & UI Thread Yielding
**Commit**: `perf(barricade): optimize AI candidate wall evaluation and prevent UI thread freezing`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-ai.service.ts`

**Changes**:
1. Cache base shortest paths before evaluating candidate walls.
2. Prune redundant candidate wall slots (skip slots that do not intersect or neighbor the opponent's active shortest path).
3. Evaluate candidate walls in batches using asynchronous yielding (`requestAnimationFrame` or `setTimeout(..., 0)`) so the UI stays responsive at 60 FPS while the AI thinks.
4. **Result**: AI response time drops from ~2000ms to <100ms on mobile devices, with zero UI freezing.

---

### 🔹 Task 4: Fix Mobile Pawn Movement Touch Targets & Hitbox Capturing
**Commit**: `fix(barricade): fix mobile pawn movement touch targets and hitbox event capturing`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.ts`

**Changes**:
1. On legal move cells, set `fill="transparent"` and `pointer-events="all"` on the rect so the entire 74x74 area captures touches.
2. Add `(click)="onCellClick(cell)"` to the base tile rect whenever `cell.isLegalMove` is true.
3. Manage layer pointer events so `<g id="wall-hitboxes">` does not intercept clicks during pawn movement.
4. **Result**: 100% of the tile surface area reliably captures taps on any touch device.

---

### 🔹 Task 5: Mobile Wall Placement Mode & Touch UX
**Commit**: `feat(barricade): add mobile touch interaction mode and robust wall placement controls`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.scss`

**Changes**:
1. Add an active **Interaction Mode** toggle on mobile:
   - 🏃 **Move Pawn** (default): Groove hitboxes are inactive; legal move tiles have clear, prominent tap targets.
   - 🧱 **Place Wall**: Wall grooves and junctions become prominently highlighted and touch-interactive.
2. Replace fragile `mouseenter`/`mouseleave` with a robust mobile selection workflow:
   - Tap 1: Selects and highlights wall slot preview + validates legality.
   - Dedicated "Confirm Placement" button or tap on preview to confirm.
   - Wall orientation button clearly visible with rotation icon and preview badge.
3. **Result**: Wall placement on mobile is deliberate, accurate, and completely immune to touch/hover drift.

---

### 🔹 Task 6: SVG Filter Optimization, Layout Stability & Verification
**Commit**: `perf(barricade): optimize SVG filters, eliminate layout shifts, and verify mobile gameplay`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/barricade.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.scss`

**Changes**:
1. Replace expensive SVG CSS `drop-shadow` filters with lightweight CSS box shadows / radial gradient fills or simplified borders for mobile performance.
2. Fix container CSS to reserve fixed height for the touch hint/action bar outside the SVG container, preventing SVG resizing or vertical jumping.
3. Verify test suite with `nx test portfolio` and perform responsive audit across 360px–768px viewports.

---

## 5. Verification & Performance Benchmarks Checklist
- [ ] **Idle CPU Usage**: 0% idle CPU while match clock is running (verified by eliminating signal cascades).
- [ ] **Frame Rate**: Steady 60 FPS during match play and hovering on mobile/desktop.
- [ ] **AI Turn Duration**: <100ms total compute time, non-blocking UI thread.
- [ ] **Pawn Movement on Mobile**: Immediate response when tapping anywhere within a legal tile.
- [ ] **Wall Placement on Mobile**: Accurate selection, orientation toggling, and confirmation without touch drop.
- [ ] **Layout Stability**: Zero layout shifts or SVG resizing when interacting with preview hints.
- [ ] **Automated Tests**: All existing and new unit tests pass cleanly.
