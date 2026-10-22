import { TestBed } from '@angular/core/testing';
import {
  Token,
  ValidMove,
} from '../../../../../shared/barricade';
import { BarricadeStateService } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeAiService } from './barricade-ai.service';

describe('BarricadeAiService', () => {
  let aiService: BarricadeAiService;
  let stateService: BarricadeStateService;
  let graphService: BarricadeBoardGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BarricadeStateService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
        BarricadeAiService,
      ],
    });

    aiService = TestBed.inject(BarricadeAiService);
    stateService = TestBed.inject(BarricadeStateService);
    graphService = TestBed.inject(BarricadeBoardGraphService);

    stateService.initGame('vs_computer');
  });

  it('should be created and registered with state service', () => {
    expect(aiService).toBeTruthy();
    expect(stateService.players()[1].isComputer).toBe(true);
  });

  describe('Heuristic Evaluation Function', () => {
    it('should award 10,000 pts for winning castle summit landing', () => {
      const move: ValidMove = {
        targetNodeId: 'castle_1',
        path: ['castle_1'],
        capturesBarricade: false,
      };
      const token: Token = {
        id: 'p2_t1',
        ownerId: 'p2',
        currentPosition: 'r1_c8',
        basePosition: 'base_p2_1',
        isInBase: false,
      };

      const score = aiService.evaluateMove(move, token);
      expect(score).toBe(10000);
    });

    it('should award 500 pts for capturing a barricade', () => {
      const move: ValidMove = {
        targetNodeId: 'r7_c8',
        path: ['r7_c8'],
        capturesBarricade: true,
      };
      const token: Token = {
        id: 'p2_t1',
        ownerId: 'p2',
        currentPosition: 'r8_c8',
        basePosition: 'base_p2_1',
        isInBase: false,
      };

      const score = aiService.evaluateMove(move, token);
      // 500 for barricade + (8 - 7)*100 for elevation progress
      expect(score).toBe(600);
    });

    it('should award 400 pts for capturing an opponent token', () => {
      const move: ValidMove = {
        targetNodeId: 'r8_c4',
        path: ['r8_c4'],
        capturesBarricade: false,
        capturesOpponentTokenId: 'p1_t1',
      };
      const token: Token = {
        id: 'p2_t1',
        ownerId: 'p2',
        currentPosition: 'r8_c5',
        basePosition: 'base_p2_1',
        isInBase: false,
      };

      const score = aiService.evaluateMove(move, token);
      // 400 for opponent + (8 - 8)*100 for elevation
      expect(score).toBe(400);
    });

    it('should award 200 pts for base mobilization', () => {
      const move: ValidMove = {
        targetNodeId: 'r8_c12',
        path: ['start_p2', 'r8_c12'],
        capturesBarricade: false,
      };
      const token: Token = {
        id: 'p2_t1',
        ownerId: 'p2',
        currentPosition: 'base_p2_1',
        basePosition: 'base_p2_1',
        isInBase: true,
      };

      const score = aiService.evaluateMove(move, token);
      // 200 for leaving base + (8 - 8)*100 for elevation
      expect(score).toBe(200);
    });

    it('should reward climbing closer to the summit (elevation progress)', () => {
      const moveRow4: ValidMove = {
        targetNodeId: 'r4_c8',
        path: ['r4_c8'],
        capturesBarricade: false,
      };
      const moveRow6: ValidMove = {
        targetNodeId: 'r6_c8',
        path: ['r6_c8'],
        capturesBarricade: false,
      };
      const token: Token = {
        id: 'p2_t1',
        ownerId: 'p2',
        currentPosition: 'r7_c8',
        basePosition: 'base_p2_1',
        isInBase: false,
      };

      const scoreRow4 = aiService.evaluateMove(moveRow4, token);
      const scoreRow6 = aiService.evaluateMove(moveRow6, token);

      // Row 4 is higher elevation than Row 6
      expect(scoreRow4).toBeGreaterThan(scoreRow6);
    });
  });

  describe('Strategic Barricade Relocation', () => {
    it('should place captured barricade on the bottleneck directly ahead of leading human token', () => {
      // Put human player token at row 4 (r4_c8)
      stateService.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p1') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, currentPosition: 'r4_c8', isInBase: false }
                : t,
            ),
          };
        });
      });

      // Clear upper barricade at r1_c8 so it's a valid placement target
      stateService.barricades.update((list) =>
        list.filter((b) => b.currentPosition !== 'r1_c8'),
      );

      const target = aiService.selectStrategicBarricadePlacement();
      // Should target the empty chokepoint r1_c8 ahead of the human player!
      expect(target).toBe('r1_c8');
    });
  });
});
