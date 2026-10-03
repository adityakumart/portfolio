import {
  Component,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucidePlay,
  lucidePlus,
  lucideTrash2,
  lucideClock,
  lucideUsers,
  lucideSparkles,
  lucideMinus,
  lucideGamepad2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';

@Component({
  selector: 'app-game-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmButtonImports,
    HlmCardImports,
    HlmInputImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucidePlay,
      lucidePlus,
      lucideTrash2,
      lucideClock,
      lucideUsers,
      lucideSparkles,
      lucideMinus,
      lucideGamepad2,
    }),
  ],
  template: `
    <div class="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <!-- Title Banner -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400">
          <ng-icon name="lucideGamepad2" class="text-sm"></ng-icon>
          <span>Multiplayer Guessing Arena</span>
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Telugu Movie Guesser
        </h1>
        <p class="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
          Hear and read the English translation, then guess the original Telugu movie title before the clock runs out!
        </p>
      </div>

      <!-- Settings Card -->
      <div class="bg-card/90 border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md space-y-8">
        <!-- 1. Custom Time Selector (00:30 to 59:30) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ng-icon name="lucideClock" class="text-base"></ng-icon>
              </div>
              <div>
                <h2 class="text-sm md:text-base font-bold text-foreground">Game Duration</h2>
                <p class="text-xs text-muted-foreground">Select session time (00:30 to 59:30)</p>
              </div>
            </div>

            <!-- Calculated Word Formula Badge -->
            <div class="px-3 py-1 rounded-xl bg-muted/60 border border-border/80 text-xs font-mono font-medium text-foreground">
              <span class="text-indigo-400 font-bold font-mono">{{ estimatedWordCount() }}</span> words
              <span class="text-muted-foreground text-[10px] hidden sm:inline">(1 word / 5s)</span>
            </div>
          </div>

          <!-- Time Display & Stepper Controls -->
          <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
            <div class="text-4xl font-extrabold font-mono text-indigo-400 tracking-wider">
              {{ formattedTime() }}
            </div>

            <div class="flex items-center gap-2 flex-wrap justify-center sm:ml-auto">
              <button
                type="button"
                (click)="adjustTime(-30)"
                [disabled]="durationSeconds() <= 30"
                class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                -30s
              </button>
              <button
                type="button"
                (click)="adjustTime(-60)"
                [disabled]="durationSeconds() <= 60"
                class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                -1m
              </button>
              <button
                type="button"
                (click)="adjustTime(60)"
                [disabled]="durationSeconds() >= 3510"
                class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                +1m
              </button>
              <button
                type="button"
                (click)="adjustTime(30)"
                [disabled]="durationSeconds() >= 3570"
                class="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                +30s
              </button>
            </div>
          </div>

          <!-- Range Slider -->
          <input
            type="range"
            min="30"
            max="3570"
            step="30"
            [ngModel]="durationSeconds()"
            (ngModelChange)="onSliderChange($event)"
            class="w-full accent-indigo-500 cursor-pointer h-2 bg-muted rounded-lg"
          />
        </div>

        <!-- 2. Dynamic Player Registration Form -->
        <div class="space-y-4 border-t border-border/60 pt-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <ng-icon name="lucideUsers" class="text-base"></ng-icon>
              </div>
              <div>
                <h2 class="text-sm md:text-base font-bold text-foreground">Registered Players</h2>
                <p class="text-xs text-muted-foreground">Teams or players taking turns (2 to 8 players)</p>
              </div>
            </div>

            <button
              type="button"
              (click)="addPlayer()"
              [disabled]="playersList().length >= 8"
              class="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ng-icon name="lucidePlus" class="text-sm"></ng-icon>
              <span>Add Player</span>
            </button>
          </div>

          <!-- Dynamic Player Inputs Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (player of playersList(); track player.id; let idx = $index) {
              <div class="flex items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/60">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono bg-muted text-muted-foreground">
                  {{ idx + 1 }}
                </span>
                <input
                  type="text"
                  [ngModel]="player.name"
                  (ngModelChange)="updatePlayerName(idx, $event)"
                  placeholder="Player {{ idx + 1 }}"
                  maxlength="25"
                  class="flex-1 bg-transparent border-0 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/40 rounded px-1.5 py-1"
                />
                @if (playersList().length > 2) {
                  <button
                    type="button"
                    (click)="removePlayer(idx)"
                    title="Remove player"
                    class="p-1 text-muted-foreground hover:text-destructive transition-colors rounded"
                  >
                    <ng-icon name="lucideTrash2" class="text-xs"></ng-icon>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- 3. Start Game Action Button -->
        <div class="pt-2">
          <button
            type="button"
            (click)="onStart()"
            class="w-full py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <ng-icon name="lucidePlay" class="text-lg"></ng-icon>
            <span>Start Guessing Game ({{ formattedTime() }})</span>
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDashboardComponent {
  @Output() startGame = new EventEmitter<{
    durationSeconds: number;
    playerNames: string[];
  }>();

  durationSeconds = signal<number>(120);

  playersList = signal<Array<{ id: string; name: string }>>([
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
  ]);

  formattedTime = computed(() => {
    const total = this.durationSeconds();
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  estimatedWordCount = computed(() => {
    return Math.ceil(this.durationSeconds() / 5);
  });

  adjustTime(deltaSeconds: number): void {
    const next = this.durationSeconds() + deltaSeconds;
    this.durationSeconds.set(Math.min(3570, Math.max(30, next)));
  }

  onSliderChange(value: number): void {
    const val = Number(value);
    if (!isNaN(val)) {
      this.durationSeconds.set(Math.min(3570, Math.max(30, val)));
    }
  }

  addPlayer(): void {
    if (this.playersList().length >= 8) return;
    const nextIdx = this.playersList().length + 1;
    this.playersList.update((list) => [
      ...list,
      { id: Date.now().toString(), name: `Player ${nextIdx}` },
    ]);
  }

  removePlayer(index: number): void {
    if (this.playersList().length <= 2) return;
    this.playersList.update((list) => list.filter((_, i) => i !== index));
  }

  updatePlayerName(index: number, newName: string): void {
    this.playersList.update((list) =>
      list.map((p, i) => (i === index ? { ...p, name: newName } : p)),
    );
  }

  onStart(): void {
    const playerNames = this.playersList().map(
      (p, i) => p.name.trim() || `Player ${i + 1}`,
    );
    this.startGame.emit({
      durationSeconds: this.durationSeconds(),
      playerNames,
    });
  }
}
