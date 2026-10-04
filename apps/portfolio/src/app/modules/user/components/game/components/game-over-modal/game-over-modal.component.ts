import {
  Component,
  inject,
  Output,
  EventEmitter,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrophy,
  lucideRotateCcw,
  lucideSettings,
  lucideCheck,
  lucideX,
  lucideClock,
  lucideAward,
  lucideSparkles,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { GameEngineService } from '../../services/game-engine.service';

@Component({
  selector: 'app-game-over-modal',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
  ],
  providers: [
    provideIcons({
      lucideTrophy,
      lucideRotateCcw,
      lucideSettings,
      lucideCheck,
      lucideX,
      lucideClock,
      lucideAward,
      lucideSparkles,
    }),
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
      <!-- Winner Podium Card -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-background border border-border/80 p-6 md:p-8 shadow-2xl backdrop-blur-md text-center space-y-6">
        <!-- Floating Trophy Icon -->
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10 animate-bounce">
          <ng-icon name="lucideTrophy" class="text-3xl"></ng-icon>
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Game Over!
          </h2>
          @if (engine.leaderboard()[0]; as winner) {
            <p class="text-sm md:text-base text-muted-foreground">
              🏆 <span class="font-bold text-amber-400">{{ winner.name }}</span> takes 1st place with
              <span class="font-bold text-foreground">{{ winner.score }} correct guesses</span>!
            </p>
          }
        </div>

        <!-- Leaderboard Rankings -->
        <div class="space-y-2 max-w-md mx-auto">
          @for (player of engine.leaderboard(); track player.id; let idx = $index) {
            <div
              class="flex items-center justify-between p-3 rounded-xl border transition-all"
              [ngClass]="idx === 0
                ? 'bg-amber-500/10 border-amber-500/30 shadow-sm'
                : 'bg-muted/40 border-border/60'"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-mono"
                  [ngClass]="{
                    'bg-amber-500 text-black': idx === 0,
                    'bg-slate-400 text-black': idx === 1,
                    'bg-amber-700 text-white': idx === 2,
                    'bg-muted text-muted-foreground': idx > 2
                  }"
                >
                  {{ idx + 1 }}
                </span>
                <span class="font-bold text-sm text-foreground">{{ player.name }}</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="text-muted-foreground">{{ player.passedCount }} passed</span>
                <span class="font-mono font-black text-base text-emerald-400">
                  {{ player.score }} pts
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Summary Stats Pills -->
        <div class="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
          <div class="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span class="block text-muted-foreground text-[10px] uppercase font-semibold">Total Guessed</span>
            <span class="text-lg font-bold font-mono text-emerald-400">{{ totalGuessedCount() }}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span class="block text-muted-foreground text-[10px] uppercase font-semibold">Total Passed</span>
            <span class="text-lg font-bold font-mono text-rose-400">{{ totalPassedCount() }}</span>
          </div>
          <div class="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <span class="block text-muted-foreground text-[10px] uppercase font-semibold">Accuracy</span>
            <span class="text-lg font-bold font-mono text-indigo-400">{{ accuracyPercentage() }}%</span>
          </div>
        </div>

        <!-- Action CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            (click)="onPlayAgain()"
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ng-icon name="lucideRotateCcw" class="text-base"></ng-icon>
            <span>Play Again</span>
          </button>
          <button
            type="button"
            (click)="onNewSetup()"
            class="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-foreground bg-card hover:bg-muted border border-border transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ng-icon name="lucideSettings" class="text-base"></ng-icon>
            <span>Change Settings</span>
          </button>
        </div>
      </div>

      <!-- Word History Review Log -->
      @if (engine.history().length > 0) {
        <div class="bg-card border border-border/80 rounded-2xl p-6 shadow-md space-y-3">
          <h3 class="text-sm font-bold text-foreground">
            Session History Recap ({{ engine.history().length }} Words)
          </h3>
          <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
            @for (item of engine.history(); track item.wordId + $index) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/40 text-xs gap-3">
                <div class="space-y-0.5 min-w-0 flex-1">
                  <span class="font-bold text-foreground block truncate">{{ item.title }}</span>
                  @if (item.englishTranslation) {
                    <span class="text-indigo-400/90 italic text-[11px] block truncate">
                      English: &ldquo;{{ item.englishTranslation }}&rdquo;
                    </span>
                  }
                  @if (item.teluguTranslation) {
                    <span class="text-amber-400/90 italic text-[11px] block truncate">
                      Telugu: &ldquo;{{ item.teluguTranslation }}&rdquo;
                    </span>
                  }
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1"
                    [ngClass]="item.result === 'correct' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'"
                  >
                    <ng-icon [name]="item.result === 'correct' ? 'lucideCheck' : 'lucideX'" class="text-xs"></ng-icon>
                    <span>{{ item.result }}</span>
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameOverModalComponent {
  readonly engine = inject(GameEngineService);

  @Output() playAgain = new EventEmitter<void>();
  @Output() newSetup = new EventEmitter<void>();

  totalGuessedCount = computed(() => {
    return this.engine.history().filter((h) => h.result === 'correct').length;
  });

  totalPassedCount = computed(() => {
    return this.engine.history().filter((h) => h.result === 'pass').length;
  });

  accuracyPercentage = computed(() => {
    const total = this.engine.history().length;
    if (total === 0) return 0;
    const correct = this.totalGuessedCount();
    return Math.round((correct / total) * 100);
  });

  onPlayAgain(): void {
    const settings = this.engine.state().settings;
    this.engine.startGame({
      durationSeconds: settings.durationSeconds,
      playerNames: settings.players.map((p) => p.name),
    });
  }

  onNewSetup(): void {
    this.engine.resetToSetup();
  }
}
