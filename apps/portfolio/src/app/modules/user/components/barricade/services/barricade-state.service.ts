import { Injectable, computed, inject, signal } from '@angular/core';
import {
  ActionEconomyOption,
  AiDifficulty,
  BarricadeConfig,
  CellCoord,
  GameMode,
  GameStatus,
  MoveRecord,
  Pawn,
  PlayerCount,
  PlayerId,
  TimeControlMinutes,
  TurnActionUsage,
  TurnPhase,
  Wall,
  WallCoord,
  WallOrientation,
  areCoordsEqual,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeSoundService } from './barricade-sound.service';
import { ToastrService } from '../../../../../shared/services/toaster.service';

export interface BarricadeAiHandler {
  playTurn(): Promise<void>;
}

@Injectable({
  providedIn: 'root',
})
export class BarricadeStateService {
  private readonly graphService = inject(BarricadeBoardGraphService);
  private readonly bfsEngine = inject(BarricadeBfsEngineService);
  private readonly soundService = inject(BarricadeSoundService);
  private readonly toastr = inject(ToastrService);

  private aiHandler: BarricadeAiHandler | null = null;

  // --- Core State Signals ---
  readonly gameMode = signal<GameMode>('vs_computer');
  readonly playerCount = signal<PlayerCount>(2);
  readonly aiDifficulty = signal<AiDifficulty>('intro');
  readonly actionEconomy = signal<ActionEconomyOption>('1+0');
  readonly timeLimitMinutes = signal<TimeControlMinutes>(10);
  readonly status = signal<GameStatus>('lobby'); // Default to home lobby view
  readonly phase = signal<TurnPhase>('PLAYER_TURN');
  readonly currentPlayerIndex = signal<number>(0); // 0 to playerCount - 1
  readonly turnCount = signal<number>(1);
  readonly turnActionUsage = signal<TurnActionUsage>({ stepsTaken: 0, wallsPlaced: 0 });
  readonly winReason = signal<'goal_reached' | 'timeout' | 'resignation' | null>(null);

  readonly players = signal<Pawn[]>([
    {
      id: 'p1',
      playerId: 'player1',
      name: 'Player 1 (You)',
      color: 'red',
      position: { row: 1, col: 5 }, // 'e1'
      startPosition: { row: 1, col: 5 },
      goalTargetType: 'row',
      goalRow: 9,
      wallsRemaining: 10,
      isComputer: false,
      timeRemainingMs: 600000,
    },
    {
      id: 'p2',
      playerId: 'player2',
      name: 'Computer (Intro)',
      color: 'blue',
      position: { row: 9, col: 5 }, // 'e9'
      startPosition: { row: 9, col: 5 },
      goalTargetType: 'row',
      goalRow: 1,
      wallsRemaining: 10,
      isComputer: true,
      timeRemainingMs: 600000,
    },
  ]);

  readonly walls = signal<Wall[]>([]);
  readonly wallOrientation = signal<WallOrientation>('horizontal');
  readonly hoveredWallSlot = signal<WallCoord | null>(null);
  readonly previousOpponentTile = signal<CellCoord | null>(null); // For olive highlight
  readonly winner = signal<Pawn | null>(null);
  readonly moveHistory = signal<MoveRecord[]>([]);
  readonly isAiThinking = signal<boolean>(false);

  // --- Computed Projections ---
  readonly player1 = computed(() => this.players()[0]);
  readonly player2 = computed(() => this.players()[1]);
  readonly player3 = computed(() => this.players()[2] ?? null);
  readonly player4 = computed(() => this.players()[3] ?? null);
  readonly currentPlayer = computed(() => this.players()[this.currentPlayerIndex()]);
  readonly isPlayer1Active = computed(() => this.currentPlayerIndex() === 0);
  readonly isGameOver = computed(() => this.phase() === 'GAME_OVER');
  readonly canUndo = computed(() => this.moveHistory().length > 0 && !this.isGameOver());
  readonly isFourPlayer = computed(() => this.playerCount() === 4);

  /**
   * Legal moves for the current active player.
   */
  readonly legalMoves = computed(() => {
    if (this.isGameOver() || this.isAiThinking()) {
      return [];
    }
    const current = this.currentPlayer();
    const otherPawns = this.players()
      .filter((_, idx) => idx !== this.currentPlayerIndex() && !_.isEliminated)
      .map((p) => p.position);
    return this.graphService.getLegalPawnMovesMulti(
      current.position,
      otherPawns,
      this.walls()
    );
  });

  registerAiHandler(handler: BarricadeAiHandler): void {
    this.aiHandler = handler;
  }

  goToLobby(): void {
    this.status.set('lobby');
  }

  resumeGame(): void {
    this.status.set('playing');
  }

  startConfiguredGame(config: BarricadeConfig): void {
    this.gameMode.set(config.gameMode);
    this.playerCount.set(config.playerCount);
    this.aiDifficulty.set(config.aiDifficulty);
    this.actionEconomy.set(config.actionEconomy);
    this.timeLimitMinutes.set(config.timeLimitMinutes);
    this.turnActionUsage.set({ stepsTaken: 0, wallsPlaced: 0 });
    this.currentPlayerIndex.set(0);
    this.turnCount.set(1);
    this.walls.set([]);
    this.moveHistory.set([]);
    this.hoveredWallSlot.set(null);
    this.previousOpponentTile.set(null);
    this.winner.set(null);
    this.winReason.set(null);
    this.isAiThinking.set(false);
    this.phase.set('PLAYER_TURN');
    this.status.set('playing');

    const matchDurationMs = config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 * 1000 : 0;
    const initialWalls = config.playerCount === 4 ? 5 : 10;

    const startCoords: Record<number, { pos: CellCoord; id: PlayerId }> = {
      0: { pos: { row: 1, col: 5 }, id: 'player1' }, // South (e1)
      1: { pos: { row: 9, col: 5 }, id: 'player2' }, // North (e9)
      2: { pos: { row: 5, col: 1 }, id: 'player3' }, // West (a5)
      3: { pos: { row: 5, col: 9 }, id: 'player4' }, // East (i5)
    };

    const newPlayers: Pawn[] = config.players.map((draft, idx) => {
      const is4P = config.playerCount === 4;
      const coordInfo = startCoords[idx];
      return {
        id: `p${idx + 1}`,
        playerId: coordInfo.id,
        name: draft.name,
        color: draft.color,
        position: { ...coordInfo.pos },
        startPosition: { ...coordInfo.pos },
        goalTargetType: is4P ? 'center' : 'row',
        goalRow: is4P ? undefined : (idx === 0 ? 9 : 1),
        goalCoord: is4P ? { row: 5, col: 5 } : undefined,
        wallsRemaining: initialWalls,
        isComputer: draft.isComputer,
        timeRemainingMs: matchDurationMs,
      };
    });

    this.players.set(newPlayers);
  }

  /**
   * Initializes or restarts the game match.
   */
  initGame(
    mode: GameMode = this.gameMode(),
    difficulty: AiDifficulty = this.aiDifficulty()
  ): void {
    this.gameMode.set(mode);
    this.aiDifficulty.set(difficulty);
    this.currentPlayerIndex.set(0);
    this.phase.set('PLAYER_TURN');
    this.status.set('playing');
    this.winner.set(null);
    this.turnCount.set(1);
    this.walls.set([]);
    this.hoveredWallSlot.set(null);
    this.previousOpponentTile.set(null);
    this.moveHistory.set([]);
    this.isAiThinking.set(false);

    const isP2Computer = mode === 'vs_computer';
    const p2Name = isP2Computer
      ? `Computer (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`
      : 'Player 2';

    this.players.set([
      {
        id: 'p1',
        playerId: 'player1',
        name: mode === 'vs_computer' ? 'Player 1 (You)' : 'Player 1',
        color: 'red',
        position: { row: 1, col: 5 },
        goalRow: 9,
        wallsRemaining: 10,
        isComputer: false,
      },
      {
        id: 'p2',
        playerId: 'player2',
        name: p2Name,
        color: 'blue',
        position: { row: 9, col: 5 },
        goalRow: 1,
        wallsRemaining: 10,
        isComputer: isP2Computer,
      },
    ]);
  }

  /**
   * Sets the game board directly to a given scenario (useful for presets or matching reference setups).
   */
  setScenario(
    p1Pos: CellCoord,
    p2Pos: CellCoord,
    walls: Wall[],
    prevTile: CellCoord | null = null,
    p1Walls = 7,
    p2Walls = 10
  ): void {
    this.previousOpponentTile.set(prevTile);
    this.walls.set(walls);
    const p = this.players();
    this.players.set([
      { ...p[0], position: p1Pos, wallsRemaining: p1Walls },
      { ...p[1], position: p2Pos, wallsRemaining: p2Walls },
    ]);
  }

  /**
   * Moves active player's pawn to a designated target square.
   */
  movePawn(target: CellCoord): boolean {
    if (this.isGameOver() || this.isAiThinking()) return false;

    const validMoves = this.legalMoves();
    const move = validMoves.find((m) => areCoordsEqual(m.target, target));
    if (!move) {
      this.soundService.playInvalid();
      return false;
    }

    const currentPawn = this.currentPlayer();
    const p1 = this.players()[0];
    const p2 = this.players()[1];

    // Record for undo history
    const historyEntry: MoveRecord = {
      turnNumber: this.turnCount(),
      playerId: currentPawn.playerId,
      action: {
        type: 'pawn',
        playerId: currentPawn.playerId,
        from: currentPawn.position,
        to: target,
        isJump: move.isJump,
      },
      previousPlayer1Pos: p1.position,
      previousPlayer2Pos: p2.position,
      previousPlayer1Walls: p1.wallsRemaining,
      previousPlayer2Walls: p2.wallsRemaining,
      timestamp: Date.now(),
    };

    this.moveHistory.update((h) => [...h, historyEntry]);

    // Save previous tile if player 2 moved
    if (this.currentPlayerIndex() === 1) {
      this.previousOpponentTile.set(currentPawn.position);
    }

    // Update pawn position
    this.players.update((plist) => {
      const idx = this.currentPlayerIndex();
      const updated = [...plist] as [Pawn, Pawn];
      updated[idx] = { ...updated[idx], position: target };
      return updated;
    });

    this.soundService.playMove();

    // Check Victory
    if (target.row === currentPawn.goalRow) {
      this.winner.set(this.players()[this.currentPlayerIndex()]);
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.soundService.playVictory();
      this.toastr.success(`${currentPawn.name} wins the match!`, {
        description: 'Victory!',
      });
      return true;
    }

    // Advance turn
    this.advanceTurn();
    return true;
  }

  /**
   * Attempts to place a 2-cell wall at the specified groove coordinate.
   */
  placeWall(slot: WallCoord): boolean {
    if (this.isGameOver() || this.isAiThinking()) return false;

    const currentPawn = this.currentPlayer();
    if (currentPawn.wallsRemaining <= 0) {
      this.soundService.playInvalid();
      this.toastr.warning('No walls remaining in your inventory!', {
        description: 'Wall Limit',
      });
      return false;
    }

    const p1 = this.players()[0];
    const p2 = this.players()[1];

    const isLegal = this.bfsEngine.canPlaceWallMulti(
      slot,
      this.walls(),
      this.players()
    );

    if (!isLegal) {
      this.soundService.playInvalid();
      this.toastr.error(
        'Invalid wall placement! Walls cannot overlap, intersect, or completely block a player from reaching their goal.',
        { description: 'Illegal Placement' }
      );
      return false;
    }

    const newWall: Wall = {
      id: `wall_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      row: slot.row,
      col: slot.col,
      orientation: slot.orientation,
      placedBy: currentPawn.playerId,
    };

    // Record for undo history
    const historyEntry: MoveRecord = {
      turnNumber: this.turnCount(),
      playerId: currentPawn.playerId,
      action: {
        type: 'wall',
        playerId: currentPawn.playerId,
        wall: newWall,
      },
      previousPlayer1Pos: p1.position,
      previousPlayer2Pos: p2.position,
      previousPlayer1Walls: p1.wallsRemaining,
      previousPlayer2Walls: p2.wallsRemaining,
      timestamp: Date.now(),
    };

    this.moveHistory.update((h) => [...h, historyEntry]);

    // Append wall and deduct count
    this.walls.update((w) => [...w, newWall]);
    this.players.update((plist) => {
      const idx = this.currentPlayerIndex();
      const updated = [...plist] as [Pawn, Pawn];
      updated[idx] = {
        ...updated[idx],
        wallsRemaining: updated[idx].wallsRemaining - 1,
      };
      return updated;
    });

    this.soundService.playWallPlace();
    this.hoveredWallSlot.set(null);

    // Advance turn
    this.advanceTurn();
    return true;
  }

  toggleWallOrientation(): void {
    const next =
      this.wallOrientation() === 'horizontal' ? 'vertical' : 'horizontal';
    this.wallOrientation.set(next);
  }

  setHoveredWallSlot(slot: WallCoord | null): void {
    this.hoveredWallSlot.set(slot);
  }

  /**
   * Switches turn to the other player and triggers AI if applicable.
   */
  private advanceTurn(): void {
    const nextIndex = 1 - this.currentPlayerIndex();
    this.currentPlayerIndex.set(nextIndex);
    this.turnCount.update((c) => c + 1);

    const nextPlayer = this.players()[nextIndex];
    if (nextPlayer.isComputer && !this.isGameOver()) {
      this.phase.set('AI_THINKING');
      this.isAiThinking.set(true);

      setTimeout(() => {
        if (this.aiHandler && !this.isGameOver()) {
          this.aiHandler.playTurn().finally(() => {
            this.isAiThinking.set(false);
            if (!this.isGameOver()) {
              this.phase.set('PLAYER_TURN');
            }
          });
        } else {
          this.isAiThinking.set(false);
          this.phase.set('PLAYER_TURN');
        }
      }, 400);
    } else {
      this.phase.set('PLAYER_TURN');
    }
  }

  /**
   * Reverts the most recent move(s). In AI mode, rolls back 2 moves. In 2P mode, rolls back 1 move.
   */
  undo(): void {
    if (!this.canUndo()) return;

    const history = this.moveHistory();
    if (history.length === 0) return;

    // Determine how many steps to pop
    const stepsToPop =
      this.gameMode() === 'vs_computer' && history.length >= 2 ? 2 : 1;
    const targetEntry = history[history.length - stepsToPop];

    // Restore walls up to target entry point
    const remainingHistory = history.slice(0, history.length - stepsToPop);
    const restoredWalls: Wall[] = [];
    for (const h of remainingHistory) {
      if (h.action.type === 'wall') {
        restoredWalls.push(h.action.wall);
      }
    }

    this.walls.set(restoredWalls);
    this.players.update((plist) => [
      {
        ...plist[0],
        position: targetEntry.previousPlayer1Pos,
        wallsRemaining: targetEntry.previousPlayer1Walls,
      },
      {
        ...plist[1],
        position: targetEntry.previousPlayer2Pos,
        wallsRemaining: targetEntry.previousPlayer2Walls,
      },
    ]);

    this.moveHistory.set(remainingHistory);
    this.currentPlayerIndex.set(0); // Return turn to Player 1
    this.phase.set('PLAYER_TURN');
    this.winner.set(null);
    this.status.set('playing');
    this.soundService.playMove();
  }

  /**
   * Concedes the game to the opponent.
   */
  resign(): void {
    if (this.isGameOver()) return;
    const opponent = this.players()[1 - this.currentPlayerIndex()];
    this.winner.set(opponent);
    this.phase.set('GAME_OVER');
    this.status.set('game_over');
    this.toastr.info(`${opponent.name} wins by resignation!`, {
      description: 'Match Ended',
    });
  }
}
