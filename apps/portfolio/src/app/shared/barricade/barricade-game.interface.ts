/**
 * Barricade (Malefiz) Core Game Data Models & State Contracts
 */

export type PlayerColor = 'blue' | 'red' | 'green' | 'amber';

export interface Token {
  id: string;
  ownerId: string;
  currentPosition: string; // Node ID on board graph
  basePosition: string;    // Initial camp starting position node ID
  isInBase: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isComputer: boolean;
  startNodeId: string;
  tokens: Token[];
}

export interface Barricade {
  id: string;
  currentPosition: string; // Node ID on board graph
}

export type GameMode = 'two_players' | 'vs_computer';

export type GameTurnPhase =
  | 'WAITING_FOR_DICE'
  | 'DICE_ROLLED'
  | 'TOKEN_SELECTED'
  | 'PLACING_BARRICADE'
  | 'GAME_OVER';

export interface GameState {
  gameMode: GameMode;
  phase: GameTurnPhase;
  currentPlayerIndex: number;
  players: Player[];
  barricades: Barricade[];
  diceValue: number | null;
  selectedTokenId: string | null;
  capturedBarricadeId: string | null;
  winner: Player | null;
  turnCount: number;
}
