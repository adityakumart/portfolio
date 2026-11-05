import { Injectable, computed, inject, signal, OnDestroy } from '@angular/core';
import {
  ACTION_ECONOMY_CONFIGS,
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
export class BarricadeStateService implements OnDestroy {
  private readonly graphService = inject(BarricadeBoardGraphService);
  private readonly bfsEngine = inject(BarricadeBfsEngineService);
  private readonly soundService = inject(BarricadeSoundService);
  private readonly toastr = inject(ToastrService);

  private aiHandler: BarricadeAiHandler | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // --- Core State Signals ---
  readonly gameMode = signal<GameMode>('vs_computer');
  readonly playerCount = signal<PlayerCount>(2);
  readonly aiDifficulty = signal<AiDifficulty>('intro');
  readonly actionEconomy = signal<ActionEconomyOption>('1+0');
  readonly timeLimitMinutes = signal<TimeControlMinutes>(10);
  readonly status = signal<GameStatus>('lobby'); // Initial page is Home Lobby
  readonly phase = signal<TurnPhase>('PLAYER_TURN');
  readonly currentPlayerIndex = signal<number>(0);
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
  readonly previousOpponentTile = signal<CellCoord | null>(null); // For previous move highlight
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

  // --- Turn Action Economy Computed Rules ---
  readonly currentActionRules = computed(() => ACTION_ECONOMY_CONFIGS[this.actionEconomy()]);
  readonly stepsAllowed = computed(() => this.currentActionRules().stepsPerTurn);
  readonly wallsAllowed = computed(() => this.currentActionRules().wallsPerTurn);
  readonly stepsRemainingThisTurn = computed(() =>
    Math.max(0, this.stepsAllowed() - this.turnActionUsage().stepsTaken)
  );
  readonly wallsRemainingThisTurn = computed(() =>
    Math.max(0, this.wallsAllowed() - this.turnActionUsage().wallsPlaced)
  );
  readonly canEndTurnManually = computed(() => {
    const usage = this.turnActionUsage();
    return usage.stepsTaken > 0 || usage.wallsPlaced > 0;
  });

  /**
   * Legal moves for the current active player.
   */
  readonly legalMoves = computed(() => {
    if (this.isGameOver() || this.isAiThinking()) {
      return [];
    }
    const current = this.currentPlayer();
    if (current.isEliminated || this.stepsRemainingThisTurn() <= 0) {
      return [];
    }
    const otherPawns = this.players()
      .filter((_, idx) => idx !== this.currentPlayerIndex() && !_.isEliminated)
      .map((p) => p.position);
    return this.graphService.getLegalPawnMovesMulti(
      current.position,
      otherPawns,
      this.walls()
    );
  });

  ngOnDestroy(): void {
    this.stopClockTimer();
  }

  registerAiHandler(handler: BarricadeAiHandler): void {
    this.aiHandler = handler;
  }

  goToLobby(): void {
    this.status.set('lobby');
  }

  resumeGame(): void {
    this.status.set('playing');
  }

  /**
   * Initializes a new match using user-configured settings from the home lobby.
   */
  startConfiguredGame(config: BarricadeConfig): void {
    this.stopClockTimer();

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

    const matchDurationMs =
      config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 * 1000 : 0;
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
        goalRow: is4P ? undefined : idx === 0 ? 9 : 1,
        goalCoord: is4P ? { row: 5, col: 5 } : undefined,
        wallsRemaining: initialWalls,
        isComputer: draft.isComputer,
        timeRemainingMs: matchDurationMs,
      };
    });

    this.players.set(newPlayers);
    this.startClockTimer();
  }

  /**
   * Legacy init method for backward compatibility.
   */
  initGame(
    mode: GameMode = this.gameMode(),
    difficulty: AiDifficulty = this.aiDifficulty()
  ): void {
    const isAi = mode === 'vs_computer';
    this.startConfiguredGame({
      gameMode: mode,
      playerCount: mode === 'four_players' ? 4 : 2,
      aiDifficulty: difficulty,
      actionEconomy: this.actionEconomy(),
      timeLimitMinutes: this.timeLimitMinutes(),
      players: [
        { name: isAi ? 'Player 1 (You)' : 'Player 1', color: 'red', isComputer: false },
        { name: isAi ? `Computer (${difficulty})` : 'Player 2', color: 'blue', isComputer: isAi },
      ],
    });
  }

  /**
   * Sets up reference screenshot preset.
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

    if (this.stepsRemainingThisTurn() <= 0) {
      this.soundService.playInvalid();
      this.toastr.warning('No movement steps remaining for this turn!', {
        description: 'Step Limit',
      });
      return false;
    }

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
      previousPlayer2Pos: p2?.position ?? { row: 9, col: 5 },
      previousPlayer1Walls: p1.wallsRemaining,
      previousPlayer2Walls: p2?.wallsRemaining ?? 10,
      playersSnapshot: this.players().map((p) => ({
        playerId: p.playerId,
        position: { ...p.position },
        wallsRemaining: p.wallsRemaining,
        timeRemainingMs: p.timeRemainingMs ?? 0,
      })),
      timestamp: Date.now(),
    };

    this.moveHistory.update((h) => [...h, historyEntry]);

    // Save previous tile for opponent highlight
    if (this.currentPlayerIndex() !== 0) {
      this.previousOpponentTile.set(currentPawn.position);
    }

    // Update pawn position
    this.players.update((plist) => {
      const idx = this.currentPlayerIndex();
      const updated = [...plist];
      updated[idx] = { ...updated[idx], position: target };
      return updated;
    });

    // Increment steps taken
    this.turnActionUsage.update((u) => ({ ...u, stepsTaken: u.stepsTaken + 1 }));
    this.soundService.playMove();

    // Check Victory Condition
    const hasWon =
      currentPawn.goalTargetType === 'center'
        ? areCoordsEqual(target, currentPawn.goalCoord ?? { row: 5, col: 5 })
        : target.row === currentPawn.goalRow;

    if (hasWon) {
      this.winner.set(this.players()[this.currentPlayerIndex()]);
      this.winReason.set('goal_reached');
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.stopClockTimer();
      this.soundService.playVictory();
      this.toastr.success(
        `${currentPawn.name} wins! Reached the ${currentPawn.goalTargetType === 'center' ? 'Center Sanctum (e5)' : 'goal line'}!`,
        { description: 'Victory!' }
      );
      return true;
    }

    // Check if turn should auto-complete:
    const stepsExhausted = this.stepsRemainingThisTurn() <= 0;
    const wallsExhausted =
      this.wallsAllowed() === 0 ||
      this.wallsRemainingThisTurn() <= 0 ||
      this.currentPlayer().wallsRemaining <= 0;

    if (stepsExhausted && wallsExhausted) {
      this.endTurn();
    }

    return true;
  }

  /**
   * Attempts to place a 2-cell wall at the specified groove coordinate.
   */
  placeWall(slot: WallCoord): boolean {
    if (this.isGameOver() || this.isAiThinking()) return false;

    if (this.wallsAllowed() === 0) {
      this.soundService.playInvalid();
      this.toastr.warning('Barricade walls are disabled in this game mode!', {
        description: 'Sprint Mode',
      });
      return false;
    }

    if (this.wallsRemainingThisTurn() <= 0) {
      this.soundService.playInvalid();
      this.toastr.warning('Maximum walls placed for this turn!', {
        description: 'Wall Limit',
      });
      return false;
    }

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
      previousPlayer2Pos: p2?.position ?? { row: 9, col: 5 },
      previousPlayer1Walls: p1.wallsRemaining,
      previousPlayer2Walls: p2?.wallsRemaining ?? 10,
      playersSnapshot: this.players().map((p) => ({
        playerId: p.playerId,
        position: { ...p.position },
        wallsRemaining: p.wallsRemaining,
        timeRemainingMs: p.timeRemainingMs ?? 0,
      })),
      timestamp: Date.now(),
    };

    this.moveHistory.update((h) => [...h, historyEntry]);

    // Append wall and deduct count
    this.walls.update((w) => [...w, newWall]);
    this.players.update((plist) => {
      const idx = this.currentPlayerIndex();
      const updated = [...plist];
      updated[idx] = {
        ...updated[idx],
        wallsRemaining: updated[idx].wallsRemaining - 1,
      };
      return updated;
    });

    // Increment walls placed
    this.turnActionUsage.update((u) => ({ ...u, wallsPlaced: u.wallsPlaced + 1 }));
    this.soundService.playWallPlace();
    this.hoveredWallSlot.set(null);

    // Check if turn should auto-complete
    const stepsExhausted = this.stepsRemainingThisTurn() <= 0;
    const wallsExhausted =
      this.wallsRemainingThisTurn() <= 0 || this.currentPlayer().wallsRemaining <= 0;

    if (stepsExhausted && wallsExhausted) {
      this.endTurn();
    }

    return true;
  }

  /**
   * Concludes the active player's turn manually.
   */
  endTurn(): void {
    if (this.isGameOver()) return;
    this.turnActionUsage.set({ stepsTaken: 0, wallsPlaced: 0 });
    this.advanceTurn();
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
   * Advances turn rotation to the next active player and triggers AI if applicable.
   */
  private advanceTurn(): void {
    const total = this.playerCount();
    let nextIndex = (this.currentPlayerIndex() + 1) % total;
    let attempts = 0;
    while (this.players()[nextIndex]?.isEliminated && attempts < total) {
      nextIndex = (nextIndex + 1) % total;
      attempts++;
    }

    this.currentPlayerIndex.set(nextIndex);
    this.turnCount.update((c) => c + 1);
    this.turnActionUsage.set({ stepsTaken: 0, wallsPlaced: 0 });

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
   * Starts live countdown match clock.
   */
  private startClockTimer(): void {
    this.stopClockTimer();
    if (this.timeLimitMinutes() === 0) return;

    let lastTick = Date.now();
    this.timerInterval = setInterval(() => {
      if (this.status() !== 'playing' || this.isGameOver() || this.isAiThinking()) {
        lastTick = Date.now();
        return;
      }

      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;

      const currentIdx = this.currentPlayerIndex();
      const currentPawn = this.players()[currentIdx];
      if (!currentPawn || currentPawn.isEliminated) return;

      const newTime = Math.max(0, (currentPawn.timeRemainingMs ?? 0) - delta);

      // Warning tick if under 10 seconds
      if (
        newTime > 0 &&
        newTime <= 10000 &&
        Math.floor(newTime / 1000) !==
          Math.floor((currentPawn.timeRemainingMs ?? 0) / 1000)
      ) {
        this.soundService.playLowTimeTick();
      }

      this.players.update((plist) => {
        const copy = [...plist];
        copy[currentIdx] = { ...copy[currentIdx], timeRemainingMs: newTime };
        return copy;
      });

      if (newTime <= 0) {
        this.handleTimeout(currentPawn);
      }
    }, 100);
  }

  private stopClockTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private handleTimeout(timedOutPawn: Pawn): void {
    this.soundService.playInvalid();

    if (this.playerCount() === 2) {
      const winnerPawn =
        this.players().find((p) => p.id !== timedOutPawn.id) ?? this.players()[0];
      this.winner.set(winnerPawn);
      this.winReason.set('timeout');
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.stopClockTimer();
      this.soundService.playVictory();
      this.toastr.error(
        `${timedOutPawn.name} ran out of time! ${winnerPawn.name} wins!`,
        { description: 'Match Over - Timeout' }
      );
      return;
    }

    // 4-Player mode: eliminate timed-out player
    this.toastr.warning(
      `${timedOutPawn.name} ran out of time and has been eliminated!`,
      { description: 'Player Eliminated' }
    );

    this.players.update((plist) =>
      plist.map((p) =>
        p.id === timedOutPawn.id
          ? { ...p, isEliminated: true, timeRemainingMs: 0 }
          : p
      )
    );

    const activeRemaining = this.players().filter((p) => !p.isEliminated);
    if (activeRemaining.length === 1) {
      const soleWinner = activeRemaining[0];
      this.winner.set(soleWinner);
      this.winReason.set('timeout');
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.stopClockTimer();
      this.soundService.playVictory();
      this.toastr.success(
        `${soleWinner.name} is the sole survivor and wins the match!`,
        { description: 'Victory!' }
      );
      return;
    }

    this.advanceTurn();
  }

  /**
   * Reverts the most recent move(s).
   */
  undo(): void {
    if (!this.canUndo()) return;

    const history = this.moveHistory();
    if (history.length === 0) return;

    const stepsToPop =
      this.gameMode() === 'vs_computer' && history.length >= 2 ? 2 : 1;
    const targetEntry = history[history.length - stepsToPop];

    const remainingHistory = history.slice(0, history.length - stepsToPop);
    const restoredWalls: Wall[] = [];
    for (const h of remainingHistory) {
      if (h.action.type === 'wall') {
        restoredWalls.push(h.action.wall);
      }
    }

    this.walls.set(restoredWalls);

    // If we have player snapshots, restore all players accurately
    if (targetEntry.playersSnapshot && targetEntry.playersSnapshot.length > 0) {
      this.players.update((plist) =>
        plist.map((p) => {
          const snap = targetEntry.playersSnapshot?.find(
            (s) => s.playerId === p.playerId
          );
          if (snap) {
            return {
              ...p,
              position: snap.position,
              wallsRemaining: snap.wallsRemaining,
              timeRemainingMs: snap.timeRemainingMs,
            };
          }
          return p;
        })
      );
    } else {
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
    }

    this.moveHistory.set(remainingHistory);
    this.turnActionUsage.set({ stepsTaken: 0, wallsPlaced: 0 });
    this.currentPlayerIndex.set(0);
    this.phase.set('PLAYER_TURN');
    this.winner.set(null);
    this.winReason.set(null);
    this.status.set('playing');
    this.soundService.playMove();
  }

  /**
   * Concedes the game to the opponent(s).
   */
  resign(): void {
    if (this.isGameOver()) return;

    if (this.playerCount() === 2) {
      const opponent = this.players()[1 - this.currentPlayerIndex()];
      this.winner.set(opponent);
      this.winReason.set('resignation');
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.stopClockTimer();
      this.toastr.info(`${opponent.name} wins by resignation!`, {
        description: 'Match Ended',
      });
      return;
    }

    // 4-Player mode: eliminate resigning player
    const resigning = this.currentPlayer();
    this.toastr.info(`${resigning.name} resigned and is eliminated.`, {
      description: 'Player Resigned',
    });

    this.players.update((plist) =>
      plist.map((p) =>
        p.id === resigning.id ? { ...p, isEliminated: true } : p
      )
    );

    const activeRemaining = this.players().filter((p) => !p.isEliminated);
    if (activeRemaining.length === 1) {
      const soleWinner = activeRemaining[0];
      this.winner.set(soleWinner);
      this.winReason.set('resignation');
      this.phase.set('GAME_OVER');
      this.status.set('game_over');
      this.stopClockTimer();
      this.soundService.playVictory();
      return;
    }

    this.advanceTurn();
  }
}
