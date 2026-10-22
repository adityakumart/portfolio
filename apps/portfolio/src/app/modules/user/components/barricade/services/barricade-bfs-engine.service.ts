import { Injectable, inject } from '@angular/core';
import {
  Barricade,
  Player,
  Token,
  ValidMove,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';

@Injectable({
  providedIn: 'root',
})
export class BarricadeBfsEngineService {
  private readonly graphService = inject(BarricadeBoardGraphService);

  /**
   * Calculates all legal moves for a given token with an exact dice roll value (1–6).
   * Enforces Malefiz rules:
   * - Cannot pass through a barricade (blocks path)
   * - Can land on a barricade (captures it)
   * - Cannot land on own friendly token
   * - Can land on opponent token (captures and returns to base)
   * - No backtracking within the same turn
   * - Base camp slots are non-traversable
   */
  calculateValidMoves(
    token: Token,
    diceRoll: number,
    player: Player,
    allPlayers: Player[],
    barricades: Barricade[],
  ): ValidMove[] {
    if (diceRoll <= 0 || diceRoll > 6) {
      return [];
    }

    const graph = this.graphService.getGraph();
    const barricadePositions = new Set(barricades.map((b) => b.currentPosition));

    // Friendly occupied nodes (excluding the active token itself)
    const friendlyPositions = new Set(
      player.tokens
        .filter((t) => !t.isInBase && t.id !== token.id)
        .map((t) => t.currentPosition),
    );

    // Opponent tokens lookup: Map from position -> Token
    const opponentTokensByPosition = new Map<string, Token>();
    for (const otherPlayer of allPlayers) {
      if (otherPlayer.id !== player.id) {
        for (const opToken of otherPlayer.tokens) {
          if (!opToken.isInBase) {
            opponentTokensByPosition.set(opToken.currentPosition, opToken);
          }
        }
      }
    }

    // Structure for BFS queue items
    interface PathState {
      currentNodeId: string;
      path: string[]; // History of visited nodes in this move
    }

    const queue: PathState[] = [];
    const validMovesByTarget = new Map<string, ValidMove>();

    // Initial BFS state
    if (token.isInBase) {
      // Step 1: Token emerges from base directly onto its player's start node
      const startNodeId = player.startNodeId;
      const startNode = graph[startNodeId];
      if (!startNode) {
        return [];
      }

      queue.push({
        currentNodeId: startNodeId,
        path: [startNodeId],
      });
    } else {
      // Starting from an active position on the board
      const startNode = graph[token.currentPosition];
      if (!startNode) {
        return [];
      }

      for (const neighborId of startNode.neighbors) {
        // Exclude base slots
        if (neighborId.startsWith('base_')) {
          continue;
        }

        queue.push({
          currentNodeId: neighborId,
          path: [neighborId],
        });
      }
    }

    // Process BFS queue
    while (queue.length > 0) {
      const { currentNodeId, path } = queue.shift()!;
      const stepsTaken = path.length;

      // Check if we reached the exact dice roll distance
      if (stepsTaken === diceRoll) {
        // Rule: cannot land on own friendly token
        if (friendlyPositions.has(currentNodeId)) {
          continue;
        }

        const capturesBarricade = barricadePositions.has(currentNodeId);
        const opponentToken = opponentTokensByPosition.get(currentNodeId);

        if (!validMovesByTarget.has(currentNodeId)) {
          validMovesByTarget.set(currentNodeId, {
            targetNodeId: currentNodeId,
            path: [...path],
            capturesBarricade,
            capturesOpponentTokenId: opponentToken?.id,
          });
        }
        continue;
      }

      // Intermediate step (stepsTaken < diceRoll):
      // Rule: cannot pass through a barricade!
      if (barricadePositions.has(currentNodeId)) {
        continue;
      }

      // Explore neighbors from current node
      const currentNode = graph[currentNodeId];
      if (!currentNode) {
        continue;
      }

      for (const nextNeighborId of currentNode.neighbors) {
        // Never traverse into base camp slots
        if (nextNeighborId.startsWith('base_')) {
          continue;
        }

        // Rule: No backtracking in the same turn
        // Cannot revisit the token's original starting node if starting on board
        if (!token.isInBase && nextNeighborId === token.currentPosition) {
          continue;
        }

        // Cannot revisit any node already in this path
        if (path.includes(nextNeighborId)) {
          continue;
        }

        queue.push({
          currentNodeId: nextNeighborId,
          path: [...path, nextNeighborId],
        });
      }
    }

    return Array.from(validMovesByTarget.values());
  }

  /**
   * Checks whether a board node is valid for relocating a captured barricade.
   * Rules:
   * - Node must exist in graph
   * - Node must have allowedForBarricade === true (not base, not baseline row, not castle)
   * - Node must not currently contain a barricade
   * - Node must not currently contain any player's token
   */
  canPlaceBarricade(
    targetNodeId: string,
    allPlayers: Player[],
    barricades: Barricade[],
  ): boolean {
    const node = this.graphService.getNode(targetNodeId);
    if (!node || !node.allowedForBarricade) {
      return false;
    }

    // Check if occupied by existing barricade
    if (barricades.some((b) => b.currentPosition === targetNodeId)) {
      return false;
    }

    // Check if occupied by any player's active token
    for (const player of allPlayers) {
      for (const token of player.tokens) {
        if (!token.isInBase && token.currentPosition === targetNodeId) {
          return false;
        }
      }
    }

    return true;
  }
}
