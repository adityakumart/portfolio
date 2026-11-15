/**
 * 9x9 Quoridor (Barricade) Board & Grid Interfaces
 */

export type WallOrientation = 'horizontal' | 'vertical';

export interface CellCoord {
  /** 1-based row index: 1 at bottom, 9 at top */
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
  placedBy: string; // PlayerId ('player1' | 'player2' | 'player3' | 'player4')
}

export interface BoardCell {
  row: number;
  col: number;
  algebraic: string; // e.g. "e4", "c7"
  isRow1Goal?: boolean;
  isRow9Goal?: boolean;
  isCenterGoal?: boolean; // Center sanctum (e5)
}

export const COL_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;

/** Exact center cell of 9x9 board: e5 */
export const CENTER_COORD: CellCoord = { row: 5, col: 5 };

/** Default starting cell coordinates for 2-player and 4-player matches */
export const START_POSITIONS = {
  south: { row: 1, col: 5 }, // e1 (Player 1)
  north: { row: 9, col: 5 }, // e9 (Player 2)
  west: { row: 5, col: 1 },  // a5 (Player 3)
  east: { row: 5, col: 9 },  // i5 (Player 4)
} as const;

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
