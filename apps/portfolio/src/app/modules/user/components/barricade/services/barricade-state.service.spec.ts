import { TestBed } from '@angular/core/testing';
import { BarricadeStateService } from './barricade-state.service';
import { BarricadeBoardGraphService } from './barricade-board-graph.service';
import { BarricadeBfsEngineService } from './barricade-bfs-engine.service';

describe('BarricadeStateService', () => {
  let service: BarricadeStateService;
  let graphService: BarricadeBoardGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BarricadeStateService,
        BarricadeBoardGraphService,
        BarricadeBfsEngineService,
      ],
    });

    service = TestBed.inject(BarricadeStateService);
    graphService = TestBed.inject(BarricadeBoardGraphService);
    service.initGame('two_players');
  });

  it('should be created and initialized with 2 players and 11 barricades', () => {
    expect(service).toBeTruthy();
    expect(service.players().length).toBe(2);
    expect(service.barricades().length).toBe(11);
    expect(service.phase()).toBe('WAITING_FOR_DICE');
    expect(service.turnCount()).toBe(1);
    expect(service.currentPlayerIndex()).toBe(0);
    expect(service.currentPlayer().name).toBe('Player 1');
  });

  it('should configure Computer AI player in vs_computer mode', () => {
    service.setGameMode('vs_computer');
    expect(service.gameMode()).toBe('vs_computer');
    const p2 = service.players()[1];
    expect(p2.isComputer).toBe(true);
    expect(p2.name).toContain('Computer');
  });

  describe('Turn Flow & Dice Roll', () => {
    it('should roll dice and compute tokensWithValidMoves', () => {
      const roll = service.rollDice(2);
      expect(roll).toBe(2);
      expect(service.diceValue()).toBe(2);
      // All 5 tokens are in base; each can exit base onto r8_c4 with roll 2
      expect(service.tokensWithValidMoves().length).toBe(5);
      expect(service.phase()).toBe('DICE_ROLLED');
    });

    it('should allow selecting a token with valid moves and compute valid destinations', () => {
      service.rollDice(2);
      const token1Id = service.players()[0].tokens[0].id;
      const selected = service.selectToken(token1Id);

      expect(selected).toBe(true);
      expect(service.selectedTokenId()).toBe(token1Id);
      expect(service.phase()).toBe('TOKEN_SELECTED');

      const moves = service.validMoves();
      expect(moves.length).toBe(1);
      expect(moves[0].targetNodeId).toBe('r8_c4');
    });

    it('should move token, update position, and advance turn to player 2', () => {
      service.rollDice(2);
      const token1Id = service.players()[0].tokens[0].id;
      service.selectToken(token1Id);

      const moved = service.moveToken('r8_c4');
      expect(moved).toBe(true);

      // Verify token moved
      const p1Token = service.players()[0].tokens[0];
      expect(p1Token.currentPosition).toBe('r8_c4');
      expect(p1Token.isInBase).toBe(false);

      // Verify turn advanced to Player 2
      expect(service.currentPlayerIndex()).toBe(1);
      expect(service.currentPlayer().id).toBe('p2');
      expect(service.phase()).toBe('WAITING_FOR_DICE');
      expect(service.diceValue()).toBeNull();
      expect(service.turnCount()).toBe(2);
    });
  });

  describe('Collisions: Opponent Knockout & Barricade Relocation', () => {
    it('should knock opponent token back to base camp upon collision', () => {
      // Place Player 2 token at r8_c4
      service.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p2') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, currentPosition: 'r8_c4', isInBase: false }
                : t,
            ),
          };
        });
      });

      // Player 1 rolls 2 from base and lands on r8_c4
      service.rollDice(2);
      service.selectToken(service.players()[0].tokens[0].id);
      service.moveToken('r8_c4');

      // Verify Player 2 token was sent back to its base position
      const p2Token = service.players()[1].tokens[0];
      expect(p2Token.isInBase).toBe(true);
      expect(p2Token.currentPosition).toBe(p2Token.basePosition);
    });

    it('should switch phase to PLACING_BARRICADE when capturing a barricade', () => {
      // Place Player 1 token at r8_c5 (adjacent to barricade at r7_c5)
      service.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p1') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, currentPosition: 'r8_c5', isInBase: false }
                : t,
            ),
          };
        });
      });

      // Roll 1 and land on r7_c5 (barricade node)
      service.rollDice(1);
      service.selectToken(service.players()[0].tokens[0].id);
      service.moveToken('r7_c5');

      expect(service.phase()).toBe('PLACING_BARRICADE');
      expect(service.capturedBarricadeId()).toBeDefined();

      // Relocate barricade to an empty valid chokepoint r4_c7
      const relocated = service.relocateBarricade('r4_c7');
      expect(relocated).toBe(true);

      // Verify barricade updated and turn advanced
      const movedBarricade = service
        .barricades()
        .find((b) => b.currentPosition === 'r4_c7');
      expect(movedBarricade).toBeDefined();
      expect(service.phase()).toBe('WAITING_FOR_DICE');
      expect(service.currentPlayerIndex()).toBe(1);
    });

    it('should declare winner and set GAME_OVER when landing on summit castle', () => {
      // Place Player 1 token at r1_c8 (adjacent to castle_1)
      // and remove the barricade at r1_c8 so path is clear
      service.barricades.update((bList) =>
        bList.filter((b) => b.currentPosition !== 'r1_c8'),
      );

      service.players.update((players) => {
        return players.map((p) => {
          if (p.id !== 'p1') return p;
          return {
            ...p,
            tokens: p.tokens.map((t, idx) =>
              idx === 0
                ? { ...t, currentPosition: 'r1_c8', isInBase: false }
                : t,
            ),
          };
        });
      });

      // Roll 1 and land on castle_1
      service.rollDice(1);
      service.selectToken(service.players()[0].tokens[0].id);
      service.moveToken('castle_1');

      expect(service.winner()?.id).toBe('p1');
      expect(service.phase()).toBe('GAME_OVER');
      expect(service.isGameOver()).toBe(true);
    });
  });
});
