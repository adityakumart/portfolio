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
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
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
    }),
  ],
  template: `
    @if (state.isGameOver() && state.winner(); as winner) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          hlmCard
          class="relative w-full max-w-md p-6 md:p-8 rounded-3xl border border-zinc-700 bg-zinc-900/95 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200"
        >
          <!-- Trophy Badge -->
          <div class="relative mx-auto h-20 w-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <ng-icon name="lucideTrophy" class="text-4xl" />
            <div class="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-yellow-400 text-yellow-950 flex items-center justify-center font-bold text-xs shadow-md">
              <ng-icon name="lucideCrown" class="text-base" />
            </div>
          </div>

          <!-- Victory Header -->
          <div class="space-y-1.5">
            <span
              hlmBadge
              class="bg-amber-500/10 border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider px-3 py-1"
            >
              Goal Line Reached!
            </span>
            <h2 class="text-2xl md:text-3xl font-black text-white">
              {{ winner.name }} Wins!
            </h2>
            <p class="text-xs md:text-sm text-zinc-400">
              Successfully crossed the board and reached the destination row!
            </p>
          </div>

          <!-- Match Statistics Card -->
          <div class="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 text-left">
            <div>
              <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Turns</span>
              <p class="text-lg font-black text-zinc-100 font-mono">{{ state.turnCount() }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Walls Placed</span>
              <p class="text-lg font-black text-zinc-100 font-mono">{{ state.walls().length }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              hlmBtn
              size="lg"
              class="w-full sm:flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              (click)="onPlayAgain()"
            >
              <ng-icon name="lucideRotateCcw" class="text-base" />
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

  onPlayAgain(): void {
    this.state.initGame();
  }
}
