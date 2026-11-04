import { CellCoord, Wall } from './barricade-board.interface';
import { MoveRecord } from './barricade-move.interface';

/**
 * 9x9 Quoridor (Barricade) Core Game Models & State
 */

export type PlayerId = 'player1' | 'player2';
export type PlayerColor = 'red' | 'blue';
export type AiDifficulty = 'intro' | 'medium' | 'hard';
export type GameMode = 'two_players' | 'vs_computer';
export type GameStatus = 'lobby' | 'playing' | 'game_over';
export type TurnPhase = 'PLAYER_TURN' | 'AI_THINKING' | 'GAME_OVER';

export interface Pawn {
  id: string;
  playerId: PlayerId;
  name: string;
  color: PlayerColor;
  position: CellCoord;
  goalRow: number; // 9 for Player 1 (Red), 1 for Player 2 / Computer (Blue)
  wallsRemaining: number; // Starts with 10
  isComputer: boolean;
}

export interface GameState {
  gameMode: GameMode;
  aiDifficulty: AiDifficulty;
  status: GameStatus;
  phase: TurnPhase;
  currentPlayerIndex: number; // 0 for player 1, 1 for player 2
  players: [Pawn, Pawn];
  walls: Wall[];
  winner: Pawn | null;
  lastMove: MoveRecord | null;
  turnCount: number;
}
