// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { Pawn, Wall } from '../../../../../shared/barricade';

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch {}

describe('BarricadeBfsEngineService', () => {
  let service: BarricadeBfsEngineService;

  beforeEach(() => {
    TestBed.resetTestingModule();
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
      const walls: Wall[] = [
        { id: 'w1', row: 1, col: 5, orientation: 'horizontal', placedBy: 'player2' },
      ];

      const result = service.findShortestPathToGoal({ row: 1, col: 5 }, 9, walls);
      expect(result.hasPath).toBe(true);
      expect(result.distance).toBeGreaterThan(8);
    });

    it('should detect when player is completely trapped', () => {
      const walls: Wall[] = [
        { id: 'w1', row: 1, col: 1, orientation: 'horizontal', placedBy: 'player2' },
        { id: 'w2', row: 1, col: 1, orientation: 'vertical', placedBy: 'player2' },
      ];

      const result = service.findShortestPathToGoal({ row: 1, col: 1 }, 9, walls);
      expect(result.hasPath).toBe(false);
      expect(result.distance).toBe(Infinity);
    });
  });

  describe('findShortestPathToCenter (4-Player Center Goal)', () => {
    it('should find shortest path from edge midpoints to center e5', () => {
      const p1Start = { row: 1, col: 5 }; // South
      const center = { row: 5, col: 5 };
      const result = service.findShortestPathToCenter(p1Start, center, []);
      expect(result.hasPath).toBe(true);
      expect(result.distance).toBe(4);
      expect(result.path[result.path.length - 1]).toEqual(center);
    });

    it('should return distance 0 if pawn is already on center e5', () => {
      const center = { row: 5, col: 5 };
      const result = service.findShortestPathToCenter(center, center, []);
      expect(result.hasPath).toBe(true);
      expect(result.distance).toBe(0);
      expect(result.path.length).toBe(1);
    });
  });

  describe('canPlaceWallMulti (4-Player Fair Play Rule)', () => {
    it('should allow valid wall in 4-player game when center is reachable by all 4', () => {
      const players: Pawn[] = [
        { id: 'p1', playerId: 'player1', name: 'P1', color: 'red', position: { row: 1, col: 5 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p2', playerId: 'player2', name: 'P2', color: 'blue', position: { row: 9, col: 5 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p3', playerId: 'player3', name: 'P3', color: 'green', position: { row: 5, col: 1 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p4', playerId: 'player4', name: 'P4', color: 'amber', position: { row: 5, col: 9 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
      ];

      const canPlace = service.canPlaceWallMulti(
        { row: 2, col: 2, orientation: 'horizontal' },
        [],
        players
      );
      expect(canPlace).toBe(true);
    });

    it('should REJECT a wall if it completely blocks any of the 4 players from reaching center e5', () => {
      // Surround P3 at (5, 1) with existing vertical and candidate horizontal walls
      const players: Pawn[] = [
        { id: 'p1', playerId: 'player1', name: 'P1', color: 'red', position: { row: 1, col: 5 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p2', playerId: 'player2', name: 'P2', color: 'blue', position: { row: 9, col: 5 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p3', playerId: 'player3', name: 'P3', color: 'green', position: { row: 1, col: 1 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
        { id: 'p4', playerId: 'player4', name: 'P4', color: 'amber', position: { row: 5, col: 9 }, goalTargetType: 'center', goalCoord: { row: 5, col: 5 }, wallsRemaining: 5, isComputer: false },
      ];

      const existingWalls: Wall[] = [
        { id: 'w1', row: 1, col: 1, orientation: 'vertical', placedBy: 'player2' },
      ];

      const canPlace = service.canPlaceWallMulti(
        { row: 1, col: 1, orientation: 'horizontal' },
        existingWalls,
        players
      );
      expect(canPlace).toBe(false);
    });
  });
});
