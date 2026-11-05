import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BarricadeStateService } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeSoundService } from './barricade-sound.service';
import { ToastrService } from '../../../../../shared/services/toaster.service';
import { BarricadeConfig } from '../../../../../shared/barricade';

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
    const success = service.movePawn({ row: 2, col: 5 });
    expect(success).toBe(true);
    expect(service.player1().position).toEqual({ row: 2, col: 5 });
    expect(service.moveHistory().length).toBe(1);
  });

  it('should place walls and decrement wall count in 1+3 mode', () => {
    service.startConfiguredGame({
      gameMode: 'two_players',
      playerCount: 2,
      aiDifficulty: 'intro',
      actionEconomy: '1+3',
      timeLimitMinutes: 10,
      players: [
        { name: 'P1', color: 'red', isComputer: false },
        { name: 'P2', color: 'blue', isComputer: false },
      ],
    });

    const success = service.placeWall({
      row: 5,
      col: 4,
      orientation: 'horizontal',
    });
    expect(success).toBe(true);
    expect(service.walls().length).toBe(1);
    expect(service.player1().wallsRemaining).toBe(9);
  });

  it('should detect win condition on reaching goal row in 2-player mode', () => {
    service.setScenario(
      { row: 8, col: 5 },
      { row: 9, col: 1 },
      [],
      null,
      10,
      10
    );

    service.movePawn({ row: 9, col: 5 });
    expect(service.isGameOver()).toBe(true);
    expect(service.winner()?.playerId).toBe('player1');
  });

  it('should configure 4-player match with center goal e5', () => {
    const config: BarricadeConfig = {
      gameMode: 'four_players',
      playerCount: 4,
      aiDifficulty: 'intro',
      actionEconomy: '3+2',
      timeLimitMinutes: 15,
      players: [
        { name: 'Alice', color: 'red', isComputer: false },
        { name: 'Bob', color: 'blue', isComputer: false },
        { name: 'Charlie', color: 'green', isComputer: false },
        { name: 'Diana', color: 'amber', isComputer: false },
      ],
    };

    service.startConfiguredGame(config);

    expect(service.playerCount()).toBe(4);
    expect(service.players().length).toBe(4);
    expect(service.players()[0].position).toEqual({ row: 1, col: 5 }); // South
    expect(service.players()[1].position).toEqual({ row: 9, col: 5 }); // North
    expect(service.players()[2].position).toEqual({ row: 5, col: 1 }); // West
    expect(service.players()[3].position).toEqual({ row: 5, col: 9 }); // East
    expect(service.players()[0].goalTargetType).toBe('center');
    expect(service.players()[0].goalCoord).toEqual({ row: 5, col: 5 });
  });

  it('should award victory when pawn reaches center e5 in 4-player mode', () => {
    const config: BarricadeConfig = {
      gameMode: 'four_players',
      playerCount: 4,
      aiDifficulty: 'intro',
      actionEconomy: '1+0',
      timeLimitMinutes: 10,
      players: [
        { name: 'P1', color: 'red', isComputer: false },
        { name: 'P2', color: 'blue', isComputer: false },
        { name: 'P3', color: 'green', isComputer: false },
        { name: 'P4', color: 'amber', isComputer: false },
      ],
    };

    service.startConfiguredGame(config);

    // Place P1 adjacent to center e5 (e.g. at e4 = { row: 4, col: 5 })
    service.players.update((plist) => {
      const copy = [...plist];
      copy[0] = { ...copy[0], position: { row: 4, col: 5 } };
      return copy;
    });

    // Step into center e5
    const success = service.movePawn({ row: 5, col: 5 });
    expect(success).toBe(true);
    expect(service.isGameOver()).toBe(true);
    expect(service.winner()?.id).toBe('p1');
    expect(service.winReason()).toBe('goal_reached');
  });

  it('should support undo of moves', () => {
    service.initGame('two_players');
    service.movePawn({ row: 2, col: 5 });
    expect(service.player1().position).toEqual({ row: 2, col: 5 });

    service.undo();
    expect(service.player1().position).toEqual({ row: 1, col: 5 });
  });
});
