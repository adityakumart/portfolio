import { TestBed } from '@angular/core/testing';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { Wall } from '../../../../../shared/barricade';

describe('BarricadeBfsEngineService', () => {
  let service: BarricadeBfsEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarricadeBoardGraphService, BarricadeBfsEngineService],
    });
    service = TestBed.inject(BarricadeBfsEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findShortestPathToGoal', () => {
    it('should find direct straight path from row 1 to row 9 on empty board', () => {
      const result = service.findShortestPathToGoal({ row: 1, col: 5 }, 9, []);
      expect(result.hasPath).toBe(true);
      expect(result.distance).toBe(8);
      expect(result.path.length).toBe(9);
      expect(result.path[0]).toEqual({ row: 1, col: 5 });
      expect(result.path[8].row).toBe(9);
    });

    it('should route around walls', () => {
      // Wall directly in front of (1, 5) between row 1 and 2
      const walls: Wall[] = [
        { id: 'w1', row: 1, col: 5, orientation: 'horizontal', placedBy: 'player2' },
      ];

      const result = service.findShortestPathToGoal({ row: 1, col: 5 }, 9, walls);
      expect(result.hasPath).toBe(true);
      // Path must detour horizontally around wall
      expect(result.distance).toBeGreaterThan(8);
    });

    it('should detect when player is completely trapped', () => {
      // Create a complete box around (1, 1):
      // Horizontal wall at (1, 1) blocks up, Vertical wall at (1, 1) blocks right
      const walls: Wall[] = [
        { id: 'w1', row: 1, col: 1, orientation: 'horizontal', placedBy: 'player2' },
        { id: 'w2', row: 1, col: 1, orientation: 'vertical', placedBy: 'player2' },
      ];

      const result = service.findShortestPathToGoal({ row: 1, col: 1 }, 9, walls);
      expect(result.hasPath).toBe(false);
      expect(result.distance).toBe(Infinity);
    });
  });

  describe('canPlaceWall (Fair Play Rule)', () => {
    it('should allow valid wall that does not trap players', () => {
      const p1 = { row: 1, col: 5 };
      const p2 = { row: 9, col: 5 };
      const canPlace = service.canPlaceWall(
        { row: 5, col: 4, orientation: 'horizontal' },
        [],
        p1,
        p2
      );
      expect(canPlace).toBe(true);
    });

    it('should REJECT a wall that traps a player from reaching goal', () => {
      const p1 = { row: 1, col: 1 };
      const p2 = { row: 9, col: 5 };

      // Wall at (1, 1) vertical blocks right
      const existingWalls: Wall[] = [
        { id: 'w1', row: 1, col: 1, orientation: 'vertical', placedBy: 'player2' },
      ];

      // Placing horizontal wall at (1, 1) would seal p1 into a 1x1 cage at the corner
      const canPlace = service.canPlaceWall(
        { row: 1, col: 1, orientation: 'horizontal' },
        existingWalls,
        p1,
        p2
      );
      expect(canPlace).toBe(false);
    });
  });
});
