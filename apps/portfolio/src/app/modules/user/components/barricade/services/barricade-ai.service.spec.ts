import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BarricadeAiService } from './barricade-ai.service';
import { BarricadeStateService } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';
import { BarricadeSoundService } from './barricade-sound.service';
import { ToastrService } from '../../../../../shared/services/toaster.service';

describe('BarricadeAiService', () => {
  let aiService: BarricadeAiService;
  let stateService: BarricadeStateService;

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
        BarricadeAiService,
        { provide: ToastrService, useValue: toastrMock },
      ],
    });

    aiService = TestBed.inject(BarricadeAiService);
    stateService = TestBed.inject(BarricadeStateService);
    stateService.initGame('vs_computer', 'intro');
  });

  it('should be created and registered with state service', () => {
    expect(aiService).toBeTruthy();
    expect(stateService.player2().isComputer).toBe(true);
  });

  it('should take immediate winning move if available', async () => {
    // Set scenario where AI (player 2) is at (2, 5) with goal row 1
    stateService.setScenario(
      { row: 1, col: 1 },
      { row: 2, col: 5 },
      [],
      null,
      10,
      10
    );

    // Switch turn to AI
    stateService.currentPlayerIndex.set(1);
    await aiService.playTurn();

    expect(stateService.player2().position.row).toBe(1);
    expect(stateService.isGameOver()).toBe(true);
    expect(stateService.winner()?.playerId).toBe('player2');
  });
});
