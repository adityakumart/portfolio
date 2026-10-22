import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BarricadeComponent } from './barricade.component';
import { BarricadeStateService } from './services/barricade-state.service';
import { BarricadeAiService } from './services/barricade-ai.service';
import { BarricadeBoardGraphService } from './services/barricade-board-graph.service';
import { BarricadeBfsEngineService } from './services/barricade-bfs-engine.service';
import { BarricadeSoundService } from './services/barricade-sound.service';
import { ToastrService } from '../../../../shared/services/toaster.service';

describe('BarricadeComponent - Integration & End-to-End Game Loops', () => {
  let component: BarricadeComponent;
  let fixture: ComponentFixture<BarricadeComponent>;
  let state: BarricadeStateService;
  let ai: BarricadeAiService;
  let graphService: BarricadeBoardGraphService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarricadeComponent],
      providers: [
        provideRouter([]),
        BarricadeStateService,
        BarricadeAiService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
        BarricadeSoundService,
        ToastrService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarricadeComponent);
    component = fixture.componentInstance;
    state = TestBed.inject(BarricadeStateService);
    ai = TestBed.inject(BarricadeAiService);
    graphService = TestBed.inject(BarricadeBoardGraphService);

    state.initGame('two_players');
    fixture.detectChanges();
  });

  it('should initialize component with board, controls, and dialogs rendered', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-barricade-controls')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-board')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-relocation-dialog')).toBeTruthy();
    expect(compiled.querySelector('app-barricade-win-dialog')).toBeTruthy();
  });

  describe('2-Player Pass & Play Game Loop', () => {
    it('should complete a full 2-player turn transition cycle', () => {
      // --- PLAYER 1 TURN ---
      expect(state.currentPlayerIndex()).toBe(0);
      expect(state.currentPlayer().id).toBe('p1');
      expect(state.phase()).toBe('WAITING_FOR_DICE');

      // 1. Roll dice (roll = 2)
      state.rollDice(2);
      expect(state.diceValue()).toBe(2);
      expect(state.phase()).toBe('DICE_ROLLED');

      // 2. Select first token
      const p1TokenId = state.players()[0].tokens[0].id;
      const selected = state.selectToken(p1TokenId);
      expect(selected).toBe(true);
      expect(state.phase()).toBe('TOKEN_SELECTED');

      // 3. Move token to r8_c4
      const moved = state.moveToken('r8_c4');
      expect(moved).toBe(true);
      expect(state.players()[0].tokens[0].currentPosition).toBe('r8_c4');

      // --- PLAYER 2 TURN ---
      expect(state.currentPlayerIndex()).toBe(1);
      expect(state.currentPlayer().id).toBe('p2');
      expect(state.phase()).toBe('WAITING_FOR_DICE');
      expect(state.turnCount()).toBe(2);

      // 1. Roll dice (roll = 2)
      state.rollDice(2);
      const p2TokenId = state.players()[1].tokens[0].id;
      state.selectToken(p2TokenId);

      // 2. Move token to r8_c12
      state.moveToken('r8_c12');
      expect(state.players()[1].tokens[0].currentPosition).toBe('r8_c12');

      // --- BACK TO PLAYER 1 ---
      expect(state.currentPlayerIndex()).toBe(0);
      expect(state.currentPlayer().id).toBe('p1');
      expect(state.turnCount()).toBe(3);
    });

    it('should handle opponent piece knockout and send them back to base', () => {
      // Position Player 2 token at r8_c4
      state.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p2') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, i) =>
              i === 0 ? { ...t, currentPosition: 'r8_c4', isInBase: false } : t,
            ),
          };
        });
      });

      // Player 1 rolls 2 from base and lands on r8_c4
      state.rollDice(2);
      state.selectToken(state.players()[0].tokens[0].id);
      state.moveToken('r8_c4');

      // Opponent token should be reset to base
      const p2Token = state.players()[1].tokens[0];
      expect(p2Token.isInBase).toBe(true);
      expect(p2Token.currentPosition).toBe(p2Token.basePosition);
    });

    it('should handle barricade capture, prompt relocation, and advance turn upon placement', () => {
      // Place Player 1 token at r8_c5 (adjacent to barricade r7_c5)
      state.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p1') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, i) =>
              i === 0 ? { ...t, currentPosition: 'r8_c5', isInBase: false } : t,
            ),
          };
        });
      });

      // Roll 1 and capture barricade at r7_c5
      state.rollDice(1);
      state.selectToken(state.players()[0].tokens[0].id);
      state.moveToken('r7_c5');

      expect(state.phase()).toBe('PLACING_BARRICADE');
      expect(state.capturedBarricadeId()).toBeDefined();

      // Relocate captured barricade to r4_c7
      const relocated = state.relocateBarricade('r4_c7');
      expect(relocated).toBe(true);

      const placedBarricade = state.barricades().find((b) => b.currentPosition === 'r4_c7');
      expect(placedBarricade).toBeDefined();
      expect(state.phase()).toBe('WAITING_FOR_DICE');
      expect(state.currentPlayerIndex()).toBe(1);
    });
  });

  describe('Vs Computer AI Loop & Heuristics', () => {
    it('should switch game mode to vs_computer and execute AI turn', async () => {
      state.setGameMode('vs_computer');
      expect(state.gameMode()).toBe('vs_computer');
      expect(state.players()[1].isComputer).toBe(true);

      // Advance to computer turn
      // Player 1 rolls 2 and moves
      state.rollDice(2);
      state.selectToken(state.players()[0].tokens[0].id);
      state.moveToken('r8_c4');

      expect(state.currentPlayerIndex()).toBe(1);
      expect(state.isCurrentPlayerComputer()).toBe(true);

      // AI executes automated turn
      state.rollDice(2);
      await ai.executeMove();

      // Verify AI moved one of its tokens onto the board
      const aiTokensOnBoard = state.players()[1].tokens.filter((t) => !t.isInBase);
      expect(aiTokensOnBoard.length).toBe(1);
      expect(aiTokensOnBoard[0].currentPosition).toBe('r8_c12');
    });
  });

  describe('Summit Castle Win Detection', () => {
    it('should detect win when landing on castle_1 and display victory dialog', () => {
      // Clear barricade at r1_c8
      state.barricades.update((bList) => bList.filter((b) => b.currentPosition !== 'r1_c8'));

      // Position Player 1 token at r1_c8
      state.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p1') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, i) =>
              i === 0 ? { ...t, currentPosition: 'r1_c8', isInBase: false } : t,
            ),
          };
        });
      });

      // Roll 1 and land on castle_1
      state.rollDice(1);
      state.selectToken(state.players()[0].tokens[0].id);
      state.moveToken('castle_1');

      expect(state.winner()?.id).toBe('p1');
      expect(state.phase()).toBe('GAME_OVER');
      expect(state.isGameOver()).toBe(true);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Player 1 Wins!');
    });
  });
});
