import {
  Component,
  inject,
  HostListener,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideX,
  lucideVolume2,
  lucideClock,
  lucideRefreshCw,
  lucideFlag,
  lucideUsers,
  lucideSparkles,
  lucidePlay,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { GameEngineService } from '../../services/game-engine.service';

@Component({
  selector: 'app-gameplay',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideX,
      lucideVolume2,
      lucideClock,
      lucideRefreshCw,
      lucideFlag,
      lucideUsers,
      lucideSparkles,
      lucidePlay,
    }),
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <!-- Top Status Header: Timer, Active Player, and Quick Exit -->
      <div class="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card/80 border border-border/80 shadow-md backdrop-blur-md">
        <!-- Active Player Turn Indicator -->
        <div class="flex items-center gap-3">
          @if (engine.activePlayer(); as player) {
            <div class="relative">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg border-2 shadow-sm transition-transform scale-105"
                [ngClass]="player.colorClass"
              >
                {{ player.name.slice(0, 2).toUpperCase() }}
              </div>
              <span class="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div class="space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {{ engine.turnState() === 'turn_handover' ? 'Next Up' : 'Active Turn' }}
              </span>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-foreground text-base">{{ player.name }}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold" [ngClass]="player.badgeBgClass">
                  Score: {{ player.score }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Drift-Free Animated Countdown Timer & End Game Action -->
        <div class="flex items-center gap-3 md:gap-4">
          <div class="text-right">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Turn Time Left</span>
            <div
              class="text-2xl md:text-3xl font-black font-mono tracking-wider transition-colors"
              [ngClass]="{
                'text-emerald-400': engine.remainingSeconds() > 20,
                'text-amber-400': engine.remainingSeconds() <= 20 && engine.remainingSeconds() > 10,
                'text-rose-500 animate-pulse': engine.remainingSeconds() <= 10
              }"
            >
              {{ formattedRemainingTime() }}
            </div>
          </div>

          <!-- Top Exit Control: Flag Icon + "End Game" Text -->
          <button
            type="button"
            (click)="engine.endGame()"
            title="End game and see final scoreboard"
            class="px-3 py-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <ng-icon name="lucideFlag" class="text-sm"></ng-icon>
            <span>End Game</span>
          </button>
        </div>
      </div>

      <!-- Turn Handover Intermission View -->
      @if (engine.turnState() === 'turn_handover') {
        <div class="relative bg-card/90 border border-border/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md space-y-6 text-center min-h-[360px] flex flex-col justify-center animate-in zoom-in-95 duration-200">
          <div class="space-y-5 max-w-lg mx-auto w-full">
            <!-- Time's up badge -->
            <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10 animate-bounce">
              <ng-icon name="lucideClock" class="text-3xl"></ng-icon>
            </div>

            <div class="space-y-1">
              <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Turn Time Expired</span>
              @if (engine.previousPlayer(); as prev) {
                <h2 class="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Time's Up for {{ prev.name }}!
                </h2>
                <p class="text-sm text-muted-foreground">
                  Completed their turn with <span class="font-bold text-foreground">{{ prev.score }} correct</span> guesses
                  and <span class="font-bold text-foreground">{{ prev.passedCount }} passes</span>.
                </p>
              } @else {
                <h2 class="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  Turn Completed!
                </h2>
              }
            </div>

            <!-- Pass to Next Player Card -->
            @if (engine.activePlayer(); as nextPlayer) {
              <div class="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  👉 Pass device to:
                </span>
                <div class="flex items-center justify-center gap-2">
                  <span class="font-black text-xl text-foreground">{{ nextPlayer.name }}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold" [ngClass]="nextPlayer.badgeBgClass">
                    Current Score: {{ nextPlayer.score }}
                  </span>
                </div>
                <p class="text-xs text-muted-foreground">
                  Clock time ready: <strong class="text-foreground font-mono">{{ engine.state().settings.turnDurationSeconds }}s</strong>
                </p>
              </div>

              <!-- Action button to start next player's turn -->
              <div class="pt-2">
                <button
                  type="button"
                  (click)="engine.startNextPlayerTurn()"
                  class="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer active:scale-95"
                >
                  <ng-icon name="lucidePlay" class="text-lg"></ng-icon>
                  <span>Start {{ nextPlayer.name }}'s Turn</span>
                </button>
                <span class="block mt-2 text-[11px] text-muted-foreground font-mono">
                  Press Space or Enter to begin turn
                </span>
              </div>
            }
          </div>
        </div>
      } @else {
        <!-- Main Word Presentation Arena Card (Active Turn) -->
        <div class="relative bg-card/90 border border-border/80 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md space-y-8 text-center min-h-[360px] flex flex-col justify-between">
          <!-- Top Subheader: Clue prompt & Audio replay -->
          <div class="flex items-center justify-between border-b border-border/50 pb-4">
            <span class="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <ng-icon name="lucideSparkles" class="text-sm"></ng-icon>
              Movie Translation Clues (Guess Telugu Movie)
            </span>

            <div class="flex items-center gap-2">
              <!-- Background Pre-fetch Activity Indicator -->
              @if (engine.isFetchingWords()) {
                <span class="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                  <ng-icon name="lucideRefreshCw" class="animate-spin text-xs text-indigo-400"></ng-icon>
                  <span>Syncing queue...</span>
                </span>
              }

              <!-- Speech Audio Replay Buttons -->
              @if (engine.activeWord(); as word) {
                @if (word.englishTranslation) {
                  <button
                    type="button"
                    (click)="engine.replayCurrentWordAudio('en')"
                    title="Listen to English translation"
                    class="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ng-icon name="lucideVolume2" class="text-sm"></ng-icon>
                    <span>English Audio</span>
                  </button>
                }
                @if (word.teluguTranslation) {
                  <button
                    type="button"
                    (click)="engine.replayCurrentWordAudio('te')"
                    title="Listen to Telugu translation"
                    class="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ng-icon name="lucideVolume2" class="text-sm"></ng-icon>
                    <span>Telugu Audio</span>
                  </button>
                }
              }
            </div>
          </div>

          <!-- Prominent Translation Clues -->
          @if (engine.activeWord(); as word) {
            <div class="space-y-4 my-auto py-4 animate-in fade-in zoom-in-95 duration-200">
              <!-- English Translation Clue -->
              @if (word.englishTranslation) {
                <div class="space-y-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">English Clue</span>
                  <h2 class="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight px-4 selection:bg-indigo-500/30">
                    &ldquo;{{ word.englishTranslation }}&rdquo;
                  </h2>
                </div>
              }

              <!-- Telugu Translation Clue -->
              @if (word.teluguTranslation) {
                <div class="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 max-w-xl mx-auto shadow-sm space-y-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Telugu Clue / Alternate Translation</span>
                  <p class="text-lg sm:text-2xl font-bold text-amber-300 italic tracking-wide">
                    &ldquo;{{ word.teluguTranslation }}&rdquo;
                  </p>
                </div>
              }

              @if (word.cast) {
                <p class="text-sm text-muted-foreground max-w-md mx-auto line-clamp-2">
                  <span class="font-semibold text-muted-foreground/80">Cast Clue:</span> {{ word.cast }}
                </p>
              }

              <!-- Directly Display Original Telugu Title (Answer) Below Clues -->
              <div class="mt-4 p-3 rounded-2xl bg-muted/60 border border-border/80 inline-flex items-center gap-2 max-w-lg mx-auto shadow-sm">
                <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Movie:</span>
                <span class="font-extrabold text-foreground text-base sm:text-lg tracking-tight">{{ word.title }}</span>
                @if (word.year) {
                  <span class="text-xs text-muted-foreground font-mono">({{ word.year }})</span>
                }
              </div>
            </div>
          } @else {
            <!-- Queue Empty fallback / Loading state -->
            <div class="flex flex-col items-center justify-center p-8 space-y-3 my-auto">
              <ng-icon name="lucideRefreshCw" class="animate-spin text-3xl text-indigo-400"></ng-icon>
              <p class="text-sm font-semibold text-foreground">Fetching translation words...</p>
            </div>
          }

          <!-- Interactive Action Controls (Green Check & Red Cross) -->
          <div class="grid grid-cols-2 gap-4 md:gap-8 pt-4 border-t border-border/50 max-w-xl mx-auto w-full">
            <!-- Red Cross: Pass / Skip -->
            <button
              type="button"
              (click)="onPass()"
              [disabled]="!engine.activeWord()"
              class="py-4 px-6 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all duration-150 shadow-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <div class="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ng-icon name="lucideX" class="text-lg text-rose-400"></ng-icon>
              </div>
              <div class="text-left">
                <span class="block leading-none">Pass</span>
                <span class="text-[10px] text-rose-400/60 font-mono font-normal">Esc / Right</span>
              </div>
            </button>

            <!-- Green Check: Correct Answer (+1) -->
            <button
              type="button"
              (click)="onCorrect()"
              [disabled]="!engine.activeWord()"
              class="py-4 px-6 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all duration-150 shadow-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer"
            >
              <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ng-icon name="lucideCheck" class="text-lg text-white"></ng-icon>
              </div>
              <div class="text-left">
                <span class="block leading-none">Correct</span>
                <span class="text-[10px] text-white/70 font-mono font-normal">Space / Enter</span>
              </div>
            </button>
          </div>
        </div>
      }

      <!-- Turn Rotation Roster Bar -->
      <div class="flex items-center gap-2 overflow-x-auto p-3 rounded-2xl bg-card/60 border border-border/60">
        <span class="text-xs font-semibold text-muted-foreground mr-2 flex items-center gap-1">
          <ng-icon name="lucideUsers" class="text-sm"></ng-icon>
          <span>Scoreboard:</span>
        </span>

        @for (player of engine.players(); track player.id; let idx = $index) {
          <div
            class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all"
            [ngClass]="idx === engine.activePlayerIndex()
              ? 'border-indigo-500/60 bg-indigo-500/10 shadow-sm text-foreground'
              : 'border-border/50 bg-muted/30 text-muted-foreground'"
          >
            <span
              class="w-2 h-2 rounded-full"
              [ngClass]="idx === engine.activePlayerIndex() ? 'bg-indigo-400' : 'bg-muted-foreground/40'"
            ></span>
            <span>{{ player.name }}</span>
            <span class="font-mono font-bold text-foreground">({{ player.score }})</span>
            @if (engine.completedPlayerIds().includes(player.id)) {
              <span class="text-[10px] text-emerald-400 font-bold font-mono">✓</span>
            }
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameplayComponent {
  readonly engine = inject(GameEngineService);

  formattedRemainingTime = computed(() => {
    const total = this.engine.remainingSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  onCorrect(): void {
    this.engine.recordAnswer('correct');
  }

  onPass(): void {
    this.engine.recordAnswer('pass');
  }

  // Accessible keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.engine.status() !== 'in_progress') return;

    if (this.engine.turnState() === 'turn_handover') {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
        this.engine.startNextPlayerTurn();
      }
      return;
    }

    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.onCorrect();
    } else if (event.code === 'Escape' || event.code === 'ArrowRight') {
      event.preventDefault();
      this.onPass();
    }
  }
}
