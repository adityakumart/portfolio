import { Injectable } from '@angular/core';
import {
  CellCoord,
  Wall,
  WallCoord,
  WallOrientation,
  areCoordsEqual,
  coordToAlgebraic,
} from '../../../../../shared/barricade';

export interface AdjacencyEdge {
  from: CellCoord;
  to: CellCoord;
}

@Injectable({
  providedIn: 'root',
})
export class BarricadeBoardGraphService {
  readonly BOARD_SIZE = 9;

  /**
   * Checks whether a cell coordinate is within the 1..9 grid bounds.
   */
  isWithinBounds(row: number, col: number): boolean {
    return row >= 1 && row <= this.BOARD_SIZE && col >= 1 && col <= this.BOARD_SIZE;
  }

  /**
   * Checks whether movement between two directly adjacent cells (from, to) is blocked by any wall.
   */
  isMoveBlockedByWall(from: CellCoord, to: CellCoord, walls: Wall[]): boolean {
    const dRow = to.row - from.row;
    const dCol = to.col - from.col;

    // Movement must be strictly 1 step orthogonally
    if (Math.abs(dRow) + Math.abs(dCol) !== 1) {
      return true;
    }

    // Vertical movement: from row r to r+1 (up) or r to r-1 (down)
    if (dRow !== 0) {
      const lowerRow = Math.min(from.row, to.row); // Groove between lowerRow and lowerRow + 1
      const col = from.col;

      // A horizontal wall placed at (lowerRow, col) or (lowerRow, col - 1) blocks this vertical step
      return walls.some(
        (w) =>
          w.orientation === 'horizontal' &&
          w.row === lowerRow &&
          (w.col === col || w.col === col - 1)
      );
    }

    // Horizontal movement: from col c to c+1 (right) or c to c-1 (left)
    if (dCol !== 0) {
      const leftCol = Math.min(from.col, to.col); // Groove between leftCol and leftCol + 1
      const row = from.row;

      // A vertical wall placed at (row, leftCol) or (row - 1, leftCol) blocks this horizontal step
      return walls.some(
        (w) =>
          w.orientation === 'vertical' &&
          w.col === leftCol &&
          (w.row === row || w.row === row - 1)
      );
    }

    return false;
  }

  /**
   * Checks whether a new wall collides or overlaps with existing walls on the board.
   */
  doesWallCollide(candidate: WallCoord, existingWalls: Wall[]): boolean {
    if (
      candidate.row < 1 ||
      candidate.row > this.BOARD_SIZE - 1 ||
      candidate.col < 1 ||
      candidate.col > this.BOARD_SIZE - 1
    ) {
      return true;
    }

    for (const w of existingWalls) {
      // 1. Exact match
      if (w.row === candidate.row && w.col === candidate.col && w.orientation === candidate.orientation) {
        return true;
      }

      // 2. Cross intersection: horizontal and vertical at the exact same junction (r, c)
      if (w.row === candidate.row && w.col === candidate.col && w.orientation !== candidate.orientation) {
        return true;
      }

      // 3. Horizontal overlap on same row: spans columns [c, c+1] and [existing.col, existing.col+1]
      if (
        candidate.orientation === 'horizontal' &&
        w.orientation === 'horizontal' &&
        w.row === candidate.row &&
        Math.abs(w.col - candidate.col) < 2
      ) {
        return true;
      }

      // 4. Vertical overlap on same col: spans rows [r, r+1] and [existing.row, existing.row+1]
      if (
        candidate.orientation === 'vertical' &&
        w.orientation === 'vertical' &&
        w.col === candidate.col &&
        Math.abs(w.row - candidate.row) < 2
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculates all legal pawn move destinations for the active player, respecting board boundaries,
   * walls, opponent occupancy, straight jumps, and diagonal jumps.
   */
  getLegalPawnMoves(
    currentPos: CellCoord,
    opponentPos: CellCoord,
    walls: Wall[]
  ): { target: CellCoord; isJump: boolean }[] {
    const legalMoves: { target: CellCoord; isJump: boolean }[] = [];
    const directions = [
      { dRow: 1, dCol: 0 },  // Up
      { dRow: -1, dCol: 0 }, // Down
      { dRow: 0, dCol: -1 }, // Left
      { dRow: 0, dCol: 1 },  // Right
    ];

    for (const dir of directions) {
      const neighbor: CellCoord = {
        row: currentPos.row + dir.dRow,
        col: currentPos.col + dir.dCol,
      };

      if (!this.isWithinBounds(neighbor.row, neighbor.col)) {
        continue;
      }

      // Check if wall blocks movement to neighbor
      if (this.isMoveBlockedByWall(currentPos, neighbor, walls)) {
        continue;
      }

      // If neighbor is NOT occupied by opponent pawn, it's a valid standard 1-step move
      if (!areCoordsEqual(neighbor, opponentPos)) {
        legalMoves.push({ target: neighbor, isJump: false });
        continue;
      }

      // If neighbor IS occupied by opponent pawn -> evaluate JUMP rules!
      const straightJumpSquare: CellCoord = {
        row: neighbor.row + dir.dRow,
        col: neighbor.col + dir.dCol,
      };

      const canStraightJump =
        this.isWithinBounds(straightJumpSquare.row, straightJumpSquare.col) &&
        !this.isMoveBlockedByWall(neighbor, straightJumpSquare, walls);

      if (canStraightJump) {
        legalMoves.push({ target: straightJumpSquare, isJump: true });
      } else {
        // Straight jump is blocked by wall or board edge -> Diagonal jumps from opponent position!
        const diagonalDirections =
          dir.dRow !== 0
            ? [{ dRow: 0, dCol: -1 }, { dRow: 0, dCol: 1 }] // If moving vertically, diagonals are left & right
            : [{ dRow: -1, dCol: 0 }, { dRow: 1, dCol: 0 }]; // If moving horizontally, diagonals are down & up

        for (const diag of diagonalDirections) {
          const diagSquare: CellCoord = {
            row: neighbor.row + diag.dRow,
            col: neighbor.col + diag.dCol,
          };

          if (
            this.isWithinBounds(diagSquare.row, diagSquare.col) &&
            !this.isMoveBlockedByWall(neighbor, diagSquare, walls)
          ) {
            legalMoves.push({ target: diagSquare, isJump: true });
          }
        }
      }
    }

    return legalMoves;
  }
}
