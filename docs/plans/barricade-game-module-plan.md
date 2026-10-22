# Implementation Plan: Barricade (Malefiz) Board Game Module

**Feature**: Barricade Board Game Module with 2-Player & Computer AI Modes  
**Status**: Pending User Review  
**Target Branch**: `feat/barricade-board-game-module`  
*(Note: As requested, this plan file will not be committed into Git)*

---

## 1. Overview & Objectives

Implement the classic **Barricade (Malefiz)** board game in the user module of the Angular application:
1. **Game Navigation**: Update the navigation menu to group games under a dedicated **Games** / **Game Menu**, presenting **Telugu Movie Guesser** (`/user/game`) and the new **Barricade** game (`/user/barricade`).
2. **Shared Interfaces**: Create a dedicated `barricade` folder in the shared layer (`apps/portfolio/src/app/shared/barricade/`) housing all data models and type definitions.
3. **Core Gameplay & Rules**:
   - Pyramid board graph topology with Castle goal at the summit, bottleneck pathways, and 11 starting barricades.
   - Breadth-First Search (BFS) movement calculation engine respecting Barricade obstruction (cannot pass *through* a barricade, but can land *on* it to capture it).
   - Collision resolution: capturing opponent tokens (returns them to start camp) and capturing barricades (triggers dynamic barricade relocation).
   - Win condition when a token reaches the summit Castle node.
4. **Game Modes**:
   - **Two Players Mode**: Pass & Play local multiplayer with turn indicator and token highlighting.
   - **Computer Mode (AI)**: Intelligent AI opponent with automated rolling, heuristic token movement, and strategic defensive barricade placement.
5. **Modern Spartan UI & Signals**:
   - Built with Angular Signals (`signal`, `computed`, `effect`) and `ChangeDetectionStrategy.OnPush`.
   - Scalable, responsive SVG board layout with glow effects and dynamic token groups.
   - Spartan UI components (`@spartan-ng/hel/card`, `@spartan-ng/hel/button`, `@spartan-ng/hel/badge`, `@spartan-ng/hel/dialog`).

---

## 2. Architecture & File Structure

```
apps/portfolio/src/app/
├── shared/
│   ├── barricade/                               <-- Shared Barricade Interfaces
│   │   ├── barricade-board.interface.ts         (BoardNode, BoardNodeType, BoardGraph)
│   │   ├── barricade-game.interface.ts          (Player, Token, Barricade, GameState, GameMode, GameTurnPhase)
│   │   ├── barricade-move.interface.ts          (ValidMove, MoveRecord)
│   │   └── index.ts                             (Public exports)
│   └── components/
│       └── sidebar/
│           └── sidebar.component.ts             (Update menuItems: 'Games' with Movie Guesser & Barricade)
│
└── modules/
    └── user/
        ├── user-routing.module.ts               (Register path: 'barricade')
        ├── services/
        │   └── user-modules.config.ts           (Add Barricade module entry)
        └── components/
            └── barricade/                       <-- New Barricade Game Module
                ├── barricade.component.ts       (Main container & layout)
                ├── barricade.component.html
                ├── barricade.component.scss
                ├── barricade.component.spec.ts  (Unit / Integration tests)
                ├── services/
                │   ├── barricade-board-graph.service.ts   (Pyramid node coordinates & adjacency graph)
                │   ├── barricade-bfs-engine.service.ts    (Pathfinding & legal move calculator)
                │   ├── barricade-ai.service.ts            (Heuristic AI logic for computer turns)
                │   └── barricade-state.service.ts         (Signals state machine & turn orchestrator)
                └── components/
                    ├── barricade-board/                   (SVG board, nodes, paths, tokens, barricades)
                    │   ├── barricade-board.component.ts
                    │   └── barricade-board.component.html
                    ├── barricade-controls/                (Dice roller, turn info, player cards)
                    │   ├── barricade-controls.component.ts
                    │   └── barricade-controls.component.html
                    ├── barricade-relocation-dialog/       (Spartan Dialog for barricade placement)
                    │   └── barricade-relocation-dialog.component.ts
                    └── barricade-win-dialog/              (Spartan Dialog for game over & winner celebration)
                        └── barricade-win-dialog.component.ts
```

---

## 3. Phased Implementation & Commit Breakdown

### 🔹 Phase 1: Shared Interfaces, Navigation Menu & Routing Setup
**Goal**: Establish the contract layer, navigation hierarchy, and application routing before building the game logic and UI.

#### Scope of Work:
1. **Shared Interfaces (`apps/portfolio/src/app/shared/barricade/`)**:
   - `barricade-board.interface.ts`:
     - `BoardNodeType`: `'start' | 'normal' | 'barricade' | 'castle'`
     - `BoardNode`: `id`, `x`, `y`, `type`, `neighbors`, `row`, `col`, `allowedForBarricade`
     - `BoardGraph`: Map of node ID to `BoardNode`
   - `barricade-game.interface.ts`:
     - `PlayerColor`: `'blue' | 'red' | 'green' | 'amber'`
     - `Player`: `id`, `name`, `color`, `isComputer`, `startNodeId`, `tokens: Token[]`
     - `Token`: `id`, `ownerId`, `currentPosition`, `basePosition`, `isInBase`
     - `Barricade`: `id`, `currentPosition`
     - `GameMode`: `'two_players' | 'vs_computer'`
     - `GameTurnPhase`: `'WAITING_FOR_DICE' | 'DICE_ROLLED' | 'TOKEN_SELECTED' | 'PLACING_BARRICADE' | 'GAME_OVER'`
   - `barricade-move.interface.ts`:
     - `ValidMove`: `targetNodeId`, `path: string[]`, `capturesBarricade: boolean`, `capturesOpponentTokenId?: string`
     - `MoveRecord`: history tracking for turn replay and stats
   - `index.ts`: export all interfaces for seamless importing.
2. **Game Menu Navigation (`sidebar.component.ts`)**:
   - Replace flat `{ label: 'Movie Guesser', link: '/user/game' }` with a grouped `Games` item having children:
     - `Barricade` (`/user/barricade`, icon: `lucideShieldAlert`)
     - `Telugu Movie Guesser` (`/user/game`, icon: `lucideFilm`)
   - Ensure both desktop sidebar and mobile off-canvas drawer handle the accordion/dropdown cleanly.
3. **User Routing & Module Config**:
   - Add `/user/barricade` lazy-loaded route in `user-routing.module.ts` with SEO metadata.
   - Add `barricade` entry in `user-modules.config.ts`.
   - Create initial shell component `BarricadeComponent`.

#### Phase 1 Commit Message:
```text
feat(barricade): add shared interfaces, game menu navigation, and routing setup

- Create shared barricade interfaces under apps/portfolio/src/app/shared/barricade/
- Group games under 'Games' menu in sidebar with Barricade and Telugu Movie Guesser
- Register lazy-loaded '/user/barricade' route with SEO tags in UserRoutingModule
- Add Barricade module definition in user-modules.config.ts
- Create initial Barricade shell component
```

---

### 🔹 Phase 2: Board Graph Topology & BFS Movement Engine
**Goal**: Build the mathematical graph network and the BFS movement calculator enforcing Barricade rules.

#### Scope of Work:
1. **Pyramid Board Graph (`BarricadeBoardGraphService`)**:
   - Build classic Malefiz pyramid graph:
     - Summit Castle node (`castle_1`) at Row 0.
     - Pyramid structure with branching corridors, bottlenecks, and choke points.
     - 11 initial Barricade positions placed at key chokepoint junctions.
     - Base camps for 2 players (Player 1 Blue, Player 2 Red) with 5 tokens each.
     - Undirected adjacency list (`neighbors` array for each node).
2. **BFS Pathfinding Engine (`BarricadeBfsEngineService`)**:
   - Breadth-First Search exploring paths of exact length `diceRoll` (1 to 6).
   - Enforce Barricade rules:
     - Tokens **cannot pass through** a Barricade along a path.
     - Exception: Tokens **can land on** a Barricade (last step == diceRoll), capturing it.
     - Friendly pieces block destination (cannot land on own token).
     - Opponent pieces can be landed on (captures opponent and resets them to base).
     - No backtracking on the same turn (simple acyclic paths).
   - Return array of `ValidMove` objects (target node, path, capture flags).
3. **Unit Tests**:
   - Test BFS movement for rolls 1–6.
   - Verify barricade blocking and capture exceptions.
   - Verify base start exit logic.

#### Phase 2 Commit Message:
```text
feat(barricade): implement graph network topology and BFS pathfinding engine

- Create BarricadeBoardGraphService generating classic pyramid board adjacency graph
- Configure 11 default barricade chokepoints and 2-player base starting nodes
- Implement BarricadeBfsEngineService for exact-roll simple path calculation
- Enforce barricade path obstruction with landing-on-barricade capture rule
- Add friendly collision prevention and opponent token capture detection
```

---

### 🔹 Phase 3: Signals Game State Machine & Computer AI Service
**Goal**: Implement the reactive game state management and the intelligent computer opponent.

#### Scope of Work:
1. **Game State Machine (`BarricadeStateService`)**:
   - Reactive state powered by Angular Signals:
     - `phase`: `signal<GameTurnPhase>('WAITING_FOR_DICE')`
     - `gameMode`: `signal<GameMode>('two_players')`
     - `currentPlayerIndex`: `signal<number>(0)`
     - `diceValue`: `signal<number | null>(null)`
     - `selectedTokenId`: `signal<string | null>(null)`
     - `validMoves`: `computed<ValidMove[]>(...)`
     - `barricades`: `signal<Barricade[]>(...)`
     - `players`: `signal<Player[]>(...)`
     - `winner`: `signal<Player | null>(null)`
   - State transition methods: `rollDice()`, `selectToken()`, `moveToken()`, `relocateBarricade()`, `resetGame()`, `setGameMode()`.
   - Automatic turn skip when no valid moves are possible with the rolled dice value.
2. **Computer AI Agent (`BarricadeAiService`)**:
   - Automated turn execution for AI player with human-like delays (500–800ms):
     - Auto-rolls dice.
     - Heuristic evaluation function scoring each possible move:
       - Summit Castle win: +10,000 pts
       - Barricade breakthrough / capture: +500 pts
       - Opponent token capture: +400 pts
       - Upward elevation progress: +100 pts per row closer to summit
       - Base mobilization: +200 pts for leaving start camp
     - Executes highest-scoring move.
   - **Strategic Barricade Relocation**:
     - When AI captures a barricade, locates human player's leading token and places barricade on the bottleneck directly ahead of them.

#### Phase 3 Commit Message:
```text
feat(barricade): implement Signals game state machine and computer AI agent

- Create BarricadeStateService managing game phases, dice roll, turns, and moves
- Implement Angular Signals-driven reactive state with OnPush change detection
- Create BarricadeAiService with multi-factor heuristic scoring for AI moves
- Add intelligent barricade relocation placing chokepoint blocks ahead of opponents
- Handle automatic turn pass when no legal moves are available
```

---

### 🔹 Phase 4: SVG Game Board & Spartan UI Component Layout
**Goal**: Build the visual board, interactive pieces, and Spartan UI controls and dialogs.

#### Scope of Work:
1. **Responsive SVG Game Board (`BarricadeBoardComponent`)**:
   - Scalable SVG with `viewBox="0 0 900 1000"` preserving aspect ratio across all devices.
   - Visual layers:
     - Connecting corridors & tracks (`<line>`, `<path>` with high-contrast board styling).
     - Node circles (`<circle>`):
       - Summit Castle: Golden crown/trophy emblem with ambient glow.
       - Barricade positions: Distinct hexagonal / warning markers.
       - Player bases: Color-coded circles for Player 1 (Blue) and Player 2 (Red).
     - Dynamic Token pieces: `<g>` elements with player color gradient, drop shadow, and owner initial.
     - Dynamic Barricade pieces: Red-and-white striped obstacle shields.
     - Move Highlights: Animated pulsing rings (`animate-pulse` / `animate-ping`) on legal target nodes.
   - Click interactions:
     - Clicking own token selects it and computes destination highlights.
     - Clicking highlighted destination executes move.
     - Clicking empty node during `PLACING_BARRICADE` relocates captured barricade.
2. **Game Controls Panel (`BarricadeControlsComponent`)**:
   - Header with Spartan Card, Badges, and Status:
     - Active player badge with color dot.
     - Phase instruction ("Roll Dice", "Pick a Token", "Place Barricade", etc.).
     - Game mode toggle: "2 Players (Pass & Play)" vs "Vs Computer (AI)".
   - Dice Roller:
     - Spartan Button (`hlmBtn`) with animated dice face and Tailwind `animate-spin` on roll.
   - New Game / Reset actions.
3. **Barricade Relocation Banner & Dialog (`BarricadeRelocationDialogComponent`)**:
   - Spartan Dialog / alert banner guiding player to click any vacant board node to place the captured barricade.
4. **Winner Celebration Dialog (`BarricadeWinDialogComponent`)**:
   - Spartan Dialog (`@spartan-ng/hel/dialog`) displaying winner name, trophy icon, turn statistics, and "Play Again" button.

#### Phase 4 Commit Message:
```text
feat(barricade): build SVG game board and Spartan UI game components

- Create BarricadeBoardComponent rendering scalable SVG pyramid board
- Render dynamic SVG groups for player tokens, barricades, and pulsing valid moves
- Create BarricadeControlsComponent with Spartan UI buttons, badges, and dice roller
- Implement BarricadeRelocationDialogComponent for captured barricade placement
- Implement BarricadeWinDialogComponent celebrating game victory
```

---

### 🔹 Phase 5: Native Polish, Animations & End-to-End Validation
**Goal**: Polish animations, illegal move handling, responsive styling, and complete test coverage.

#### Scope of Work:
1. **Polish & Animations**:
   - Smooth token transition animations across nodes using CSS / Angular transitions.
   - Sound / toast effects using Spartan Sonner (`toast`) on barricade captures, opponent sent to base, and wins.
   - Strict illegal move prevention (disabling board clicks outside active phase).
2. **Responsive Layout**:
   - Ensure SVG board scales seamlessly from mobile screens (375px) up to 4K displays.
   - Touch-friendly tap targets on mobile devices.
3. **Testing & Build Verification**:
   - Unit tests (`barricade.component.spec.ts`) validating 2-player game loop, AI turn loop, and win detection.
   - Run full build `npx nx build portfolio` and lint check to ensure zero regressions.

#### Phase 5 Commit Message:
```text
feat(barricade): add token path animations, UX polish, and test coverage

- Add smooth token transition animations and capture feedback toasts
- Optimize mobile touch responsiveness and SVG viewBox scaling
- Add comprehensive unit and integration specs for game loop and AI mode
- Verify production build and linting with zero errors
```

---

## 4. Summary of Phased Commits

| Phase | Scope | Commit Message |
|---|---|---|
| **Phase 1** | Shared Interfaces, Menu & Routing | `feat(barricade): add shared interfaces, game menu navigation, and routing setup` |
| **Phase 2** | Graph Network & BFS Movement Engine | `feat(barricade): implement graph network topology and BFS pathfinding engine` |
| **Phase 3** | Signals State Machine & AI Agent | `feat(barricade): implement Signals game state machine and computer AI agent` |
| **Phase 4** | SVG Board & Spartan UI Components | `feat(barricade): build SVG game board and Spartan UI game components` |
| **Phase 5** | UX Polish, Animations & Tests | `feat(barricade): add token path animations, UX polish, and test coverage` |
