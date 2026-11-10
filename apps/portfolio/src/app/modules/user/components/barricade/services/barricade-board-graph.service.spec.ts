// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { Wall } from '../../../../../shared/barricade';

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch {}

describe('BarricadeBoardGraphService', () => {
  let service: BarricadeBoardGraphService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [BarricadeBoardGraphService],
    });
    service = TestBed.inject(BarricadeBoardGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Board Boundaries', () => {
    it('should validate 1..9 coordinates', () => {
      expect(service.isWithinBounds(1, 1)).toBe(true);
      expect(service.isWithinBounds(9, 9)).toBe(true);
      expect(service.isWithinBounds(0, 5)).toBe(false);
      expect(service.isWithinBounds(5, 10)).toBe(false);
    });
  });

  describe('Wall Collision Detection', () => {
    it('should detect vertical movement blocked by horizontal wall', () => {
      const walls: Wall[] = [
        { id: 'w1', row: 6, col: 3, orientation: 'horizontal', placedBy: 'player1' },
      ];

      expect(
        service.isMoveBlockedByWall({ row: 6, col: 3 }, { row: 7, col: 3 }, walls)
      ).toBe(true);

      expect(
        service.isMoveBlockedByWall({ row: 6, col: 4 }, { row: 7, col: 4 }, walls)
      ).toBe(true);

      expect(
        service.isMoveBlockedByWall({ row: 6, col: 5 }, { row: 7, col: 5 }, walls)
      ).toBe(false);
    });

    it('should detect horizontal movement blocked by vertical wall', () => {
      const walls: Wall[] = [
        { id: 'w2', row: 4, col: 2, orientation: 'vertical', placedBy: 'player1' },
      ];

      expect(
        service.isMoveBlockedByWall({ row: 4, col: 2 }, { row: 4, col: 3 }, walls)
      ).toBe(true);

      expect(
        service.isMoveBlockedByWall({ row: 5, col: 2 }, { row: 5, col: 3 }, walls)
      ).toBe(true);

      expect(
        service.isMoveBlockedByWall({ row: 3, col: 2 }, { row: 3, col: 3 }, walls)
      ).toBe(false);
    });

    it('should detect overlapping and crossing wall placement', () => {
      const existing: Wall[] = [
        { id: 'w1', row: 4, col: 4, orientation: 'horizontal', placedBy: 'player1' },
      ];

      expect(
        service.doesWallCollide({ row: 4, col: 4, orientation: 'horizontal' }, existing)
      ).toBe(true);

      expect(
        service.doesWallCollide({ row: 4, col: 4, orientation: 'vertical' }, existing)
      ).toBe(true);

      expect(
        service.doesWallCollide({ row: 4, col: 3, orientation: 'horizontal' }, existing)
      ).toBe(true);
      expect(
        service.doesWallCollide({ row: 4, col: 5, orientation: 'horizontal' }, existing)
      ).toBe(true);

      expect(
        service.doesWallCollide({ row: 4, col: 6, orientation: 'horizontal' }, existing)
      ).toBe(false);
    });
  });

  describe('Pawn Moves & Jumps', () => {
    it('should return 4 orthogonal moves in center of empty board', () => {
      const moves = service.getLegalPawnMoves(
        { row: 5, col: 5 },
        { row: 9, col: 5 },
        []
      );
      expect(moves.length).toBe(4);
      expect(moves.every((m) => !m.isJump)).toBe(true);
    });

    it('should perform straight jump over opponent when no wall behind', () => {
      const moves = service.getLegalPawnMoves(
        { row: 4, col: 5 },
        { row: 5, col: 5 },
        []
      );

      const jumpMove = moves.find(
        (m) => m.target.row === 6 && m.target.col === 5
      );
      expect(jumpMove).toBeDefined();
      expect(jumpMove?.isJump).toBe(true);
    });

    it('should perform diagonal jumps when wall is behind opponent', () => {
      const walls: Wall[] = [
        { id: 'w1', row: 5, col: 5, orientation: 'horizontal', placedBy: 'player2' },
      ];

      const moves = service.getLegalPawnMoves(
        { row: 4, col: 5 },
        { row: 5, col: 5 },
        walls
      );

      expect(moves.some((m) => m.target.row === 6 && m.target.col === 5)).toBe(false);
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 4 && m.isJump)).toBe(true);
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 6 && m.isJump)).toBe(true);
    });

    it('should prohibit chain jumping over 2 adjacent opponents in 4-player mode', () => {
      // Current player at (4, 5). Opponent 1 at (5, 5). Opponent 2 at (6, 5) directly behind Opponent 1!
      const current = { row: 4, col: 5 };
      const opponents = [
        { row: 5, col: 5 },
        { row: 6, col: 5 },
      ];

      const moves = service.getLegalPawnMovesMulti(current, opponents, []);

      // Straight jump to (6, 5) is NOT allowed because it is occupied by Opponent 2!
      expect(moves.some((m) => m.target.row === 6 && m.target.col === 5)).toBe(false);
      // Diagonals around Opponent 1 to (5, 4) and (5, 6) should be available instead
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 4 && m.isJump)).toBe(true);
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 6 && m.isJump)).toBe(true);
    });
  });
});
