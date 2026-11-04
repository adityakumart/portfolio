import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BarricadeStateService } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeSoundService } from './barricade-sound.service';
import { ToastrService } from '../../../../../shared/services/toaster.service';

describe('BarricadeStateService', () => {
  let service: BarricadeStateService;

  beforeEach(() => {
    const toastrMock = {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      open: () => {},
    };

    TestBed.configureTestingModule({
      providers: [
        BarricadeStateService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
        BarricadeSoundService,
        { provide: ToastrService, useValue: toastrMock },
      ],
    });

    service = TestBed.inject(BarricadeStateService);
    service.initGame('vs_computer', 'intro');
  });

  it('should be created and initialized', () => {
    expect(service).toBeTruthy();
    expect(service.player1().position).toEqual({ row: 1, col: 5 });
    expect(service.player2().position).toEqual({ row: 9, col: 5 });
    expect(service.player1().wallsRemaining).toBe(10);
    expect(service.player2().wallsRemaining).toBe(10);
    expect(service.currentPlayerIndex()).toBe(0);
  });

  it('should execute legal pawn moves', () => {
    // Player 1 at (1, 5) moves to (2, 5)
    const success = service.movePawn({ row: 2, col: 5 });
    expect(success).toBe(true);
    expect(service.player1().position).toEqual({ row: 2, col: 5 });
    expect(service.moveHistory().length).toBe(1);
  });

  it('should place walls and decrement wall count', () => {
    const success = service.placeWall({
      row: 5,
      col: 4,
      orientation: 'horizontal',
    });
    expect(success).toBe(true);
    expect(service.walls().length).toBe(1);
    expect(service.player1().wallsRemaining).toBe(9);
  });

  it('should detect win condition on reaching goal row', () => {
    // Set scenario where player 1 is on row 8
    service.setScenario(
      { row: 8, col: 5 },
      { row: 9, col: 1 },
      [],
      null,
      10,
      10
    );

    // Move to row 9 (Player 1 goal)
    service.movePawn({ row: 9, col: 5 });
    expect(service.isGameOver()).toBe(true);
    expect(service.winner()?.playerId).toBe('player1');
  });

  it('should support undo of moves', () => {
    service.initGame('two_players');
    service.movePawn({ row: 2, col: 5 });
    expect(service.player1().position).toEqual({ row: 2, col: 5 });

    service.undo();
    expect(service.player1().position).toEqual({ row: 1, col: 5 });
  });
});
