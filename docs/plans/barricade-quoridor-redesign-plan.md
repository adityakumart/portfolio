# Implementation Plan: 9x9 Barricade (Quoridor) Game Redesign

**Feature**: Redesign Barricade to Match 9x9 Grid (Quoridor) Reference UI & Mechanics  
**Target Branch**: `feat/barricade-quoridor-redesign`  
**Status**: Pending User Review  

---

## 1. Problem Statement & Comparison

The existing implementation in `apps/portfolio/src/app/modules/user/components/barricade` was built as the German board game **Barricade (Malefiz)** (pyramid graph, 5 tokens per player, dice rolling, moving towards a summit castle).

As clarified by the user's reference screenshot, the requested game is **Quoridor** (also known digitally as Barricade / Corridor / Blockade):
- **Board**: A 9x9 grid of rounded square tiles with ranks `1`–`9` and files `a`–`i`.
- **Pawns**: 1 pawn per player (Player 1 Red starts at `e1` aiming for rank `9`; Player 2 / Computer Blue starts at `e9` aiming for rank `1`).
- **Turn Action**: On each turn, a player either:
  1. **Moves their pawn** 1 step orthogonally (or jumps over an opponent if adjacent).
  2. **Places a 2-cell wall (barricade)** in the grooves between cells (horizontal or vertical) to obstruct the opponent.
- **Fair Play Rule**: A wall can **never** be placed if it completely seals off either player from reaching their goal line (both players must always have at least one open path).
- **Wall Inventory**: 10 walls per player, tracked with 10 segmented vertical pill meters.
- **UI & Layout**: Exact dark-mode aesthetics from the screenshot:
  - Deep dark charcoal board container with subtle red tint on row 9 and blue tint on row 1.
  - Highlighted hollow square outlines for legal pawn moves.
  - Olive/gold highlight for opponent's previous move (`b7`).
  - Right sidebar match panel with `< Lobby`, volume toggle, player cards with 10-segment wall meters, active-turn green border, `Undo`, and `Resign` buttons.

---

## 2. Target Git Branch & Commit Strategy

### Target Branch
```bash
git checkout -b feat/barricade-quoridor-redesign
```

### Commit Messages Breakdown

| Task # | Scope | Commit Message |
| :--- | :--- | :--- |
| **Task 1** | Shared Models & Interfaces | `feat(barricade): redefine shared interfaces and models for 9x9 grid game` |
| **Task 2** | Graph, Movement & BFS Rule Engine | `feat(barricade): implement 9x9 grid graph, wall collisions, and BFS path validation engine` |
| **Task 3** | 9x9 Game Board Component & Wall Placement | `feat(barricade): design 9x9 dark-themed board with wall slots, pawn moves, and goal accents` |
| **Task 4** | Match Sidebar Panel & Controls | `feat(barricade): implement sidebar match panel with segmented wall meters and game controls` |
| **Task 5** | AI Heuristic Engine & State Service | `feat(barricade): implement Quoridor AI heuristic engine and reactive state orchestrator` |
| **Task 6** | Win Dialog, Lobby View & Unit Tests | `feat(barricade): add win celebration dialog, lobby mode selector, and unit test suite` |

---

## 3. Detailed Task Breakdown

### 🔹 Task 1: Redefine Shared Interfaces & Domain Models
**Commit**: `feat(barricade): redefine shared interfaces and models for 9x9 grid game`  
**Files**:
- `apps/portfolio/src/app/shared/barricade/barricade-board.interface.ts`
- `apps/portfolio/src/app/shared/barricade/barricade-game.interface.ts`
- `apps/portfolio/src/app/shared/barricade/barricade-move.interface.ts`
- `apps/portfolio/src/app/shared/barricade/index.ts`

**Scope**:
- Replace Malefiz graph models with 9x9 coordinate system:
  - `CellCoord`: `{ row: number; col: number }` (rows 1–9, cols 1–9 / `a`–`i`).
  - `WallOrientation`: `'horizontal' | 'vertical'`.
  - `Wall`: `{ id: string; orientation: WallOrientation; row: number; col: number; placedBy: 'player1' | 'player2' }`.
  - `Pawn`: `{ id: string; player: 'player1' | 'player2'; color: 'red' | 'blue'; position: CellCoord; goalRow: number; wallsRemaining: number }`.
  - `MoveAction`:
    - Pawn Move: `{ type: 'move'; from: CellCoord; to: CellCoord; isJump: boolean }`
    - Wall Placement: `{ type: 'wall'; wall: Wall }`
  - `GameMode`: `'vs_computer' | 'two_players'`.
  - `AiDifficulty`: `'intro' | 'medium' | 'hard'`.
  - `GameStatus`: `'lobby' | 'playing' | 'game_over'`.
  - `TurnPhase`: `'PLAYER_TURN' | 'AI_THINKING' | 'GAME_OVER'`.

---

### 🔹 Task 2: 9x9 Grid Topology, Movement & Pathfinding Validation Engine
**Commit**: `feat(barricade): implement 9x9 grid graph, wall collisions, and BFS path validation engine`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-board-graph.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-bfs-engine.service.ts`
- Associated `.spec.ts` test files

**Scope**:
1. **Grid & Adjacency Calculation (`BarricadeBoardGraphService`)**:
   - 9x9 board representation with algebraic notation (`a1` to `i9`).
   - Wall obstruction lookup:
     - Horizontal wall at `(r, c)` blocks vertical movement between `(r, c) <-> (r+1, c)` and `(r, c+1) <-> (r+1, c+1)`.
     - Vertical wall at `(r, c)` blocks horizontal movement between `(r, c) <-> (r, c+1)` and `(r+1, c) <-> (r+1, c+1)`.
   - Calculate legal pawn steps (1 orthogonal square if not blocked by a wall or board boundary).
   - Pawn Jump Logic (Quoridor rule):
     - Straight jump over opponent pawn if adjacent and no wall behind opponent.
     - Diagonal jumps if there is a wall or edge directly behind opponent pawn.
2. **BFS Shortest Path & No-Trap Fair Play Engine (`BarricadeBfsEngineService`)**:
   - Compute shortest path and distance to goal row for any pawn (`row === 9` for Player 1, `row === 1` for Player 2).
   - `canPlaceWall(candidateWall, state)`:
     - Check bounds (1 <= row <= 8, 1 <= col <= 8).
     - Check overlap/intersection with existing walls.
     - **BFS validation**: Temporarily add wall and verify BFS finds a valid path to the goal row for BOTH Player 1 and Player 2. If either is blocked, return `false`.

---

### 🔹 Task 3: 9x9 Dark-Themed Board Component & Interactive Wall Placement
**Commit**: `feat(barricade): design 9x9 dark-themed board with wall slots, pawn moves, and goal accents`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-board/barricade-board.component.scss`

**Scope**:
- Match reference screenshot aesthetics:
  - Deep dark container (`#18181b` / `#121214`) with rounded outer border.
  - 9x9 grid of rounded square tiles (`bg-[#27272a]`).
  - Row 9 tinted with subtle burgundy/red overlay (`rgba(239, 68, 68, 0.12)`).
  - Row 1 tinted with subtle navy/blue overlay (`rgba(59, 130, 246, 0.12)`).
  - Column coordinate labels `a`–`i` along the bottom, Row labels `1`–`9` along the right.
  - Red circular pawn (`#ef4444`) with soft glow and Blue circular pawn (`#3b82f6`).
  - Previous move highlight: olive/gold square on opponent's last tile (e.g. `b7`).
  - Legal move targets: hollow rounded outline squares (`border-2 border-white/60`) on empty neighbor tiles (`e5, e3, d4, f4`).
- **Interactive Wall Groove System**:
  - Inter-cell gaps allowing horizontal (8x8) and vertical (8x8) wall positions.
  - Hover preview: shows translucent white/gray 2-cell wall.
  - Click to place, right-click / Space / toggle button to switch orientation.
  - Placed walls render as crisp, rounded white/light-gray bars (`#e2e8f0`) spanning 2 cells.
  - Red outline / invalid feedback if placement is illegal or traps a player.

---

### 🔹 Task 4: Match Sidebar Panel, Segmented Wall Meters & Controls
**Commit**: `feat(barricade): implement sidebar match panel with segmented wall meters and game controls`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-controls/barricade-controls.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-controls/barricade-controls.component.html`
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-controls/barricade-controls.component.scss`

**Scope**:
- Sidebar container styled exactly as in the screenshot:
  - **Header Bar**:
    - `< Lobby` back button.
    - Sound toggle button (`lucideVolume2` / `lucideVolumeX`).
    - More options menu (`...` / `lucideMoreHorizontal`) for reset, rules, and AI difficulty.
  - **Player Cards**:
    - **Computer Card**:
      - Blue dot `●` + `Computer (Intro)`.
      - 10 segmented vertical pill meters (blue filled bars) with `10/10` counter.
    - **Player 1 Card**:
      - Red dot `●` + `Player 1 (You)`.
      - Green active-turn border (`border-2 border-emerald-500/80` with dark card background).
      - 10 segmented vertical pill meters (active red bars + dimmed empty bars) with `7/10` counter.
  - **Bottom Action Buttons**:
    - Large rounded `Undo` button (rolls back the last move pair in AI mode or single move in 2P mode).
    - Large rounded `Resign` button with `lucideFlag` icon (with confirmation prompt).

---

### 🔹 Task 5: AI Heuristic Engine & Signals State Management
**Commit**: `feat(barricade): implement Quoridor AI heuristic engine and reactive state orchestrator`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-ai.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-state.service.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/services/barricade-sound.service.ts`

**Scope**:
- **AI Heuristic Logic**:
  - `Intro` level (as displayed in screenshot: `Computer (Intro)`):
    - 80% of turns: follows the shortest BFS path toward row 1.
    - 20% of turns: places a strategic wall in front of Player 1 if Player 1 is making fast progress.
  - `Medium / Hard` levels:
    - Path delta heuristic: evaluates `(my_shortest_path - player_shortest_path)`.
    - Samples candidate legal wall placements to maximize player's path while keeping own path short.
- **State Machine with Angular Signals**:
  - `pawnPlayer1`, `pawnPlayer2`, `placedWalls`, `currentPlayerIndex`, `phase`, `winner`.
  - Move history stack supporting full `undoLastMove()`.
  - Web Audio sound effects for pawn step, wall place, error/invalid move, and victory.

---

### 🔹 Task 6: Win Celebration Dialog, Lobby View & Comprehensive Tests
**Commit**: `feat(barricade): add win celebration dialog, lobby mode selector, and unit test suite`  
**Files**:
- `apps/portfolio/src/app/modules/user/components/barricade/components/barricade-win-dialog/barricade-win-dialog.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/barricade.component.ts`
- `apps/portfolio/src/app/modules/user/components/barricade/barricade.component.html`
- Comprehensive Unit Tests (`.spec.ts`) across all services and components

**Scope**:
- Victory Dialog: Spartan-themed dialog congratulating winner with turn stats and "Play Again" button.
- Lobby Mode Selector: Quick screen or modal to choose "Vs Computer (Intro / Medium / Hard)" or "Pass & Play (2 Players)".
- Unit Tests:
  - Pawn legal moves and jump logic (straight & diagonal).
  - Wall placement validity and BFS fair-play no-trap check.
  - Wall inventory decrement and limit enforcement (10 max).
  - Undo history rollback.
  - Victory detection on row 9 (Player 1) and row 1 (Player 2).

---

## 4. Verification & Testing Plan

1. **Rule Verification**:
   - Pawn moves 1 step; cannot cross board bounds or walls.
   - Pawn jumps work when facing opponent.
   - Walls span exactly 2 cells horizontally or vertically in inter-cell gaps.
   - Walls cannot overlap or intersect existing walls.
   - Wall cannot be placed if it traps any player from reaching their goal row.
2. **UI & Visual Alignment**:
   - Compare side-by-side with screenshot: dark 9x9 board, row 9 red tint, row 1 blue tint, pawn colors, hollow square move outlines, previous move highlight on b7, 10-bar wall meters, active-turn green border.
3. **Automated Testing**:
   - Run `pnpm nx test portfolio` or targeted test suite to verify graph, BFS, AI, and state machine.
   - Run `npx nx build portfolio --configuration development` to ensure clean compile without errors.

