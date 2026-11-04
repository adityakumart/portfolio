import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { Wall } from '../../../../../shared/barricade';

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
      // Horizontal wall between row 6 and 7 spanning cols 3 and 4
      const walls: Wall[] = [
        { id: 'w1', row: 6, col: 3, orientation: 'horizontal', placedBy: 'player1' },
      ];

      // Vertical move between (6, 3) and (7, 3) should be blocked
      expect(
        service.isMoveBlockedByWall({ row: 6, col: 3 }, { row: 7, col: 3 }, walls)
      ).toBe(true);

      // Vertical move between (6, 4) and (7, 4) should be blocked (2nd cell of wall)
      expect(
        service.isMoveBlockedByWall({ row: 6, col: 4 }, { row: 7, col: 4 }, walls)
      ).toBe(true);

      // Vertical move between (6, 5) and (7, 5) should NOT be blocked
      expect(
        service.isMoveBlockedByWall({ row: 6, col: 5 }, { row: 7, col: 5 }, walls)
      ).toBe(false);
    });

    it('should detect horizontal movement blocked by vertical wall', () => {
      // Vertical wall between col 2 and 3 spanning rows 4 and 5
      const walls: Wall[] = [
        { id: 'w2', row: 4, col: 2, orientation: 'vertical', placedBy: 'player1' },
      ];

      // Horizontal move between (4, 2) and (4, 3) should be blocked
      expect(
        service.isMoveBlockedByWall({ row: 4, col: 2 }, { row: 4, col: 3 }, walls)
      ).toBe(true);

      // Horizontal move between (5, 2) and (5, 3) should be blocked
      expect(
        service.isMoveBlockedByWall({ row: 5, col: 2 }, { row: 5, col: 3 }, walls)
      ).toBe(true);

      // Horizontal move between (3, 2) and (3, 3) should NOT be blocked
      expect(
        service.isMoveBlockedByWall({ row: 3, col: 2 }, { row: 3, col: 3 }, walls)
      ).toBe(false);
    });

    it('should detect overlapping and crossing wall placement', () => {
      const existing: Wall[] = [
        { id: 'w1', row: 4, col: 4, orientation: 'horizontal', placedBy: 'player1' },
      ];

      // Same spot & orientation
      expect(
        service.doesWallCollide({ row: 4, col: 4, orientation: 'horizontal' }, existing)
      ).toBe(true);

      // Perpendicular crossing at same center
      expect(
        service.doesWallCollide({ row: 4, col: 4, orientation: 'vertical' }, existing)
      ).toBe(true);

      // Overlapping parallel wall on same row
      expect(
        service.doesWallCollide({ row: 4, col: 3, orientation: 'horizontal' }, existing)
      ).toBe(true);
      expect(
        service.doesWallCollide({ row: 4, col: 5, orientation: 'horizontal' }, existing)
      ).toBe(true);

      // Non-overlapping horizontal wall
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
      // Player 1 at (4, 5), Opponent at (5, 5)
      const moves = service.getLegalPawnMoves(
        { row: 4, col: 5 },
        { row: 5, col: 5 },
        []
      );

      // Should include jump to (6, 5)
      const jumpMove = moves.find(
        (m) => m.target.row === 6 && m.target.col === 5
      );
      expect(jumpMove).toBeDefined();
      expect(jumpMove?.isJump).toBe(true);
    });

    it('should perform diagonal jumps when wall is behind opponent', () => {
      // Player 1 at (4, 5), Opponent at (5, 5), wall behind opponent between row 5 & 6
      const walls: Wall[] = [
        { id: 'w1', row: 5, col: 5, orientation: 'horizontal', placedBy: 'player2' },
      ];

      const moves = service.getLegalPawnMoves(
        { row: 4, col: 5 },
        { row: 5, col: 5 },
        walls
      );

      // Straight jump to (6, 5) is blocked; diagonal jumps to (5, 4) and (5, 6) should be present
      expect(moves.some((m) => m.target.row === 6 && m.target.col === 5)).toBe(false);
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 4 && m.isJump)).toBe(true);
      expect(moves.some((m) => m.target.row === 5 && m.target.col === 6 && m.isJump)).toBe(true);
    });
  });
});
