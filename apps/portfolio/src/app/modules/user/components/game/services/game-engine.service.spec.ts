import '@angular/compiler';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { GameEngineService } from './game-engine.service';
import { GameDataService } from './game-data.service';
import { SpeechSynthesisService } from './speech-synthesis.service';
import { IMovieWordDto } from '@portfolio/shared-types';

describe('GameEngineService', () => {
  let service: GameEngineService;
  let mockGameDataService: Partial<GameDataService>;
  let mockSpeechService: Partial<SpeechSynthesisService>;

  const mockWords: IMovieWordDto[] = [
    {
      id: 'w1',
      title: 'Baahubali',
      englishTranslation: 'The one with strong arms',
      teluguTranslation: 'Balamaina chetulu unnavaadu',
      cast: 'Prabhas, Rana',
      year: 2015,
    },
    {
      id: 'w2',
      title: 'RRR',
      englishTranslation: 'Roar, Rise, Revolt',
      teluguTranslation: 'Raudram Ranam Rudhiram',
      cast: 'NTR, Ram Charan',
      year: 2022,
    },
    {
      id: 'w3',
      title: 'Pushpa',
      englishTranslation: 'Flower / Rose',
      teluguTranslation: 'Puvvu',
      cast: 'Allu Arjun',
      year: 2021,
    },
  ];

  beforeEach(() => {
    mockGameDataService = {
      fetchWordsBatch: vi.fn().mockReturnValue(
        of({
          success: true,
          words: mockWords,
          count: mockWords.length,
          hasMore: true,
        }),
      ),
    };

    mockSpeechService = {
      speak: vi.fn(),
      stop: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        GameEngineService,
        { provide: GameDataService, useValue: mockGameDataService },
        { provide: SpeechSynthesisService, useValue: mockSpeechService },
      ],
    });

    service = TestBed.inject(GameEngineService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created and start in setup status', () => {
    expect(service).toBeTruthy();
    expect(service.status()).toBe('setup');
    expect(service.turnState()).toBe('playing');
    expect(service.completedPlayerIds()).toEqual([]);
  });

  it('should initialize dedicated turn duration per player and queue words on startGame', () => {
    service.startGame({
      turnDurationSeconds: 45,
      playerNames: ['Alice', 'Bob'],
    });

    expect(service.status()).toBe('in_progress');
    expect(service.turnState()).toBe('playing');
    expect(service.state().settings.turnDurationSeconds).toBe(45);
    expect(service.state().settings.durationSeconds).toBe(90); // 45s * 2 players
    expect(service.remainingSeconds()).toBe(45);
    expect(service.activePlayerIndex()).toBe(0);
    expect(service.activePlayer()?.name).toBe('Alice');
    expect(service.activeWord()?.id).toBe('w1');
    expect(service.queueLength()).toBe(2);
    expect(mockSpeechService.speak).toHaveBeenCalledWith('The one with strong arms');
  });

  it('should keep active player active across multiple guesses (continuous turn)', () => {
    service.startGame({
      turnDurationSeconds: 60,
      playerNames: ['Alice', 'Bob'],
    });

    expect(service.activePlayerIndex()).toBe(0);
    expect(service.activePlayer()?.name).toBe('Alice');

    // Alice guesses correctly
    service.recordAnswer('correct');

    expect(service.activePlayerIndex()).toBe(0); // Still Alice!
    expect(service.players()[0].score).toBe(1);
    expect(service.players()[0].passedCount).toBe(0);
    expect(service.activeWord()?.id).toBe('w2');

    // Alice passes on the next movie
    service.recordAnswer('pass');

    expect(service.activePlayerIndex()).toBe(0); // Still Alice!
    expect(service.players()[0].score).toBe(1);
    expect(service.players()[0].passedCount).toBe(1);
    expect(service.activeWord()?.id).toBe('w3');
    expect(service.history().length).toBe(2);
  });

  it('should transition to turn_handover when time expires for first player', () => {
    service.startGame({
      turnDurationSeconds: 30,
      playerNames: ['Alice', 'Bob'],
    });

    // Simulate timer expiring
    (service as any).handleTurnTimeUp();

    expect(service.turnState()).toBe('turn_handover');
    expect(service.completedPlayerIds()).toEqual(['player_1']);
    expect(service.activePlayerIndex()).toBe(1); // Points to Bob
    expect(service.activePlayer()?.name).toBe('Bob');
    expect(service.previousPlayer()?.name).toBe('Alice');
    expect(service.remainingSeconds()).toBe(30);
    expect(mockSpeechService.speak).toHaveBeenCalledWith("Time's up for Alice!");
  });

  it('should resume next player turn when startNextPlayerTurn is invoked', () => {
    service.startGame({
      turnDurationSeconds: 30,
      playerNames: ['Alice', 'Bob'],
    });

    // Alice's turn ends
    (service as any).handleTurnTimeUp();
    expect(service.turnState()).toBe('turn_handover');

    // Bob starts their turn
    service.startNextPlayerTurn();

    expect(service.turnState()).toBe('playing');
    expect(service.activePlayerIndex()).toBe(1);
    expect(service.activePlayer()?.name).toBe('Bob');
    expect(service.remainingSeconds()).toBe(30);
  });

  it('should end game when the last player completes their turn', () => {
    service.startGame({
      turnDurationSeconds: 30,
      playerNames: ['Alice', 'Bob'],
    });

    // Alice finishes
    (service as any).handleTurnTimeUp();
    expect(service.turnState()).toBe('turn_handover');

    // Bob starts turn
    service.startNextPlayerTurn();

    // Bob finishes
    (service as any).handleTurnTimeUp();

    expect(service.status()).toBe('completed');
    expect(service.completedPlayerIds()).toEqual(['player_1', 'player_2']);
    expect(service.remainingSeconds()).toBe(0);
  });

  it('should allow manually ending the game from anywhere', () => {
    service.startGame({
      turnDurationSeconds: 60,
      playerNames: ['Alice', 'Bob'],
    });

    service.endGame();

    expect(service.status()).toBe('completed');
    expect(service.remainingSeconds()).toBe(0);
  });
});
