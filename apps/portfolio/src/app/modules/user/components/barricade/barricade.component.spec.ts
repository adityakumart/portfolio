import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BarricadeComponent } from './barricade.component';
import { BarricadeStateService } from './services/barricade-state.service';
import { BarricadeAiService } from './services/barricade-ai.service';
import { BarricadeBoardGraphService } from './services/barricade-board-graph.service';
import { BarricadeBfsEngineService } from './services/barricade-bfs-engine.service';
import { BarricadeSoundService } from './services/barricade-sound.service';
import { ToastrService } from '../../../../shared/services/toaster.service';

describe('BarricadeComponent - 9x9 Quoridor Integration', () => {
  let component: BarricadeComponent;
  let fixture: ComponentFixture<BarricadeComponent>;
  let state: BarricadeStateService;
  let ai: BarricadeAiService;

  beforeEach(async () => {
    const toastrMock = {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
      open: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [BarricadeComponent],
      providers: [
        provideRouter([]),
        BarricadeStateService,
        BarricadeAiService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
        BarricadeSoundService,
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarricadeComponent);
    component = fixture.componentInstance;
    state = TestBed.inject(BarricadeStateService);
    ai = TestBed.inject(BarricadeAiService);

    fixture.detectChanges();
  });

  it('should initialize component with home lobby view by default', () => {
    expect(component).toBeTruthy();
    expect(state.status()).toBe('lobby');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barricade-home')).toBeTruthy();
  });

  it('should render board and controls when match transitions to playing', () => {
    state.initGame('vs_computer', 'intro');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barricade-board')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-controls')).toBeTruthy();
  });

  it('should load reference screenshot preset accurately', () => {
    component.loadReferencePreset();
    fixture.detectChanges();

    // Player 1 at e4 (row 4, col 5)
    expect(state.player1().position).toEqual({ row: 4, col: 5 });
    // Computer at c7 (row 7, col 3)
    expect(state.player2().position).toEqual({ row: 7, col: 3 });
    // Previous move highlighted on b7 (row 7, col 2)
    expect(state.previousOpponentTile()).toEqual({ row: 7, col: 2 });
    // 3 horizontal walls placed
    expect(state.walls().length).toBe(3);
    expect(state.player1().wallsRemaining).toBe(7);
    expect(state.player2().wallsRemaining).toBe(10);
  });

  it('should support pawn movements and turn transitions', () => {
    state.initGame('two_players');
    const success = state.movePawn({ row: 2, col: 5 });
    expect(success).toBe(true);
    expect(state.player1().position).toEqual({ row: 2, col: 5 });
    expect(state.currentPlayerIndex()).toBe(1);
  });

  it('should return to lobby when goToLobby is invoked', () => {
    state.initGame('two_players');
    fixture.detectChanges();
    expect(state.status()).toBe('playing');

    state.goToLobby();
    fixture.detectChanges();

    expect(state.status()).toBe('lobby');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barricade-home')).toBeTruthy();
  });

  it('should maintain customized player colors when launching a configured match', () => {
    state.startConfiguredGame({
      gameMode: 'two_players',
      playerCount: 2,
      aiDifficulty: 'intro',
      actionEconomy: '3+2',
      timeLimitMinutes: 15,
      players: [
        { name: 'Diana', color: 'purple', isComputer: false },
        { name: 'Bruce', color: 'cyan', isComputer: false },
      ],
    });
    fixture.detectChanges();

    expect(state.player1().color).toBe('purple');
    expect(state.player2().color).toBe('cyan');
    expect(state.player1().name).toBe('Diana');
    expect(state.player2().name).toBe('Bruce');
  });
});
