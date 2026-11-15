import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrophy,
  lucideCrown,
  lucideRotateCcw,
  lucideSparkles,
  lucideUsers,
  lucideBot,
  lucideFlag,
  lucideChevronLeft,
  lucideTarget,
  lucideClock,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { PLAYER_COLOR_PALETTE, PlayerColor } from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';

@Component({
  selector: 'app-barricade-win-dialog',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideTrophy,
      lucideCrown,
      lucideRotateCcw,
      lucideSparkles,
      lucideUsers,
      lucideBot,
      lucideFlag,
      lucideChevronLeft,
      lucideTarget,
      lucideClock,
    }),
  ],
  template: `
    @if (state.isGameOver() && state.winner(); as winner) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          hlmCard
          class="relative w-full max-w-md p-6 md:p-8 rounded-3xl border border-border bg-card text-card-foreground shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200"
        >
          <!-- Trophy Badge with Winner Color Accent -->
          <div
            class="relative mx-auto h-20 w-20 rounded-3xl flex items-center justify-center shadow-xl border border-border transition-all duration-300"
            [style.background]="'radial-gradient(circle, ' + getColorHex(winner.color) + ' 0%, var(--card) 100%)'">
            <ng-icon name="lucideTrophy" class="text-4xl text-amber-500 dark:text-amber-300 drop-shadow" />
            <div class="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-md">
              <ng-icon name="lucideCrown" class="text-base" />
            </div>
          </div>

          <!-- Victory Header -->
          <div class="space-y-1.5">
            <span
              hlmBadge
              class="bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1.5 justify-center w-fit mx-auto"
            >
              @if (state.winReason() === 'timeout') {
                <ng-icon name="lucideClock" class="text-xs" />
                <span>Won on Time</span>
              } @else if (state.isFourPlayer()) {
                <ng-icon name="lucideTarget" class="text-xs" />
                <span>Center Sanctum Conquered!</span>
              } @else {
                <ng-icon name="lucideSparkles" class="text-xs" />
                <span>Goal Line Reached!</span>
              }
            </span>

            <h2 class="text-2xl md:text-3xl font-black text-foreground">
              {{ winner.name }} Wins!
            </h2>
            <p class="text-xs md:text-sm text-muted-foreground">
              @if (state.winReason() === 'timeout') {
                Opponent run out of time on match countdown clock.
              } @else if (state.isFourPlayer()) {
                Successfully navigated to the center square (e5) before all opponents!
              } @else {
                Successfully crossed the board and reached the destination row!
              }
            </p>
          </div>

          <!-- Match Statistics Card -->
          <div class="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-muted/60 border border-border text-left">
            <div>
              <span class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Turns</span>
              <p class="text-base font-black text-foreground font-mono">{{ state.turnCount() }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Barricades</span>
              <p class="text-base font-black text-foreground font-mono">{{ state.walls().length }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Mode</span>
              <p class="text-xs font-black text-foreground font-mono uppercase truncate">{{ state.actionEconomy() }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-border shadow-sm"
              (click)="onLobby()"
            >
              <ng-icon name="lucideChevronLeft" class="text-sm" />
              <span>Back to Lobby</span>
            </button>

            <button
              type="button"
              class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-950/20 transition-all flex items-center justify-center gap-1.5"
              (click)="onPlayAgain()"
            >
              <ng-icon name="lucideRotateCcw" class="text-sm" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeWinDialogComponent {
  readonly state = inject(BarricadeStateService);

  getColorHex(color: PlayerColor): string {
    return PLAYER_COLOR_PALETTE.find((c) => c.key === color)?.hex ?? '#ef4444';
  }

  onPlayAgain(): void {
    // Restart with same players and rules
    const config = {
      gameMode: this.state.gameMode(),
      playerCount: this.state.playerCount(),
      aiDifficulty: this.state.aiDifficulty(),
      actionEconomy: this.state.actionEconomy(),
      timeLimitMinutes: this.state.timeLimitMinutes(),
      players: this.state.players().map((p) => ({
        name: p.name,
        color: p.color,
        isComputer: p.isComputer,
      })),
    };
    this.state.startConfiguredGame(config);
  }

  onLobby(): void {
    this.state.goToLobby();
  }
}
