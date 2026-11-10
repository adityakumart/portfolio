import { Injectable, inject } from '@angular/core';
import {
  CellCoord,
  Pawn,
  Wall,
  WallCoord,
  areCoordsEqual,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService, WallGrid } from './barricade-board-graph.service';

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
   * Ultra-fast boolean reachability check to goal row with zero allocations.
   */
  hasPathToGoalFast(
    start: CellCoord,
    goalRow: number,
    grid: WallGrid
  ): boolean {
    if (start.row === goalRow) return true;

    const queue = new Int32Array(81);
    const visited = new Uint8Array(81);

    let head = 0;
    let tail = 0;

    const startIdx = (start.row - 1) * 9 + (start.col - 1);
    queue[tail++] = startIdx;
    visited[startIdx] = 1;

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    while (head < tail) {
      const currIdx = queue[head++];
      const currRow = Math.floor(currIdx / 9) + 1;
      const currCol = (currIdx % 9) + 1;

      for (const dir of directions) {
        const nextRow = currRow + dir.dRow;
        const nextCol = currCol + dir.dCol;

        if (nextRow < 1 || nextRow > 9 || nextCol < 1 || nextCol > 9) {
          continue;
        }

        const nextIdx = (nextRow - 1) * 9 + (nextCol - 1);
        if (visited[nextIdx] === 1) {
          continue;
        }

        if (this.graphService.isMoveBlockedByGrid(currRow, currCol, nextRow, nextCol, grid)) {
          continue;
        }

        if (nextRow === goalRow) {
          return true;
        }

        visited[nextIdx] = 1;
        queue[tail++] = nextIdx;
      }
    }

    return false;
  }

  /**
   * Ultra-fast boolean reachability check to center (e5) with zero allocations.
   */
  hasPathToCenterFast(
    start: CellCoord,
    center: CellCoord,
    grid: WallGrid
  ): boolean {
    if (start.row === center.row && start.col === center.col) return true;

    const queue = new Int32Array(81);
    const visited = new Uint8Array(81);

    let head = 0;
    let tail = 0;

    const startIdx = (start.row - 1) * 9 + (start.col - 1);
    queue[tail++] = startIdx;
    visited[startIdx] = 1;

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    while (head < tail) {
      const currIdx = queue[head++];
      const currRow = Math.floor(currIdx / 9) + 1;
      const currCol = (currIdx % 9) + 1;

      for (const dir of directions) {
        const nextRow = currRow + dir.dRow;
        const nextCol = currCol + dir.dCol;

        if (nextRow < 1 || nextRow > 9 || nextCol < 1 || nextCol > 9) {
          continue;
        }

        const nextIdx = (nextRow - 1) * 9 + (nextCol - 1);
        if (visited[nextIdx] === 1) {
          continue;
        }

        if (this.graphService.isMoveBlockedByGrid(currRow, currCol, nextRow, nextCol, grid)) {
          continue;
        }

        if (nextRow === center.row && nextCol === center.col) {
          return true;
        }

        visited[nextIdx] = 1;
        queue[tail++] = nextIdx;
      }
    }

    return false;
  }

  /**
   * Calculates the shortest path and minimum distance from a starting cell
   * to any cell on the designated goal row using Breadth-First Search with parent pointer backtracking.
   */
  findShortestPathToGoal(
    start: CellCoord,
    goalRow: number,
    walls: Wall[]
  ): BfsPathResult {
    if (start.row === goalRow) {
      return { hasPath: true, distance: 0, path: [start] };
    }

    const grid = this.graphService.createWallGrid(walls);
    const queue = new Int32Array(81);
    const parent = new Int32Array(81).fill(-1);
    const visited = new Uint8Array(81);

    let head = 0;
    let tail = 0;

    const startIdx = (start.row - 1) * 9 + (start.col - 1);
    queue[tail++] = startIdx;
    visited[startIdx] = 1;

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    let goalIdx = -1;

    while (head < tail) {
      const currIdx = queue[head++];
      const currRow = Math.floor(currIdx / 9) + 1;
      const currCol = (currIdx % 9) + 1;

      for (const dir of directions) {
        const nextRow = currRow + dir.dRow;
        const nextCol = currCol + dir.dCol;

        if (nextRow < 1 || nextRow > 9 || nextCol < 1 || nextCol > 9) {
          continue;
        }

        const nextIdx = (nextRow - 1) * 9 + (nextCol - 1);
        if (visited[nextIdx] === 1) {
          continue;
        }

        if (this.graphService.isMoveBlockedByGrid(currRow, currCol, nextRow, nextCol, grid)) {
          continue;
        }

        visited[nextIdx] = 1;
        parent[nextIdx] = currIdx;

        if (nextRow === goalRow) {
          goalIdx = nextIdx;
          break;
        }

        queue[tail++] = nextIdx;
      }

      if (goalIdx !== -1) break;
    }

    if (goalIdx === -1) {
      return {
        hasPath: false,
        distance: Infinity,
        path: [],
      };
    }

    // Backtrack path
    const path: CellCoord[] = [];
    let curr = goalIdx;
    while (curr !== -1) {
      path.push({
        row: Math.floor(curr / 9) + 1,
        col: (curr % 9) + 1,
      });
      if (curr === startIdx) break;
      curr = parent[curr];
    }
    path.reverse();

    return {
      hasPath: true,
      distance: path.length - 1,
      path,
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

    const grid = this.graphService.createWallGrid(walls);
    const queue = new Int32Array(81);
    const parent = new Int32Array(81).fill(-1);
    const visited = new Uint8Array(81);

    let head = 0;
    let tail = 0;

    const startIdx = (start.row - 1) * 9 + (start.col - 1);
    const targetIdx = (center.row - 1) * 9 + (center.col - 1);

    queue[tail++] = startIdx;
    visited[startIdx] = 1;

    const directions = [
      { dRow: 1, dCol: 0 },
      { dRow: -1, dCol: 0 },
      { dRow: 0, dCol: -1 },
      { dRow: 0, dCol: 1 },
    ];

    let goalIdx = -1;

    while (head < tail) {
      const currIdx = queue[head++];
      const currRow = Math.floor(currIdx / 9) + 1;
      const currCol = (currIdx % 9) + 1;

      for (const dir of directions) {
        const nextRow = currRow + dir.dRow;
        const nextCol = currCol + dir.dCol;

        if (nextRow < 1 || nextRow > 9 || nextCol < 1 || nextCol > 9) {
          continue;
        }

        const nextIdx = (nextRow - 1) * 9 + (nextCol - 1);
        if (visited[nextIdx] === 1) {
          continue;
        }

        if (this.graphService.isMoveBlockedByGrid(currRow, currCol, nextRow, nextCol, grid)) {
          continue;
        }

        visited[nextIdx] = 1;
        parent[nextIdx] = currIdx;

        if (nextIdx === targetIdx) {
          goalIdx = nextIdx;
          break;
        }

        queue[tail++] = nextIdx;
      }

      if (goalIdx !== -1) break;
    }

    if (goalIdx === -1) {
      return {
        hasPath: false,
        distance: Infinity,
        path: [],
      };
    }

    const path: CellCoord[] = [];
    let curr = goalIdx;
    while (curr !== -1) {
      path.push({
        row: Math.floor(curr / 9) + 1,
        col: (curr % 9) + 1,
      });
      if (curr === startIdx) break;
      curr = parent[curr];
    }
    path.reverse();

    return {
      hasPath: true,
      distance: path.length - 1,
      path,
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

    // 2. Build fast WallGrid with the simulated wall
    const grid = this.graphService.createWallGrid(existingWalls);
    if (candidate.orientation === 'horizontal') {
      grid.hasH[candidate.row][candidate.col] = true;
    } else {
      grid.hasV[candidate.row][candidate.col] = true;
    }

    // 3. Fast reachability check for all active players
    for (const player of players) {
      if (player.isEliminated) {
        continue;
      }

      if (player.goalTargetType === 'center') {
        const centerTarget = player.goalCoord ?? { row: 5, col: 5 };
        if (!this.hasPathToCenterFast(player.position, centerTarget, grid)) {
          return false;
        }
      } else {
        const targetRow = player.goalRow ?? (player.playerId === 'player1' ? 9 : 1);
        if (!this.hasPathToGoalFast(player.position, targetRow, grid)) {
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
