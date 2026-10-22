import { TestBed } from '@angular/core/testing';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';

describe('BarricadeBoardGraphService', () => {
  let service: BarricadeBoardGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarricadeBoardGraphService],
    });
    service = TestBed.inject(BarricadeBoardGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize the complete classic pyramid board graph with 66 nodes', () => {
    const graph = service.getGraph();
    const allNodes = service.getAllNodes();
    expect(allNodes.length).toBe(66);
    expect(Object.keys(graph).length).toBe(66);
  });

  it('should configure the summit castle node correctly at row 0', () => {
    const castle = service.getNode('castle_1');
    expect(castle).toBeDefined();
    expect(castle?.id).toBe('castle_1');
    expect(castle?.type).toBe('castle');
    expect(castle?.row).toBe(0);
    expect(castle?.col).toBe(8);
    expect(castle?.allowedForBarricade).toBe(false);
    expect(castle?.neighbors).toContain('r1_c8');
  });

  it('should configure exactly 11 default barricade positions across bottlenecks', () => {
    const barricades = service.getDefaultBarricadePositions();
    expect(barricades.length).toBe(11);
    expect(barricades).toEqual([
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
    ]);

    for (const bId of barricades) {
      const node = service.getNode(bId);
      expect(node).toBeDefined();
      expect(node?.allowedForBarricade).toBe(true);
    }
  });

  it('should ensure undirected adjacency symmetry across all connected nodes', () => {
    const allNodes = service.getAllNodes();
    for (const node of allNodes) {
      for (const neighborId of node.neighbors) {
        const neighbor = service.getNode(neighborId);
        expect(neighbor).toBeDefined();
        expect(neighbor?.neighbors).toContain(
          node.id,
          `Edge between ${node.id} and ${neighborId} must be bidirectional`,
        );
      }
    }
  });

  it('should configure starting positions and 5 base slots for Player 1 and Player 2', () => {
    const p1 = service.getPlayerStartPositions('blue');
    expect(p1.startNodeId).toBe('start_p1');
    expect(p1.baseSlots.length).toBe(5);
    expect(p1.baseSlots).toContain('base_p1_1');

    const p2 = service.getPlayerStartPositions('red');
    expect(p2.startNodeId).toBe('start_p2');
    expect(p2.baseSlots.length).toBe(5);
    expect(p2.baseSlots).toContain('base_p2_1');
  });

  it('should disallow placing barricades in base camps, starting rows, and the summit castle', () => {
    const castle = service.getNode('castle_1');
    expect(castle?.allowedForBarricade).toBe(false);

    const baseline = service.getNode('r8_c4');
    expect(baseline?.allowedForBarricade).toBe(false);

    const startP1 = service.getNode('start_p1');
    expect(startP1?.allowedForBarricade).toBe(false);

    const baseSlot = service.getNode('base_p1_1');
    expect(baseSlot?.allowedForBarricade).toBe(false);

    const allowedNodeIds = service.getAllowedBarricadeNodeIds();
    expect(allowedNodeIds).not.toContain('castle_1');
    expect(allowedNodeIds).not.toContain('r8_c4');
    expect(allowedNodeIds).not.toContain('start_p1');
    expect(allowedNodeIds).not.toContain('base_p1_1');
    expect(allowedNodeIds).toContain('r1_c8');
    expect(allowedNodeIds).toContain('r4_c8');
  });
});
