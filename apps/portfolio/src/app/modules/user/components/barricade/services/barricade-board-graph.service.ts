import { Injectable } from '@angular/core';
import {
  BoardGraph,
  BoardNode,
  BoardNodeType,
} from '../../../../../shared/barricade';

@Injectable({
  providedIn: 'root',
})
export class BarricadeBoardGraphService {
  private readonly graph: BoardGraph;
  private readonly defaultBarricadePositions: string[];
  private readonly castleNodeId: string = 'castle_1';

  constructor() {
    const { graph, barricadePositions } = this.buildClassicPyramidGraph();
    this.graph = graph;
    this.defaultBarricadePositions = barricadePositions;
  }

  /**
   * Returns the entire board graph dictionary (keyed by node ID).
   */
  getGraph(): BoardGraph {
    return this.graph;
  }

  /**
   * Returns a specific board node by its ID.
   */
  getNode(id: string): BoardNode | undefined {
    return this.graph[id];
  }

  /**
   * Returns an array of all board nodes.
   */
  getAllNodes(): BoardNode[] {
    return Object.values(this.graph);
  }

  /**
   * Returns the summit castle target node ID.
   */
  getCastleNodeId(): string {
    return this.castleNodeId;
  }

  /**
   * Returns the 11 default initial barricade chokepoint positions.
   */
  getDefaultBarricadePositions(): string[] {
    return [...this.defaultBarricadePositions];
  }

  /**
   * Returns the 5 base camp slots and entry start node for a player.
   */
  getPlayerStartPositions(playerColorOrId: string): {
    baseSlots: string[];
    startNodeId: string;
  } {
    const isPlayer1 =
      playerColorOrId === 'blue' ||
      playerColorOrId === 'p1' ||
      playerColorOrId === 'player_1';

    if (isPlayer1) {
      return {
        startNodeId: 'start_p1',
        baseSlots: [
          'base_p1_1',
          'base_p1_2',
          'base_p1_3',
          'base_p1_4',
          'base_p1_5',
        ],
      };
    }

    return {
      startNodeId: 'start_p2',
      baseSlots: [
        'base_p2_1',
        'base_p2_2',
        'base_p2_3',
        'base_p2_4',
        'base_p2_5',
      ],
    };
  }

  /**
   * Returns list of node IDs where barricades are allowed to be placed.
   * (Rules: not in base camps, not on the baseline row, not on start entry nodes, not on the castle).
   */
  getAllowedBarricadeNodeIds(): string[] {
    return this.getAllNodes()
      .filter((node: BoardNode) => node.allowedForBarricade)
      .map((node: BoardNode) => node.id);
  }

  /**
   * Builds the classic Malefiz pyramid board topology.
   */
  private buildClassicPyramidGraph(): {
    graph: BoardGraph;
    barricadePositions: string[];
  } {
    const nodes: Record<string, BoardNode> = {};
    const edges: [string, string][] = [];

    // Helper to add edge symmetrically
    const addEdge = (a: string, b: string) => {
      edges.push([a, b]);
    };

    // Helper to calculate X from col (0 to 16, center col 8 at 450)
    const colToX = (col: number) => 450 + (col - 8) * 48;

    // Helper to create a node
    const addNode = (
      id: string,
      x: number,
      y: number,
      row: number,
      col: number,
      type: BoardNodeType,
      allowedForBarricade = true,
    ) => {
      nodes[id] = {
        id,
        x,
        y,
        row,
        col,
        type,
        neighbors: [],
        allowedForBarricade,
      };
    };

    // --- ROW 0: Castle Summit ---
    addNode(this.castleNodeId, 450, 60, 0, 8, 'castle', false);

    // --- ROW 1: Summit Chokepoint (Barricade 1) ---
    addNode('r1_c8', 450, 130, 1, 8, 'barricade', true);
    addEdge(this.castleNodeId, 'r1_c8');

    // --- ROW 2: Upper Crossbar (3 nodes: cols 6, 8, 10) ---
    const r2Cols = [6, 8, 10];
    for (const c of r2Cols) {
      addNode(`r2_c${c}`, colToX(c), 200, 2, c, 'normal', true);
    }
    addEdge('r2_c6', 'r2_c8');
    addEdge('r2_c8', 'r2_c10');
    addEdge('r1_c8', 'r2_c8');

    // --- ROW 3: Upper Bottlenecks (2 nodes: cols 6, 10 - Barricades 2 & 3) ---
    addNode('r3_c6', colToX(6), 270, 3, 6, 'barricade', true);
    addNode('r3_c10', colToX(10), 270, 3, 10, 'barricade', true);
    addEdge('r2_c6', 'r3_c6');
    addEdge('r2_c10', 'r3_c10');

    // --- ROW 4: Mid-Upper Crossbar (9 nodes: cols 4 to 12) ---
    for (let c = 4; c <= 12; c++) {
      addNode(`r4_c${c}`, colToX(c), 340, 4, c, 'normal', true);
      if (c > 4) {
        addEdge(`r4_c${c - 1}`, `r4_c${c}`);
      }
    }
    addEdge('r3_c6', 'r4_c6');
    addEdge('r3_c10', 'r4_c10');

    // --- ROW 5: Mid Bottlenecks (3 nodes: cols 4, 8, 12 - Barricades 4, 5, 6) ---
    const r5Cols = [4, 8, 12];
    for (const c of r5Cols) {
      addNode(`r5_c${c}`, colToX(c), 420, 5, c, 'barricade', true);
      addEdge(`r4_c${c}`, `r5_c${c}`);
    }

    // --- ROW 6: Mid Crossbar (13 nodes: cols 2 to 14) ---
    for (let c = 2; c <= 14; c++) {
      addNode(`r6_c${c}`, colToX(c), 500, 6, c, 'normal', true);
      if (c > 2) {
        addEdge(`r6_c${c - 1}`, `r6_c${c}`);
      }
    }
    for (const c of r5Cols) {
      addEdge(`r5_c${c}`, `r6_c${c}`);
    }

    // --- ROW 7: Lower Bottlenecks (5 nodes: cols 2, 5, 8, 11, 14 - Barricades 7, 8, 9, 10, 11) ---
    const r7Cols = [2, 5, 8, 11, 14];
    for (const c of r7Cols) {
      addNode(`r7_c${c}`, colToX(c), 580, 7, c, 'barricade', true);
      addEdge(`r6_c${c}`, `r7_c${c}`);
    }

    // --- ROW 8: Main Baseline Track (17 nodes: cols 0 to 16) ---
    for (let c = 0; c <= 16; c++) {
      // Baseline track is not allowed for barricades
      addNode(`r8_c${c}`, colToX(c), 660, 8, c, 'normal', false);
      if (c > 0) {
        addEdge(`r8_c${c - 1}`, `r8_c${c}`);
      }
    }
    for (const c of r7Cols) {
      addEdge(`r7_c${c}`, `r8_c${c}`);
    }

    // --- ROW 9: Player Starting Entry Nodes ---
    addNode('start_p1', colToX(4), 740, 9, 4, 'start', false);
    addEdge('r8_c4', 'start_p1');

    addNode('start_p2', colToX(12), 740, 9, 12, 'start', false);
    addEdge('r8_c12', 'start_p2');

    // --- ROW 10: Player 1 (Blue) Base Camp (5 slots) ---
    const p1BaseCoords = [
      { id: 'base_p1_1', x: colToX(2.5), y: 820 },
      { id: 'base_p1_2', x: colToX(3.5), y: 820 },
      { id: 'base_p1_3', x: colToX(4.5), y: 820 },
      { id: 'base_p1_4', x: colToX(3.0), y: 870 },
      { id: 'base_p1_5', x: colToX(4.0), y: 870 },
    ];
    for (const slot of p1BaseCoords) {
      addNode(slot.id, slot.x, slot.y, 10, 4, 'start', false);
      addEdge('start_p1', slot.id);
    }

    // --- ROW 10: Player 2 (Red) Base Camp (5 slots) ---
    const p2BaseCoords = [
      { id: 'base_p2_1', x: colToX(11.5), y: 820 },
      { id: 'base_p2_2', x: colToX(12.5), y: 820 },
      { id: 'base_p2_3', x: colToX(13.5), y: 820 },
      { id: 'base_p2_4', x: colToX(12.0), y: 870 },
      { id: 'base_p2_5', x: colToX(13.0), y: 870 },
    ];
    for (const slot of p2BaseCoords) {
      addNode(slot.id, slot.x, slot.y, 10, 12, 'start', false);
      addEdge('start_p2', slot.id);
    }

    // Populate neighbors bidirectionally
    for (const [from, to] of edges) {
      if (nodes[from] && nodes[to]) {
        if (!nodes[from].neighbors.includes(to)) {
          nodes[from].neighbors.push(to);
        }
        if (!nodes[to].neighbors.includes(from)) {
          nodes[to].neighbors.push(from);
        }
      }
    }

    const barricadePositions = [
      'r1_c8',
      'r3_c6',
      'r3_c10',
      'r5_c4',
      'r5_c8',
      'r5_c12',
      'r7_c2',
      'r7_c5',
      'r7_c8',
      'r7_c11',
      'r7_c14',
    ];

    return { graph: nodes, barricadePositions };
  }
}
