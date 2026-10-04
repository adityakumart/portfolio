import {
  Injectable,
  inject,
  signal,
  computed,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { GameDataService } from './game-data.service';
import { SpeechSynthesisService } from './speech-synthesis.service';
import {
  IGameSessionState,
  IGameSettings,
  IGamePlayer,
  IMovieWordDto,
  IGameWordHistoryItem,
} from '@portfolio/shared-types';

const INITIAL_SETTINGS: IGameSettings = {
  durationSeconds: 120,
  targetWordCount: 24,
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      score: 0,
      passedCount: 0,
      colorClass: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
      badgeBgClass: 'bg-violet-500/20 text-violet-300',
    },
    {
      id: 'p2',
      name: 'Player 2',
      score: 0,
      passedCount: 0,
      colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      badgeBgClass: 'bg-amber-500/20 text-amber-300',
    },
  ],
};

const INITIAL_STATE: IGameSessionState = {
  status: 'setup',
  settings: INITIAL_SETTINGS,
  remainingSeconds: 120,
  activePlayerIndex: 0,
  activeWord: null,
  queue: [],
  history: [],
  isFetchingWords: false,
  totalWordsFetched: 0,
  gameStartTimeMs: null,
  currentWordStartTimeMs: null,
};

@Injectable({
  providedIn: 'root',
})
export class GameEngineService implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private gameDataService = inject(GameDataService);
  private speechService = inject(SpeechSynthesisService);

  // Central state store
  private state$ = new BehaviorSubject<IGameSessionState>(INITIAL_STATE);

  // Public Signal state
  readonly state = signal<IGameSessionState>(INITIAL_STATE);

  // Tracking persistent IDs seen in the current game session
  private seenWordIds = new Set<string>();

  // Timer & Polling Subscriptions
  private timerSub: Subscription | null = null;
  private backgroundPollingSub: Subscription | null = null;
  private gameEndTimeMs = 0;

  // Computed helper signals
  readonly status = computed(() => this.state().status);
  readonly remainingSeconds = computed(() => this.state().remainingSeconds);
  readonly activePlayerIndex = computed(() => this.state().activePlayerIndex);
  readonly players = computed(() => this.state().settings.players);
  readonly activePlayer = computed<IGamePlayer | undefined>(() => {
    const list = this.players();
    const idx = this.activePlayerIndex();
    return list[idx] || list[0];
  });
  readonly activeWord = computed(() => this.state().activeWord);
  readonly queueLength = computed(() => this.state().queue.length);
  readonly history = computed(() => this.state().history);
  readonly isFetchingWords = computed(() => this.state().isFetchingWords);

  // Leaderboard ranking computed
  readonly leaderboard = computed<IGamePlayer[]>(() => {
    return [...this.players()].sort((a, b) => b.score - a.score);
  });

  constructor() {
    this.state$.subscribe((s) => {
      this.state.set(s);
    });
  }

  ngOnDestroy(): void {
    this.stopTimers();
    this.speechService.stop();
  }

  private updateState(updater: (prev: IGameSessionState) => IGameSessionState): void {
    const next = updater(this.state$.value);
    this.state$.next(next);
  }

  /**
   * Prepares and starts a new game session:
   * 1. Calculates target word count (1 word per 5 seconds).
   * 2. Clears seen word IDs and word queue.
   * 3. Fetches initial batch of words (up to 10).
   * 4. Starts drift-corrected countdown timer and background pre-fetch polling.
   */
  startGame(customSettings: {
    durationSeconds: number;
    playerNames: string[];
  }): void {
    const duration = Math.min(3570, Math.max(30, customSettings.durationSeconds));
    const targetWordCount = Math.ceil(duration / 5);

    const playerPalette = [
      { colorClass: 'text-violet-400 border-violet-500/30 bg-violet-500/10', badgeBgClass: 'bg-violet-500/20 text-violet-300' },
      { colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10', badgeBgClass: 'bg-amber-500/20 text-amber-300' },
      { colorClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', badgeBgClass: 'bg-emerald-500/20 text-emerald-300' },
      { colorClass: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10', badgeBgClass: 'bg-cyan-500/20 text-cyan-300' },
      { colorClass: 'text-rose-400 border-rose-500/30 bg-rose-500/10', badgeBgClass: 'bg-rose-500/20 text-rose-300' },
      { colorClass: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10', badgeBgClass: 'bg-indigo-500/20 text-indigo-300' },
      { colorClass: 'text-teal-400 border-teal-500/30 bg-teal-500/10', badgeBgClass: 'bg-teal-500/20 text-teal-300' },
      { colorClass: 'text-orange-400 border-orange-500/30 bg-orange-500/10', badgeBgClass: 'bg-orange-500/20 text-orange-300' },
    ];

    const players: IGamePlayer[] = customSettings.playerNames.map((name, i) => {
      const palette = playerPalette[i % playerPalette.length];
      return {
        id: `player_${i + 1}`,
        name: name.trim() || `Player ${i + 1}`,
        score: 0,
        passedCount: 0,
        colorClass: palette.colorClass,
        badgeBgClass: palette.badgeBgClass,
      };
    });

    const settings: IGameSettings = {
      durationSeconds: duration,
      targetWordCount,
      players,
    };

    this.seenWordIds.clear();
    this.stopTimers();

    this.updateState((s) => ({
      ...s,
      status: 'in_progress',
      settings,
      remainingSeconds: duration,
      activePlayerIndex: 0,
      activeWord: null,
      queue: [],
      history: [],
      isFetchingWords: true,
      totalWordsFetched: 0,
      gameStartTimeMs: Date.now(),
      currentWordStartTimeMs: Date.now(),
    }));

    // Initial immediate fetch: min(10, targetWordCount)
    const initialFetchSize = Math.min(10, targetWordCount);
    this.gameDataService.fetchWordsBatch(initialFetchSize, []).subscribe({
      next: (res) => {
        for (const w of res.words) {
          this.seenWordIds.add(w.id);
        }

        const active = res.words[0] || null;
        const rest = res.words.slice(1);

        this.updateState((s) => ({
          ...s,
          activeWord: active,
          queue: rest,
          isFetchingWords: false,
          totalWordsFetched: res.words.length,
          currentWordStartTimeMs: Date.now(),
        }));

        if (active) {
          this.speechService.speak(active.englishTranslation);
        }

        // Start countdown and background poller
        this.startTimerLoop(duration);
        this.startBackgroundPoller();
      },
      error: (err) => {
        console.error('Failed to fetch initial game words batch:', err);
        this.updateState((s) => ({ ...s, isFetchingWords: false }));
        this.startTimerLoop(duration);
      },
    });
  }

  /**
   * Drift-corrected countdown timer using performance.now()
   */
  private startTimerLoop(durationSeconds: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.gameEndTimeMs = performance.now() + durationSeconds * 1000;

    this.timerSub = timer(0, 250).subscribe(() => {
      const now = performance.now();
      const remainingMs = Math.max(0, this.gameEndTimeMs - now);
      const remainingSec = Math.ceil(remainingMs / 1000);

      this.updateState((s) => ({
        ...s,
        remainingSeconds: remainingSec,
      }));

      if (remainingSec <= 0) {
        this.endGame();
      }
    });
  }

  /**
   * Background polling: checks every 15s to fetch remaining words up to target count.
   */
  private startBackgroundPoller(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.backgroundPollingSub = timer(15000, 15000).subscribe(() => {
      const state = this.state$.value;
      if (state.status !== 'in_progress' || state.isFetchingWords) return;

      if (
        state.totalWordsFetched < state.settings.targetWordCount &&
        state.queue.length < 15
      ) {
        this.triggerBackgroundBatchFetch(10);
      }
    });
  }

  /**
   * Trigger non-blocking batch fetch in the background.
   */
  private triggerBackgroundBatchFetch(size = 10): void {
    const currentState = this.state$.value;
    if (currentState.isFetchingWords) return;

    this.updateState((s) => ({ ...s, isFetchingWords: true }));

    const excludeIds = Array.from(this.seenWordIds);
    this.gameDataService.fetchWordsBatch(size, excludeIds).subscribe({
      next: (res) => {
        if (!res.words.length) {
          this.updateState((s) => ({ ...s, isFetchingWords: false }));
          return;
        }

        for (const w of res.words) {
          this.seenWordIds.add(w.id);
        }

        this.updateState((s) => {
          let active = s.activeWord;
          let queue = [...s.queue, ...res.words];

          // If activeWord was null (ran out), pop next word immediately
          if (!active && queue.length > 0) {
            active = queue[0];
            queue = queue.slice(1);
            if (active) {
              this.speechService.speak(active.englishTranslation);
            }
          }

          return {
            ...s,
            activeWord: active,
            queue,
            isFetchingWords: false,
            totalWordsFetched: s.totalWordsFetched + res.words.length,
          };
        });
      },
      error: (err) => {
        console.error('Background batch fetch failed:', err);
        this.updateState((s) => ({ ...s, isFetchingWords: false }));
      },
    });
  }

  /**
   * Records user action: Green (Correct) or Red (Pass).
   * - Increments score if correct.
   * - Advances active player turn (round-robin).
   * - Advances queue and triggers Web Speech API for new word.
   * - Checks consumption velocity and triggers emergency background pre-fetch if buffer is low.
   */
  recordAnswer(result: 'correct' | 'pass'): void {
    const state = this.state$.value;
    if (state.status !== 'in_progress' || !state.activeWord) return;

    const currentWord = state.activeWord;
    const activePlayerIndex = state.activePlayerIndex;
    const now = Date.now();
    const responseTimeMs = state.currentWordStartTimeMs
      ? now - state.currentWordStartTimeMs
      : 0;

    // Update active player's score
    const updatedPlayers = state.settings.players.map((p, idx) => {
      if (idx === activePlayerIndex) {
        return {
          ...p,
          score: result === 'correct' ? p.score + 1 : p.score,
          passedCount: result === 'pass' ? p.passedCount + 1 : p.passedCount,
        };
      }
      return p;
    });

    // Record word history entry
    const historyEntry: IGameWordHistoryItem = {
      wordId: currentWord.id,
      title: currentWord.title,
      englishTranslation: currentWord.englishTranslation,
      teluguTranslation: currentWord.teluguTranslation,
      cast: currentWord.cast,
      guessedByPlayerId: updatedPlayers[activePlayerIndex].id,
      result,
      responseTimeMs,
    };

    // Cycle next player: (current + 1) % totalPlayers
    const nextPlayerIndex = (activePlayerIndex + 1) % updatedPlayers.length;

    // Pop next word from queue
    const nextWord = state.queue.length > 0 ? state.queue[0] : null;
    const nextQueue = state.queue.slice(1);

    this.updateState((s) => ({
      ...s,
      settings: {
        ...s.settings,
        players: updatedPlayers,
      },
      activePlayerIndex: nextPlayerIndex,
      activeWord: nextWord,
      queue: nextQueue,
      history: [historyEntry, ...s.history],
      currentWordStartTimeMs: now,
    }));

    // Read English translation clue aloud for the new word
    if (nextWord) {
      this.speechService.speak(nextWord.englishTranslation);
    }

    // --- Dynamic Speed Monitoring & Emergency Pre-fetch Check ---
    this.checkSpeedAndBufferStatus(nextQueue.length);
  }

  /**
   * Speed monitoring mathematical logic:
   * V_actual = W_consumed / t_elapsed
   * Baseline = 0.20 words/sec (1 word every 5 sec)
   * Trigger emergency fetch if queue <= 3, or if V_actual >= 0.26 and queue <= 6.
   */
  private checkSpeedAndBufferStatus(currentQueueLength: number): void {
    const state = this.state$.value;
    if (state.remainingSeconds <= 5 || state.isFetchingWords) {
      return;
    }

    const elapsedSeconds =
      state.settings.durationSeconds - state.remainingSeconds;
    const wordsConsumed = state.history.length;
    const actualVelocity =
      elapsedSeconds > 0 ? wordsConsumed / elapsedSeconds : 0.2;

    const isSpeedCritical =
      actualVelocity >= 0.26 && currentQueueLength <= 6;
    const isBufferCritical = currentQueueLength <= 3;

    if (isBufferCritical || isSpeedCritical) {
      const emergencyChunk = Math.min(
        10,
        Math.max(5, Math.ceil(actualVelocity * 20)),
      );
      this.triggerBackgroundBatchFetch(emergencyChunk);
    }
  }

  /**
   * Replays current translation audio (English or Telugu).
   */
  replayCurrentWordAudio(lang: 'en' | 'te' = 'en'): void {
    const word = this.activeWord();
    if (!word) return;
    if (lang === 'te' && word.teluguTranslation) {
      this.speechService.speak(word.teluguTranslation, 'te-IN');
    } else if (word.englishTranslation) {
      this.speechService.speak(word.englishTranslation, 'en-US');
    }
  }

  /**
   * Terminates active session and transitions to completed view.
   */
  endGame(): void {
    this.stopTimers();
    this.speechService.stop();
    this.updateState((s) => ({
      ...s,
      status: 'completed',
      remainingSeconds: 0,
    }));
  }

  /**
   * Resets game engine back to setup configuration screen.
   */
  resetToSetup(): void {
    this.stopTimers();
    this.speechService.stop();
    this.seenWordIds.clear();
    this.updateState((s) => ({
      ...INITIAL_STATE,
      settings: s.settings,
    }));
  }

  private stopTimers(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = null;
    }
    if (this.backgroundPollingSub) {
      this.backgroundPollingSub.unsubscribe();
      this.backgroundPollingSub = null;
    }
  }
}
