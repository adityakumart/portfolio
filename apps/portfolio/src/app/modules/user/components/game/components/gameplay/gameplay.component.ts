import {
  Component,
  inject,
  HostListener,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideX,
  lucideVolume2,
  lucideEye,
  lucideEyeOff,
  lucideClock,
  lucideRefreshCw,
  lucideFlag,
  lucideUsers,
  lucideSparkles,
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
      lucideEye,
      lucideEyeOff,
      lucideClock,
      lucideRefreshCw,
      lucideFlag,
      lucideUsers,
      lucideSparkles,
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
              <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Current Turn</span>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-foreground text-base">{{ player.name }}</span>
                <span class="px-2 py-0.5 rounded-full text-xs font-mono font-bold" [ngClass]="player.badgeBgClass">
                  Score: {{ player.score }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Drift-Free Animated Countdown Timer -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Time Left</span>
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

          <button
            type="button"
            (click)="engine.endGame()"
            title="End game and see final scoreboard"
            class="p-2 rounded-xl bg-muted/60 hover:bg-destructive/10 border border-border hover:border-destructive/30 text-muted-foreground hover:text-destructive transition-all"
          >
            <ng-icon name="lucideFlag" class="text-base"></ng-icon>
          </button>
        </div>
      </div>

      <!-- Main Word Presentation Arena Card -->
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

            <!-- Moderator Telugu Title Reveal Accordion -->
            <div class="pt-2">
              <button
                type="button"
                (click)="toggleRevealAnswer()"
                class="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors px-3 py-1 rounded-lg hover:bg-muted/40 cursor-pointer"
              >
                <ng-icon [name]="isAnswerRevealed() ? 'lucideEyeOff' : 'lucideEye'" class="text-sm"></ng-icon>
                <span>{{ isAnswerRevealed() ? 'Hide Original Title' : 'Peek Telugu Title (Caller Hint)' }}</span>
              </button>

              @if (isAnswerRevealed()) {
                <div class="mt-2 p-2.5 rounded-xl bg-muted/60 border border-border/80 inline-block text-xs animate-in fade-in duration-150">
                  <span class="text-muted-foreground mr-1.5">Movie:</span>
                  <span class="font-bold text-foreground text-sm">{{ word.title }}</span>
                  @if (word.year) {
                    <span class="ml-1 text-muted-foreground font-mono">({{ word.year }})</span>
                  }
                </div>
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
            <span class="w-2 h-2 rounded-full" [ngClass]="idx === engine.activePlayerIndex() ? 'bg-indigo-400' : 'bg-muted-foreground/40'"></span>
            <span>{{ player.name }}</span>
            <span class="font-mono font-bold text-foreground">({{ player.score }})</span>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameplayComponent {
  readonly engine = inject(GameEngineService);

  isAnswerRevealed = signal<boolean>(false);

  formattedRemainingTime = computed(() => {
    const total = this.engine.remainingSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  toggleRevealAnswer(): void {
    this.isAnswerRevealed.update((v) => !v);
  }

  onCorrect(): void {
    this.isAnswerRevealed.set(false);
    this.engine.recordAnswer('correct');
  }

  onPass(): void {
    this.isAnswerRevealed.set(false);
    this.engine.recordAnswer('pass');
  }

  // Accessible keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.engine.status() !== 'in_progress') return;

    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.onCorrect();
    } else if (event.code === 'Escape' || event.code === 'ArrowRight') {
      event.preventDefault();
      this.onPass();
    }
  }
}
