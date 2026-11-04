/**
 * 9x9 Quoridor (Barricade) Board & Grid Interfaces
 */

export type WallOrientation = 'horizontal' | 'vertical';

export interface CellCoord {
  /** 1-based row index: 1 at bottom (Blue goal), 9 at top (Red goal) */
  row: number;
  /** 1-based column index: 1 ('a') to 9 ('i') */
  col: number;
}

export interface WallCoord {
  /** Top-left cell reference row (1 to 8) */
  row: number;
  /** Top-left cell reference col (1 to 8) */
  col: number;
  /** Orientation of the 2-cell spanning wall */
  orientation: WallOrientation;
}

export interface Wall extends WallCoord {
  id: string;
  placedBy: 'player1' | 'player2';
}

export interface BoardCell {
  row: number;
  col: number;
  algebraic: string; // e.g. "e4", "c7"
  isRow1BlueGoal: boolean;
  isRow9RedGoal: boolean;
}

export const COL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;

export function coordToAlgebraic(coord: CellCoord): string {
  const colLetter = COL_LETTERS[coord.col - 1] ?? 'a';
  return `${colLetter}${coord.row}`;
}

export function algebraicToCoord(alg: string): CellCoord {
  const col = alg.charCodeAt(0) - 96; // 'a' -> 1
  const row = parseInt(alg.charAt(1), 10);
  return { row, col };
}

export function areCoordsEqual(a: CellCoord | null | undefined, b: CellCoord | null | undefined): boolean {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}
