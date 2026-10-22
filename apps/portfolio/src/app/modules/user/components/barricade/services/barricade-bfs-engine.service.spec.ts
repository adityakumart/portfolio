import { TestBed } from '@angular/core/testing';
import {
  Barricade,
  Player,
  Token,
} from '../../../../../shared/barricade';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';

describe('BarricadeBfsEngineService', () => {
  let engine: BarricadeBfsEngineService;
  let graphService: BarricadeBoardGraphService;

  let player1: Player;
  let player2: Player;
  let barricades: Barricade[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarricadeBoardGraphService, BarricadeBfsEngineService],
    });

    engine = TestBed.inject(BarricadeBfsEngineService);
    graphService = TestBed.inject(BarricadeBoardGraphService);

    // Default 11 barricades from graph service
    barricades = graphService.getDefaultBarricadePositions().map((pos, idx) => ({
      id: `b_${idx + 1}`,
      currentPosition: pos,
    }));

    // Setup 2 players with 5 tokens each
    const p1Slots = graphService.getPlayerStartPositions('blue');
    const p2Slots = graphService.getPlayerStartPositions('red');

    player1 = {
      id: 'p1',
      name: 'Player 1',
      color: 'blue',
      isComputer: false,
      startNodeId: p1Slots.startNodeId,
      tokens: p1Slots.baseSlots.map((basePos, i) => ({
        id: `p1_t${i + 1}`,
        ownerId: 'p1',
        currentPosition: basePos,
        basePosition: basePos,
        isInBase: true,
      })),
    };

    player2 = {
      id: 'p2',
      name: 'Player 2',
      color: 'red',
      isComputer: true,
      startNodeId: p2Slots.startNodeId,
      tokens: p2Slots.baseSlots.map((basePos, i) => ({
        id: `p2_t${i + 1}`,
        ownerId: 'p2',
        currentPosition: basePos,
        basePosition: basePos,
        isInBase: true,
      })),
    };
  });

  it('should be created', () => {
    expect(engine).toBeTruthy();
  });

  describe('Base Exit & Path Calculation', () => {
    it('should exit base to start_p1 on roll 1', () => {
      const token = player1.tokens[0];
      const moves = engine.calculateValidMoves(
        token,
        1,
        player1,
        [player1, player2],
        barricades,
      );

      expect(moves.length).toBe(1);
      expect(moves[0].targetNodeId).toBe('start_p1');
      expect(moves[0].path).toEqual(['start_p1']);
      expect(moves[0].capturesBarricade).toBe(false);
    });

    it('should exit base and step onto r8_c4 on roll 2', () => {
      const token = player1.tokens[0];
      const moves = engine.calculateValidMoves(
        token,
        2,
        player1,
        [player1, player2],
        barricades,
      );

      expect(moves.length).toBe(1);
      expect(moves[0].targetNodeId).toBe('r8_c4');
      expect(moves[0].path).toEqual(['start_p1', 'r8_c4']);
    });

    it('should branch along baseline left and right on roll 3 from base', () => {
      const token = player1.tokens[0];
      const moves = engine.calculateValidMoves(
        token,
        3,
        player1,
        [player1, player2],
        barricades,
      );

      const targetIds = moves.map((m) => m.targetNodeId).sort();
      // From start_p1 (1) -> r8_c4 (2) -> r8_c3 or r8_c5 (3)
      expect(targetIds).toEqual(['r8_c3', 'r8_c5']);
    });
  });

  describe('Barricade Obstruction & Capture Rules', () => {
    it('should prevent passing through a barricade on intermediate steps', () => {
      // Place token at r8_c5. Neighbor r7_c5 has a barricade.
      const token: Token = {
        id: 'p1_t1',
        ownerId: 'p1',
        currentPosition: 'r8_c5',
        basePosition: 'base_p1_1',
        isInBase: false,
      };

      // Roll 2 from r8_c5:
      // Options along baseline: r8_c5 -> r8_c4 -> r8_c3, or r8_c5 -> r8_c6 -> r8_c7, or r8_c5 -> r8_c4 -> start_p1
      // Upwards: r8_c5 -> r7_c5 (has barricade!) -> r6_c5. Passing through r7_c5 must be BLOCKED!
      const moves = engine.calculateValidMoves(
        token,
        2,
        player1,
        [player1, player2],
        barricades,
      );

      const targetIds = moves.map((m) => m.targetNodeId);
      expect(targetIds).not.toContain('r6_c5');
      expect(targetIds).toContain('r8_c3');
      expect(targetIds).toContain('r8_c7');
    });

    it('should allow landing directly on a barricade to capture it', () => {
      // Place token at r8_c5. Neighbor r7_c5 has a barricade.
      const token: Token = {
        id: 'p1_t1',
        ownerId: 'p1',
        currentPosition: 'r8_c5',
        basePosition: 'base_p1_1',
        isInBase: false,
      };

      // Roll 1 lands directly on r7_c5!
      const moves = engine.calculateValidMoves(
        token,
        1,
        player1,
        [player1, player2],
        barricades,
      );

      const barricadeMove = moves.find((m) => m.targetNodeId === 'r7_c5');
      expect(barricadeMove).toBeDefined();
      expect(barricadeMove?.capturesBarricade).toBe(true);
      expect(barricadeMove?.path).toEqual(['r7_c5']);
    });
  });

  describe('Friendly & Opponent Collision Rules', () => {
    it('should disallow landing on own friendly token', () => {
      // Put player1's second token at r8_c4
      player1.tokens[1].isInBase = false;
      player1.tokens[1].currentPosition = 'r8_c4';

      const token1 = player1.tokens[0]; // In base
      // Roll 2 from base would land on r8_c4, but friendly token is there
      const moves = engine.calculateValidMoves(
        token1,
        2,
        player1,
        [player1, player2],
        barricades,
      );

      expect(moves.find((m) => m.targetNodeId === 'r8_c4')).toBeUndefined();
    });

    it('should allow landing on opponent token and flag capture', () => {
      // Put player2's token at r8_c4
      player2.tokens[0].isInBase = false;
      player2.tokens[0].currentPosition = 'r8_c4';

      const token1 = player1.tokens[0]; // In base
      // Roll 2 from base lands on r8_c4
      const moves = engine.calculateValidMoves(
        token1,
        2,
        player1,
        [player1, player2],
        barricades,
      );

      const captureMove = moves.find((m) => m.targetNodeId === 'r8_c4');
      expect(captureMove).toBeDefined();
      expect(captureMove?.capturesOpponentTokenId).toBe(player2.tokens[0].id);
    });

    it('should prevent single-turn backtracking', () => {
      const token: Token = {
        id: 'p1_t1',
        ownerId: 'p1',
        currentPosition: 'r8_c4',
        basePosition: 'base_p1_1',
        isInBase: false,
      };

      // Roll 2 from r8_c4 cannot do r8_c4 -> r8_c3 -> r8_c4
      const moves = engine.calculateValidMoves(
        token,
        2,
        player1,
        [player1, player2],
        barricades,
      );

      expect(moves.find((m) => m.targetNodeId === 'r8_c4')).toBeUndefined();
    });
  });

  describe('canPlaceBarricade', () => {
    it('should allow placing barricade on empty valid track node', () => {
      // r4_c7 is empty, allowedForBarricade
      expect(engine.canPlaceBarricade('r4_c7', [player1, player2], barricades)).toBe(
        true,
      );
    });

    it('should reject placing barricade on castle, baseline, or base camps', () => {
      expect(engine.canPlaceBarricade('castle_1', [player1, player2], barricades)).toBe(
        false,
      );
      expect(engine.canPlaceBarricade('r8_c4', [player1, player2], barricades)).toBe(
        false,
      );
      expect(engine.canPlaceBarricade('start_p1', [player1, player2], barricades)).toBe(
        false,
      );
      expect(engine.canPlaceBarricade('base_p1_1', [player1, player2], barricades)).toBe(
        false,
      );
    });

    it('should reject placing barricade where another barricade exists', () => {
      expect(engine.canPlaceBarricade('r1_c8', [player1, player2], barricades)).toBe(
        false,
      );
    });

    it('should reject placing barricade where a player token exists', () => {
      player1.tokens[0].isInBase = false;
      player1.tokens[0].currentPosition = 'r4_c7';

      expect(engine.canPlaceBarricade('r4_c7', [player1, player2], barricades)).toBe(
        false,
      );
    });
  });
});
