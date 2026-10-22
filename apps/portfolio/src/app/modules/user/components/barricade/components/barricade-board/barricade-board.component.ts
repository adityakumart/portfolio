import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCrown,
  lucideShieldAlert,
  lucideSwords,
  lucideSparkles,
} from '@ng-icons/lucide';
import {
  BoardNode,
  Player,
  Token,
  ValidMove,
} from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';
import { BarricadeBoardGraphService } from '../../services/barricade-board-graph.service';
import { BarricadeBfsEngineService } from '../../services/barricade-bfs-engine.service';

export interface BoardEdge {
  fromId: string;
  toId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RenderToken {
  token: Token;
  player: Player;
  x: number;
  y: number;
  isCurrentPlayer: boolean;
  isSelected: boolean;
  canMove: boolean;
}

@Component({
  selector: 'app-barricade-board',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideCrown,
      lucideShieldAlert,
      lucideSwords,
      lucideSparkles,
    }),
  ],
  templateUrl: './barricade-board.component.html',
  styleUrl: './barricade-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeBoardComponent {
  readonly stateService = inject(BarricadeStateService);
  readonly graphService = inject(BarricadeBoardGraphService);
  readonly bfsEngine = inject(BarricadeBfsEngineService);

  readonly allNodes = computed<BoardNode[]>(() => this.graphService.getAllNodes());

  /**
   * Precomputed unique undirected edges for SVG line rendering.
   */
  readonly boardEdges = computed<BoardEdge[]>(() => {
    const edges: BoardEdge[] = [];
    const seen = new Set<string>();
    const graph = this.graphService.getGraph();

    for (const node of Object.values(graph)) {
      for (const neighborId of node.neighbors) {
        const key = [node.id, neighborId].sort().join('--');
        if (!seen.has(key)) {
          seen.add(key);
          const neighbor = graph[neighborId];
          if (neighbor) {
            edges.push({
              fromId: node.id,
              toId: neighborId,
              x1: node.x,
              y1: node.y,
              x2: neighbor.x,
              y2: neighbor.y,
            });
          }
        }
      }
    }
    return edges;
  });

  /**
   * Map of valid move destinations for quick lookup during SVG click handling.
   */
  readonly validMovesMap = computed<Map<string, ValidMove>>(() => {
    const map = new Map<string, ValidMove>();
    for (const move of this.stateService.validMoves()) {
      map.set(move.targetNodeId, move);
    }
    return map;
  });

  /**
   * Active board barricades with coordinates.
   */
  readonly renderBarricades = computed(() => {
    const graph = this.graphService.getGraph();
    return this.stateService.barricades().map((b) => {
      const node = graph[b.currentPosition];
      return {
        id: b.id,
        nodeId: b.currentPosition,
        x: node ? node.x : 0,
        y: node ? node.y : 0,
      };
    });
  });

  /**
   * Active tokens with player metadata and coordinates.
   */
  readonly renderTokens = computed<RenderToken[]>(() => {
    const graph = this.graphService.getGraph();
    const currPlayer = this.stateService.currentPlayer();
    const selectedId = this.stateService.selectedTokenId();
    const movableIds = new Set(this.stateService.tokensWithValidMoves());
    const result: RenderToken[] = [];

    for (const player of this.stateService.players()) {
      for (const token of player.tokens) {
        const node = graph[token.currentPosition];
        if (node) {
          result.push({
            token,
            player,
            x: node.x,
            y: node.y,
            isCurrentPlayer: player.id === currPlayer?.id,
            isSelected: token.id === selectedId,
            canMove: player.id === currPlayer?.id && movableIds.has(token.id),
          });
        }
      }
    }
    return result;
  });

  /**
   * Nodes eligible for placing a captured barricade during PLACING_BARRICADE phase.
   */
  readonly eligiblePlacementNodeIds = computed<Set<string>>(() => {
    if (this.stateService.phase() !== 'PLACING_BARRICADE') {
      return new Set();
    }
    const capturedId = this.stateService.capturedBarricadeId();
    const remainingBarricades = this.stateService
      .barricades()
      .filter((b) => b.id !== capturedId);
    const players = this.stateService.players();

    const allowed = new Set<string>();
    for (const node of this.allNodes()) {
      if (this.bfsEngine.canPlaceBarricade(node.id, players, remainingBarricades)) {
        allowed.add(node.id);
      }
    }
    return allowed;
  });

  /**
   * Handles user clicks on a board node.
   */
  onNodeClick(nodeId: string): void {
    if (this.stateService.isCurrentPlayerComputer()) {
      return;
    }

    const phase = this.stateService.phase();

    if (phase === 'PLACING_BARRICADE') {
      if (this.eligiblePlacementNodeIds().has(nodeId)) {
        this.stateService.relocateBarricade(nodeId);
      }
      return;
    }

    if (phase === 'TOKEN_SELECTED') {
      const move = this.validMovesMap().get(nodeId);
      if (move) {
        this.stateService.moveToken(nodeId);
      }
    }
  }

  /**
   * Handles clicking on a token piece.
   */
  onTokenClick(renderToken: RenderToken, event: MouseEvent): void {
    event.stopPropagation();

    if (this.stateService.isCurrentPlayerComputer()) {
      return;
    }

    // If active player's token can move, select it
    if (renderToken.canMove) {
      this.stateService.selectToken(renderToken.token.id);
      return;
    }

    // If opponent token is at a valid move destination, click means capturing it!
    if (
      this.stateService.phase() === 'TOKEN_SELECTED' &&
      this.validMovesMap().has(renderToken.token.currentPosition)
    ) {
      this.stateService.moveToken(renderToken.token.currentPosition);
    }
  }

  /**
   * Handles clicking on a barricade piece.
   */
  onBarricadeClick(nodeId: string, event: MouseEvent): void {
    event.stopPropagation();

    if (this.stateService.isCurrentPlayerComputer()) {
      return;
    }

    // If this barricade's node is a valid landing target, clicking it executes the move!
    if (
      this.stateService.phase() === 'TOKEN_SELECTED' &&
      this.validMovesMap().has(nodeId)
    ) {
      this.stateService.moveToken(nodeId);
    }
  }
}
