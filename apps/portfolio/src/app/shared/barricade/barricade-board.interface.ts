/**
 * Barricade (Malefiz) Board Graph & Topology Interfaces
 */

export type BoardNodeType = 'start' | 'normal' | 'barricade' | 'castle';

export interface BoardNode {
  id: string;
  x: number;
  y: number;
  type: BoardNodeType;
  neighbors: string[];
  row: number;
  col: number;
  allowedForBarricade: boolean;
}

export type BoardGraph = Record<string, BoardNode>;
