/**
 * Barricade Movement & Move Tracking Interfaces
 */

export interface ValidMove {
  targetNodeId: string;
  path: string[];
  capturesBarricade: boolean;
  capturesOpponentTokenId?: string;
}

export interface MoveRecord {
  turnNumber: number;
  playerId: string;
  playerName: string;
  tokenId: string;
  fromNodeId: string;
  toNodeId: string;
  diceRoll: number;
  capturedBarricade: boolean;
  capturedOpponentTokenId?: string;
  barricadeRelocatedTo?: string;
  timestamp: number;
}
