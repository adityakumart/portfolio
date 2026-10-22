import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Barricade,
  GameMode,
  GameState,
  GameTurnPhase,
  MoveRecord,
  Player,
  Token,
  ValidMove,
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

  // Optional AI handler registered by BarricadeAiService
  private aiHandler: BarricadeAiHandler | null = null;

  // --- Reactive Signals ---
  readonly gameMode = signal<GameMode>('two_players');
  readonly phase = signal<GameTurnPhase>('WAITING_FOR_DICE');
  readonly currentPlayerIndex = signal<number>(0);
  readonly diceValue = signal<number | null>(null);
  readonly selectedTokenId = signal<string | null>(null);
  readonly barricades = signal<Barricade[]>([]);
  readonly players = signal<Player[]>([]);
  readonly winner = signal<Player | null>(null);
  readonly capturedBarricadeId = signal<string | null>(null);
  readonly turnCount = signal<number>(1);
  readonly moveHistory = signal<MoveRecord[]>([]);

  // UI state signals
  readonly isRolling = signal<boolean>(false);
  readonly isAiThinking = signal<boolean>(false);
  readonly statusMessage = signal<string>('Roll the dice to start your turn.');

  // --- Computed Signals ---
  readonly currentPlayer = computed<Player>(
    () => this.players()[this.currentPlayerIndex()] || null,
  );

  readonly isCurrentPlayerComputer = computed<boolean>(
    () => this.currentPlayer()?.isComputer ?? false,
  );

  readonly selectedToken = computed<Token | null>(() => {
    const id = this.selectedTokenId();
    if (!id) return null;
    const player = this.currentPlayer();
    if (!player) return null;
    return player.tokens.find((t) => t.id === id) || null;
  });

  /**
   * List of token IDs belonging to the active player that have at least 1 legal move
   * with the current rolled dice value.
   */
  readonly tokensWithValidMoves = computed<string[]>(() => {
    const roll = this.diceValue();
    const player = this.currentPlayer();
    if (!roll || !player || this.phase() === 'WAITING_FOR_DICE' || this.phase() === 'PLACING_BARRICADE' || this.phase() === 'GAME_OVER') {
      return [];
    }

    const result: string[] = [];
    const allPlayers = this.players();
    const barricades = this.barricades();

    for (const token of player.tokens) {
      const moves = this.bfsEngine.calculateValidMoves(
        token,
        roll,
        player,
        allPlayers,
        barricades,
      );
      if (moves.length > 0) {
        result.push(token.id);
      }
    }

    return result;
  });

  /**
   * Legal moves for the currently selected token.
   */
  readonly validMoves = computed<ValidMove[]>(() => {
    const token = this.selectedToken();
    const roll = this.diceValue();
    const player = this.currentPlayer();

    if (!token || !roll || !player || (this.phase() !== 'TOKEN_SELECTED' && this.phase() !== 'DICE_ROLLED')) {
      return [];
    }

    return this.bfsEngine.calculateValidMoves(
      token,
      roll,
      player,
      this.players(),
      this.barricades(),
    );
  });

  readonly isGameOver = computed<boolean>(
    () => this.phase() === 'GAME_OVER' || !!this.winner(),
  );

  constructor() {
    this.initGame('two_players');
  }

  /**
   * Connects the AI handler to orchestrate automated computer turns.
   */
  registerAiHandler(handler: BarricadeAiHandler): void {
    this.aiHandler = handler;
  }

  /**
   * Initializes or resets the game board, players, tokens, and 11 default barricades.
   */
  initGame(mode: GameMode = this.gameMode()): void {
    this.gameMode.set(mode);
    this.winner.set(null);
    this.capturedBarricadeId.set(null);
    this.selectedTokenId.set(null);
    this.diceValue.set(null);
    this.turnCount.set(1);
    this.moveHistory.set([]);
    this.currentPlayerIndex.set(0);
    this.phase.set('WAITING_FOR_DICE');
    this.isRolling.set(false);
    this.isAiThinking.set(false);

    // Initialize 11 default barricades
    const defaultPositions = this.graphService.getDefaultBarricadePositions();
    const initialBarricades: Barricade[] = defaultPositions.map((pos, idx) => ({
      id: `barricade_${idx + 1}`,
      currentPosition: pos,
    }));
    this.barricades.set(initialBarricades);

    // Initialize 2 Players with 5 tokens each
    const p1Config = this.graphService.getPlayerStartPositions('blue');
    const p2Config = this.graphService.getPlayerStartPositions('red');

    const p1: Player = {
      id: 'p1',
      name: 'Player 1',
      color: 'blue',
      isComputer: false,
      startNodeId: p1Config.startNodeId,
      tokens: p1Config.baseSlots.map((basePos, i) => ({
        id: `p1_t${i + 1}`,
        ownerId: 'p1',
        currentPosition: basePos,
        basePosition: basePos,
        isInBase: true,
      })),
    };

    const isVsComputer = mode === 'vs_computer';
    const p2: Player = {
      id: 'p2',
      name: isVsComputer ? 'Computer (AI)' : 'Player 2',
      color: 'red',
      isComputer: isVsComputer,
      startNodeId: p2Config.startNodeId,
      tokens: p2Config.baseSlots.map((basePos, i) => ({
        id: `p2_t${i + 1}`,
        ownerId: 'p2',
        currentPosition: basePos,
        basePosition: basePos,
        isInBase: true,
      })),
    };

    this.players.set([p1, p2]);
    this.statusMessage.set(`${p1.name}'s turn. Roll the dice.`);
  }

  setGameMode(mode: GameMode): void {
    if (this.gameMode() !== mode) {
      this.initGame(mode);
    }
  }

  resetGame(): void {
    this.initGame(this.gameMode());
  }

  /**
   * Rolls the dice (1 to 6).
   * Checks for legal moves across all tokens. If zero legal moves exist,
   * automatically skips/passes the turn.
   */
  rollDice(forcedValue?: number): number {
    if (this.phase() !== 'WAITING_FOR_DICE' || this.isGameOver()) {
      return this.diceValue() || 0;
    }

    const value =
      forcedValue && forcedValue >= 1 && forcedValue <= 6
        ? forcedValue
        : Math.floor(Math.random() * 6) + 1;

    this.soundService.playDiceRoll();
    this.diceValue.set(value);
    const movableTokens = this.tokensWithValidMoves();

    if (movableTokens.length === 0) {
      // Automatic turn pass: No valid moves possible with rolled value
      this.toastr.info('No Legal Moves', {
        description: `Rolled a ${value}. No path available, passing turn.`,
      });
      this.statusMessage.set(
        `Rolled a ${value}. No legal moves possible! Passing turn...`,
      );
      this.selectedTokenId.set(null);
      this.phase.set('WAITING_FOR_DICE');
      this.advanceTurn();
      return value;
    }

    // If exactly 1 token is movable, auto-select it for smooth UX
    if (movableTokens.length === 1) {
      this.selectedTokenId.set(movableTokens[0]);
      this.phase.set('TOKEN_SELECTED');
      this.statusMessage.set(
        `Rolled a ${value}. Auto-selected token. Pick a destination.`,
      );
    } else {
      this.phase.set('DICE_ROLLED');
      this.statusMessage.set(`Rolled a ${value}. Choose a highlighted token to move.`);
    }

    return value;
  }

  /**
   * Selects an active player token to view and choose valid moves.
   */
  selectToken(tokenId: string): boolean {
    if (this.phase() !== 'DICE_ROLLED' && this.phase() !== 'TOKEN_SELECTED') {
      return false;
    }

    const player = this.currentPlayer();
    const token = player?.tokens.find((t) => t.id === tokenId);
    if (!token) {
      return false;
    }

    // Verify token has at least 1 legal move
    const moves = this.bfsEngine.calculateValidMoves(
      token,
      this.diceValue()!,
      player,
      this.players(),
      this.barricades(),
    );

    if (moves.length === 0) {
      return false;
    }

    this.selectedTokenId.set(tokenId);
    this.phase.set('TOKEN_SELECTED');
    this.statusMessage.set('Token selected. Click a highlighted node to move.');
    return true;
  }

  /**
   * Executes movement of the selected token to a legal target node.
   * Handles:
   * 1. Opponent piece knockout (sent back to base)
   * 2. Barricade capture (triggers PLACING_BARRICADE phase)
   * 3. Summit Castle win condition
   */
  moveToken(targetNodeId: string): boolean {
    if (this.phase() !== 'TOKEN_SELECTED') {
      return false;
    }

    const token = this.selectedToken();
    const validMove = this.validMoves().find((m) => m.targetNodeId === targetNodeId);
    if (!token || !validMove) {
      return false;
    }

    const player = this.currentPlayer();
    const fromNodeId = token.currentPosition;
    const diceRoll = this.diceValue()!;

    // 1. Move token to target
    this.soundService.playTokenMove();
    this.players.update((currentPlayers) => {
      return currentPlayers.map((p) => {
        if (p.id !== player.id) return p;
        return {
          ...p,
          tokens: p.tokens.map((t) => {
            if (t.id !== token.id) return t;
            return {
              ...t,
              currentPosition: targetNodeId,
              isInBase: false,
            };
          }),
        };
      });
    });

    // 2. Handle Opponent Knockout
    let capturedOpponentTokenId: string | undefined;
    if (validMove.capturesOpponentTokenId) {
      capturedOpponentTokenId = validMove.capturesOpponentTokenId;
      this.soundService.playKnockout();
      this.toastr.warning('Knockout!', {
        description: `${player.name} sent an opponent token back to start camp!`,
      });
      this.players.update((currentPlayers) => {
        return currentPlayers.map((p) => {
          if (p.id === player.id) return p;
          return {
            ...p,
            tokens: p.tokens.map((t) => {
              if (t.id !== capturedOpponentTokenId) return t;
              return {
                ...t,
                currentPosition: t.basePosition,
                isInBase: true,
              };
            }),
          };
        });
      });
    }

    // 3. Record move in history
    const record: MoveRecord = {
      turnNumber: this.turnCount(),
      playerId: player.id,
      playerName: player.name,
      tokenId: token.id,
      fromNodeId,
      toNodeId: targetNodeId,
      diceRoll,
      capturedBarricade: validMove.capturesBarricade,
      capturedOpponentTokenId,
      timestamp: Date.now(),
    };
    this.moveHistory.update((h) => [...h, record]);

    // 4. Check Summit Castle Win Condition
    if (targetNodeId === this.graphService.getCastleNodeId()) {
      this.winner.set(player);
      this.phase.set('GAME_OVER');
      this.soundService.playWinFanfare();
      this.toastr.success('Castle Conquered!', {
        description: `🎉 ${player.name} reached the Summit Castle and won the game!`,
      });
      this.statusMessage.set(`🎉 ${player.name} reached the Castle Summit and won the game!`);
      return true;
    }

    // 5. Handle Barricade Capture
    if (validMove.capturesBarricade) {
      // Find the captured barricade
      const barricade = this.barricades().find(
        (b) => b.currentPosition === targetNodeId,
      );
      if (barricade) {
        this.capturedBarricadeId.set(barricade.id);
        this.phase.set('PLACING_BARRICADE');
        this.soundService.playBarricadeCapture();
        this.toastr.warning('Barricade Captured!', {
          description: `${player.name} broke through a barricade and can now relocate it.`,
        });
        this.statusMessage.set(
          `Barricade captured! Click any vacant track node to relocate it.`,
        );

        // If computer captured the barricade, let AI handle relocation
        if (this.isCurrentPlayerComputer()) {
          this.triggerAiRelocation();
        }
        return true;
      }
    }

    // 6. Normal turn completion -> Advance turn
    this.advanceTurn();
    return true;
  }

  /**
   * Relocates a captured barricade to an eligible vacant board node.
   */
  relocateBarricade(targetNodeId: string): boolean {
    if (this.phase() !== 'PLACING_BARRICADE') {
      return false;
    }

    const barricadeId = this.capturedBarricadeId();
    if (!barricadeId) {
      return false;
    }

    const isValidPlacement = this.bfsEngine.canPlaceBarricade(
      targetNodeId,
      this.players(),
      this.barricades().filter((b) => b.id !== barricadeId),
    );

    if (!isValidPlacement) {
      return false;
    }

    // Update barricade position
    this.barricades.update((currentBarricades) => {
      return currentBarricades.map((b) => {
        if (b.id !== barricadeId) return b;
        return { ...b, currentPosition: targetNodeId };
      });
    });

    // Update last move record with relocation position
    this.moveHistory.update((history) => {
      if (history.length === 0) return history;
      const last = { ...history[history.length - 1], barricadeRelocatedTo: targetNodeId };
      return [...history.slice(0, -1), last];
    });

    this.soundService.playTokenMove();
    this.toastr.info('Barricade Deployed', {
      description: 'Obstacle relocated on the board.',
    });

    this.capturedBarricadeId.set(null);
    this.advanceTurn();
    return true;
  }

  /**
   * Advances the game turn to the next player.
   */
  private advanceTurn(): void {
    if (this.isGameOver()) return;

    const nextIndex = (this.currentPlayerIndex() + 1) % this.players().length;
    this.currentPlayerIndex.set(nextIndex);
    this.diceValue.set(null);
    this.selectedTokenId.set(null);
    this.phase.set('WAITING_FOR_DICE');
    this.turnCount.update((c) => c + 1);

    const nextPlayer = this.players()[nextIndex];
    this.statusMessage.set(`${nextPlayer.name}'s turn. Roll the dice.`);

    // If next player is computer AI, trigger their turn
    if (nextPlayer.isComputer) {
      this.triggerAiTurn();
    }
  }

  /**
   * Triggers computer AI turn execution.
   */
  private triggerAiTurn(): void {
    if (this.aiHandler) {
      this.isAiThinking.set(true);
      setTimeout(() => {
        this.aiHandler?.playTurn().finally(() => {
          this.isAiThinking.set(false);
        });
      }, 500);
    }
  }

  /**
   * Triggers computer AI barricade relocation.
   */
  private triggerAiRelocation(): void {
    if (this.aiHandler) {
      this.isAiThinking.set(true);
      setTimeout(() => {
        this.aiHandler?.playTurn().finally(() => {
          this.isAiThinking.set(false);
        });
      }, 500);
    }
  }

  /**
   * Returns current snapshot of full game state.
   */
  getSnapshot(): GameState {
    return {
      gameMode: this.gameMode(),
      phase: this.phase(),
      currentPlayerIndex: this.currentPlayerIndex(),
      players: this.players(),
      barricades: this.barricades(),
      diceValue: this.diceValue(),
      selectedTokenId: this.selectedTokenId(),
      capturedBarricadeId: this.capturedBarricadeId(),
      winner: this.winner(),
      turnCount: this.turnCount(),
    };
  }
}
