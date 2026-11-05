import { Injectable, inject } from '@angular/core';
import {
  CellCoord,
  Pawn,
  Wall,
  WallCoord,
  areCoordsEqual,
  coordToAlgebraic,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';

export interface BfsPathResult {
  hasPath: boolean;
  distance: number;
  path: CellCoord[];
}

@Injectable({
  providedIn: 'root',
})
export class BarricadeBfsEngineService {
  private readonly graphService = inject(BarricadeBoardGraphService);

  /**
   * Calculates the shortest path and minimum distance from a starting cell
   * to any cell on the designated goal row using Breadth-First Search.
   */
  findShortestPathToGoal(
    start: CellCoord,
    goalRow: number,
    walls: Wall[]
  ): BfsPathResult {
    // If already on goal row
    if (start.row === goalRow) {
      return { hasPath: true, distance: 0, path: [start] };
    }

    const queue: { coord: CellCoord; path: CellCoord[] }[] = [
      { coord: start, path: [start] },
    ];
    const visited = new Set<string>();
    visited.add(coordToAlgebraic(start));

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const dir of directions) {
        const neighbor: CellCoord = {
          row: current.coord.row + dir.dRow,
          col: current.coord.col + dir.dCol,
        };

        if (!this.graphService.isWithinBounds(neighbor.row, neighbor.col)) {
          continue;
        }

        const key = coordToAlgebraic(neighbor);
        if (visited.has(key)) {
          continue;
        }

        // Check wall collision
        if (this.graphService.isMoveBlockedByWall(current.coord, neighbor, walls)) {
          continue;
        }

        const newPath = [...current.path, neighbor];

        // Win condition reached!
        if (neighbor.row === goalRow) {
          return {
            hasPath: true,
            distance: newPath.length - 1,
            path: newPath,
          };
        }

        visited.add(key);
        queue.push({ coord: neighbor, path: newPath });
      }
    }

    return {
      hasPath: false,
      distance: Infinity,
      path: [],
    };
  }

  /**
   * Calculates the shortest path from start to a specific target cell (e.g. Center e5)
   * used in 4-player King-of-the-Hill mode.
   */
  findShortestPathToCenter(
    start: CellCoord,
    center: CellCoord = { row: 5, col: 5 },
    walls: Wall[]
  ): BfsPathResult {
    if (areCoordsEqual(start, center)) {
      return { hasPath: true, distance: 0, path: [start] };
    }

    const queue: { coord: CellCoord; path: CellCoord[] }[] = [
      { coord: start, path: [start] },
    ];
    const visited = new Set<string>();
    visited.add(coordToAlgebraic(start));

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const dir of directions) {
        const neighbor: CellCoord = {
          row: current.coord.row + dir.dRow,
          col: current.coord.col + dir.dCol,
        };

        if (!this.graphService.isWithinBounds(neighbor.row, neighbor.col)) {
          continue;
        }

        const key = coordToAlgebraic(neighbor);
        if (visited.has(key)) {
          continue;
        }

        if (this.graphService.isMoveBlockedByWall(current.coord, neighbor, walls)) {
          continue;
        }

        const newPath = [...current.path, neighbor];

        if (areCoordsEqual(neighbor, center)) {
          return {
            hasPath: true,
            distance: newPath.length - 1,
            path: newPath,
          };
        }

        visited.add(key);
        queue.push({ coord: neighbor, path: newPath });
      }
    }

    return {
      hasPath: false,
      distance: Infinity,
      path: [],
    };
  }

  /**
   * Enforces the Quoridor Fair-Play rule for 2 or 4 players:
   * A wall may never be placed if it completely seals off any active player from
   * reaching their designated goal (Row 9, Row 1, or Center e5).
   */
  canPlaceWallMulti(
    candidate: WallCoord,
    existingWalls: Wall[],
    players: Pawn[]
  ): boolean {
    // 1. Structural collision check (overlap, crossing, out of bounds)
    if (this.graphService.doesWallCollide(candidate, existingWalls)) {
      return false;
    }

    // 2. Simulate wall placement
    const simulatedWalls: Wall[] = [
      ...existingWalls,
      {
        id: 'simulation_test',
        row: candidate.row,
        col: candidate.col,
        orientation: candidate.orientation,
        placedBy: 'player1',
      },
    ];

    // 3. Verify that EVERY active, non-eliminated player has a valid open path
    for (const player of players) {
      if (player.isEliminated) {
        continue;
      }

      if (player.goalTargetType === 'center') {
        const centerTarget = player.goalCoord ?? { row: 5, col: 5 };
        const result = this.findShortestPathToCenter(player.position, centerTarget, simulatedWalls);
        if (!result.hasPath) {
          return false;
        }
      } else {
        const targetRow = player.goalRow ?? (player.playerId === 'player1' ? 9 : 1);
        const result = this.findShortestPathToGoal(player.position, targetRow, simulatedWalls);
        if (!result.hasPath) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Backward-compatible 2-player wall validity check.
   */
  canPlaceWall(
    candidate: WallCoord,
    existingWalls: Wall[],
    player1Pos: CellCoord,
    player2Pos: CellCoord
  ): boolean {
    const dummyPlayers: Pawn[] = [
      {
        id: 'p1',
        playerId: 'player1',
        name: 'Player 1',
        color: 'red',
        position: player1Pos,
        goalTargetType: 'row',
        goalRow: 9,
        wallsRemaining: 10,
        isComputer: false,
      },
      {
        id: 'p2',
        playerId: 'player2',
        name: 'Player 2',
        color: 'blue',
        position: player2Pos,
        goalTargetType: 'row',
        goalRow: 1,
        wallsRemaining: 10,
        isComputer: true,
      },
    ];

    return this.canPlaceWallMulti(candidate, existingWalls, dummyPlayers);
  }
}
