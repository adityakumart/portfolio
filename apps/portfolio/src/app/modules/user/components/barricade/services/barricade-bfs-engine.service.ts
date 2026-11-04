import { Injectable, inject } from '@angular/core';
import {
  CellCoord,
  Wall,
  WallCoord,
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
   * Enforces the fundamental Quoridor Fair-Play rule:
   * A wall may never be placed if it completely seals off either player from
   * reaching any cell of their designated goal row.
   */
  canPlaceWall(
    candidate: WallCoord,
    existingWalls: Wall[],
    player1Pos: CellCoord,
    player2Pos: CellCoord
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

    // 3. Verify Player 1 (Red) still has an open path to Row 9
    const p1Result = this.findShortestPathToGoal(player1Pos, 9, simulatedWalls);
    if (!p1Result.hasPath) {
      return false;
    }

    // 4. Verify Player 2 / Computer (Blue) still has an open path to Row 1
    const p2Result = this.findShortestPathToGoal(player2Pos, 1, simulatedWalls);
    if (!p2Result.hasPath) {
      return false;
    }

    return true;
  }
}
