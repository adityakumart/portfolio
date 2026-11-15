import { CellCoord, Wall } from './barricade-board.interface';
import { PlayerId } from './barricade-game.interface';

/**
 * 9x9 Quoridor (Barricade) Movement & Move History Interfaces
 */

export interface ValidMove {
  targetCoord: CellCoord;
  isJump: boolean;
}

export interface PawnMoveAction {
  type: 'pawn';
  playerId: PlayerId;
  from: CellCoord;
  to: CellCoord;
  isJump: boolean;
}

export interface WallMoveAction {
  type: 'wall';
  playerId: PlayerId;
  wall: Wall;
}

export type MoveAction = PawnMoveAction | WallMoveAction;

export interface PlayerSnapshot {
  playerId: PlayerId;
  position: CellCoord;
  wallsRemaining: number;
  timeRemainingMs: number;
}

export interface MoveRecord {
  turnNumber: number;
  playerId: PlayerId;
  action: MoveAction;
  previousPlayer1Pos: CellCoord;
  previousPlayer2Pos: CellCoord;
  previousPlayer1Walls: number;
  previousPlayer2Walls: number;
  playersSnapshot?: PlayerSnapshot[];
  timestamp: number;
}
