import { Injectable, inject } from '@angular/core';
import {
  Barricade,
  Player,
  Token,
  ValidMove,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import {
  BarricadeAiHandler,
  BarricadeStateService,
} from './barricade-state.service';

@Injectable({
  providedIn: 'root',
})
export class BarricadeAiService implements BarricadeAiHandler {
  private readonly stateService = inject(BarricadeStateService);
  private readonly graphService = inject(BarricadeBoardGraphService);
  private readonly bfsEngine = inject(BarricadeBfsEngineService);

  constructor() {
    // Register this AI service with the game state machine
    this.stateService.registerAiHandler(this);
  }

  /**
   * Main entry point called by the state service when it is the computer player's turn.
   */
  async playTurn(): Promise<void> {
    if (this.stateService.isGameOver()) {
      return;
    }

    const currentPhase = this.stateService.phase();

    if (currentPhase === 'WAITING_FOR_DICE') {
      // 1. Roll dice
      await this.delay(500);
      this.stateService.rollDice();

      // Check if turn was automatically passed (zero legal moves)
      await this.delay(400);
      if (
        this.stateService.phase() === 'DICE_ROLLED' ||
        this.stateService.phase() === 'TOKEN_SELECTED'
      ) {
        await this.executeMove();
      }
    } else if (
      currentPhase === 'DICE_ROLLED' ||
      currentPhase === 'TOKEN_SELECTED'
    ) {
      await this.executeMove();
    } else if (currentPhase === 'PLACING_BARRICADE') {
      await this.executeBarricadePlacement();
    }
  }

  /**
   * Evaluates all legal moves across all AI tokens and executes the highest-scoring move.
   */
  async executeMove(): Promise<void> {
    const aiPlayer = this.stateService.currentPlayer();
    const diceRoll = this.stateService.diceValue();
    if (!aiPlayer || !diceRoll) {
      return;
    }

    const allPlayers = this.stateService.players();
    const barricades = this.stateService.barricades();

    // Gather and score all possible moves
    interface CandidateMove {
      token: Token;
      move: ValidMove;
      score: number;
    }

    const candidates: CandidateMove[] = [];

    for (const token of aiPlayer.tokens) {
      const moves = this.bfsEngine.calculateValidMoves(
        token,
        diceRoll,
        aiPlayer,
        allPlayers,
        barricades,
      );

      for (const move of moves) {
        const score = this.evaluateMove(move, token);
        candidates.push({ token, move, score });
      }
    }

    if (candidates.length === 0) {
      return;
    }

    // Sort descending by heuristic score
    candidates.sort((a, b) => b.score - a.score);
    const chosen = candidates[0];

    // Select token
    this.stateService.selectToken(chosen.token.id);
    await this.delay(400);

    // Execute move
    this.stateService.moveToken(chosen.move.targetNodeId);
  }

  /**
   * Multi-factor heuristic evaluation function:
   * - Summit Castle win: +10,000 pts
   * - Barricade breakthrough / capture: +500 pts
   * - Opponent token capture: +400 pts
   * - Upward elevation progress: +100 pts per row closer to summit
   * - Base mobilization: +200 pts for leaving start camp
   */
  evaluateMove(move: ValidMove, token: Token): number {
    let score = 0;

    // 1. Summit Castle Win (+10,000)
    if (move.targetNodeId === this.graphService.getCastleNodeId()) {
      return 10000;
    }

    // 2. Barricade Breakthrough / Capture (+500)
    if (move.capturesBarricade) {
      score += 500;
    }

    // 3. Opponent Token Knockout (+400)
    if (move.capturesOpponentTokenId) {
      score += 400;
    }

    // 4. Base Mobilization (+200)
    if (token.isInBase) {
      score += 200;
    }

    // 5. Upward elevation progress (+100 pts per row closer to summit)
    const targetNode = this.graphService.getNode(move.targetNodeId);
    if (targetNode) {
      // Castle is row 0, baseline is row 8
      const rowProgress = Math.max(0, 8 - targetNode.row);
      score += rowProgress * 100;
    }

    return score;
  }

  /**
   * Strategic Barricade Relocation:
   * Locates human opponent's leading token and places captured barricade on the
   * bottleneck directly ahead of them to hinder their ascent.
   */
  async executeBarricadePlacement(): Promise<void> {
    const targetNodeId = this.selectStrategicBarricadePlacement();
    if (targetNodeId) {
      await this.delay(600);
      this.stateService.relocateBarricade(targetNodeId);
    }
  }

  /**
   * Computes the best target node to place a captured barricade.
   */
  selectStrategicBarricadePlacement(): string | null {
    const allPlayers = this.stateService.players();
    const barricades = this.stateService.barricades();
    const humanPlayer = allPlayers.find((p) => !p.isComputer) || allPlayers[0];

    // Find human player's leading active token (closest to castle / lowest row number)
    let leadingTokenNode: { row: number; col: number; id: string } | null = null;
    for (const t of humanPlayer.tokens) {
      if (!t.isInBase) {
        const node = this.graphService.getNode(t.currentPosition);
        if (node) {
          if (!leadingTokenNode || node.row < leadingTokenNode.row) {
            leadingTokenNode = { row: node.row, col: node.col, id: node.id };
          }
        }
      }
    }

    // Strategic chokepoint bottlenecks in order of importance
    const bottleneckPriority = [
      'r1_c8',
      'r3_c6',
      'r3_c10',
      'r5_c4',
      'r5_c8',
      'r5_c12',
      'r7_c2',
      'r7_c5',
      'r7_c8',
      'r7_c11',
      'r7_c14',
    ];

    if (leadingTokenNode) {
      // Find eligible bottlenecks directly ahead of (above) the leading opponent token
      const bottlenecksAhead = bottleneckPriority.filter((nodeId) => {
        const node = this.graphService.getNode(nodeId);
        return (
          node &&
          node.row <= leadingTokenNode!.row &&
          this.bfsEngine.canPlaceBarricade(nodeId, allPlayers, barricades)
        );
      });

      if (bottlenecksAhead.length > 0) {
        return bottlenecksAhead[0];
      }
    }

    // Fallback 1: Any available strategic bottleneck
    for (const chokepointId of bottleneckPriority) {
      if (this.bfsEngine.canPlaceBarricade(chokepointId, allPlayers, barricades)) {
        return chokepointId;
      }
    }

    // Fallback 2: Any allowed board node
    const allowedNodes = this.graphService.getAllowedBarricadeNodeIds();
    for (const nodeId of allowedNodes) {
      if (this.bfsEngine.canPlaceBarricade(nodeId, allPlayers, barricades)) {
        return nodeId;
      }
    }

    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
