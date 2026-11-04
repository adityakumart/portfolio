import { Injectable, inject } from '@angular/core';
import {
  CellCoord,
  WallCoord,
  WallOrientation,
  areCoordsEqual,
} from '../../../../../shared/barricade';
import { BarricadeStateService, BarricadeAiHandler } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';

@Injectable({
  providedIn: 'root',
})
export class BarricadeAiService implements BarricadeAiHandler {
  private readonly state = inject(BarricadeStateService);
  private readonly graph = inject(BarricadeBoardGraphService);
  private readonly bfs = inject(BarricadeBfsEngineService);

  constructor() {
    this.state.registerAiHandler(this);
  }

  /**
   * Main turn execution handler invoked automatically when AI's turn arrives.
   */
  async playTurn(): Promise<void> {
    if (this.state.isGameOver()) return;

    const aiPawn = this.state.player2();
    const playerPawn = this.state.player1();
    const walls = this.state.walls();
    const difficulty = this.state.aiDifficulty();

    const aiBfs = this.bfs.findShortestPathToGoal(aiPawn.position, 1, walls);
    const playerBfs = this.bfs.findShortestPathToGoal(playerPawn.position, 9, walls);

    // AI Winning in 1 step? Always take the winning step!
    const legalMoves = this.state.legalMoves();
    const winningMove = legalMoves.find((m) => m.target.row === 1);
    if (winningMove) {
      this.state.movePawn(winningMove.target);
      return;
    }

    // Decide between wall placement vs. pawn movement
    if (difficulty === 'intro') {
      this.playIntroMove(aiBfs.path, playerBfs.path, legalMoves);
    } else {
      this.playStrategicMove(aiBfs.path, playerBfs.path, legalMoves);
    }
  }

  /**
   * Intro AI: Prefers straightforward shortest path movement; occasionally places defensive walls.
   */
  private playIntroMove(
    aiPath: CellCoord[],
    playerPath: CellCoord[],
    legalMoves: { target: CellCoord; isJump: boolean }[]
  ): void {
    const aiPawn = this.state.player2();
    const shouldConsiderWall =
      aiPawn.wallsRemaining > 0 &&
      playerPath.length <= 4 &&
      Math.random() < 0.4;

    if (shouldConsiderWall) {
      const wallPlaced = this.tryPlaceInterferingWall(playerPath);
      if (wallPlaced) return;
    }

    // Move along shortest path
    this.moveAlongShortestPath(aiPath, legalMoves);
  }

  /**
   * Medium/Hard AI: Evaluates delta distance (player delay vs self delay) from candidate walls.
   */
  private playStrategicMove(
    aiPath: CellCoord[],
    playerPath: CellCoord[],
    legalMoves: { target: CellCoord; isJump: boolean }[]
  ): void {
    const aiPawn = this.state.player2();
    const playerPawn = this.state.player1();
    const walls = this.state.walls();

    // If opponent is closer to victory than AI and AI has walls, evaluate wall blocking
    const isPlayerAhead = playerPath.length <= aiPath.length;

    if (isPlayerAhead && aiPawn.wallsRemaining > 0) {
      const bestWall = this.findBestWall(playerPawn.position, aiPawn.position, walls, playerPath.length, aiPath.length);
      if (bestWall) {
        const success = this.state.placeWall(bestWall);
        if (success) return;
      }
    }

    // Otherwise, advance along shortest path
    this.moveAlongShortestPath(aiPath, legalMoves);
  }

  /**
   * Finds the next legal step along the BFS shortest path.
   */
  private moveAlongShortestPath(
    aiPath: CellCoord[],
    legalMoves: { target: CellCoord; isJump: boolean }[]
  ): void {
    if (aiPath.length > 1) {
      const nextStep = aiPath[1];
      const match = legalMoves.find((m) => areCoordsEqual(m.target, nextStep));
      if (match) {
        this.state.movePawn(match.target);
        return;
      }
    }

    // Fallback: pick the legal move that minimizes distance to row 1
    if (legalMoves.length > 0) {
      let bestMove = legalMoves[0];
      let minRow = bestMove.target.row;

      for (const m of legalMoves) {
        if (m.target.row < minRow) {
          minRow = m.target.row;
          bestMove = m;
        }
      }

      this.state.movePawn(bestMove.target);
    }
  }

  /**
   * Attempts to place a wall across the opponent's anticipated path.
   */
  private tryPlaceInterferingWall(playerPath: CellCoord[]): boolean {
    if (playerPath.length < 2) return false;

    const p1 = this.state.player1().position;
    const p2 = this.state.player2().position;
    const walls = this.state.walls();

    // Look at next 2 steps along player's path
    for (let i = 0; i < Math.min(3, playerPath.length - 1); i++) {
      const step = playerPath[i];
      const orientations: WallOrientation[] = ['horizontal', 'vertical'];

      for (const orientation of orientations) {
        const candidateSlots: WallCoord[] = [
          { row: step.row, col: step.col, orientation },
          { row: step.row, col: Math.max(1, step.col - 1), orientation },
          { row: Math.max(1, step.row - 1), col: step.col, orientation },
        ];

        for (const slot of candidateSlots) {
          if (this.bfs.canPlaceWall(slot, walls, p1, p2)) {
            return this.state.placeWall(slot);
          }
        }
      }
    }

    return false;
  }

  /**
   * Evaluates candidate walls to find one that maximizes player path delay without delaying AI.
   */
  private findBestWall(
    playerPos: CellCoord,
    aiPos: CellCoord,
    walls: any[],
    initialPlayerDist: number,
    initialAiDist: number
  ): WallCoord | null {
    let bestScore = -Infinity;
    let bestSlot: WallCoord | null = null;

    // Search around player's neighborhood (within 2 cells)
    const minR = Math.max(1, playerPos.row - 1);
    const maxR = Math.min(8, playerPos.row + 2);
    const minC = Math.max(1, playerPos.col - 2);
    const maxC = Math.min(8, playerPos.col + 2);

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        for (const orientation of ['horizontal', 'vertical'] as WallOrientation[]) {
          const candidate: WallCoord = { row: r, col: c, orientation };

          if (!this.bfs.canPlaceWall(candidate, walls, playerPos, aiPos)) {
            continue;
          }

          const simWalls = [
            ...walls,
            { id: 'sim', row: r, col: c, orientation, placedBy: 'player2' },
          ];

          const pBfs = this.bfs.findShortestPathToGoal(playerPos, 9, simWalls);
          const aBfs = this.bfs.findShortestPathToGoal(aiPos, 1, simWalls);

          const playerDelay = pBfs.distance - initialPlayerDist;
          const aiDelay = aBfs.distance - initialAiDist;
          const score = playerDelay * 2 - aiDelay;

          if (playerDelay > 0 && score > bestScore) {
            bestScore = score;
            bestSlot = candidate;
          }
        }
      }
    }

    return bestSlot;
  }
}
