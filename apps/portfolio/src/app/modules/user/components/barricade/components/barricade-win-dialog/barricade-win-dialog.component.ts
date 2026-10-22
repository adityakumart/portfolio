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
    }),
  ],
  template: `
    @if (state.isGameOver() && state.winner(); as winner) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
      >
        <div
          hlmCard
          class="relative w-full max-w-md p-6 md:p-8 rounded-3xl border border-amber-500/40 bg-card/95 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200"
        >
          <!-- Trophy / Crown Icon Badge -->
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
              class="bg-amber-500/10 border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider px-3 py-1"
            >
              Castle Claimed!
            </span>
            <h2 class="text-2xl md:text-3xl font-black text-foreground">
              {{ winner.name }} Wins!
            </h2>
            <p class="text-xs md:text-sm text-muted-foreground">
              Successfully breached all chokepoints and conquered the summit castle!
            </p>
          </div>

          <!-- Match Statistics -->
          <div class="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60 text-left">
            <div>
              <span class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">Total Turns</span>
              <span class="text-base font-extrabold text-foreground">{{ state.turnCount() }}</span>
            </div>
            <div>
              <span class="text-[11px] text-muted-foreground uppercase font-bold tracking-wider block">Mode</span>
              <span class="text-base font-extrabold text-foreground">
                {{ state.gameMode() === 'two_players' ? '2 Players' : 'Vs AI' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              hlmBtn
              class="flex-1 h-11 rounded-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-500/20 gap-2"
              (click)="onPlayAgain()"
            >
              <ng-icon name="lucideRotateCcw" class="text-base" />
              <span>Play Again</span>
            </button>

            <button
              hlmBtn
              variant="outline"
              class="h-11 rounded-xl border-border text-foreground hover:bg-muted gap-2 font-semibold"
              (click)="onSwitchMode()"
            >
              @if (state.gameMode() === 'two_players') {
                <ng-icon name="lucideBot" class="text-base" />
                <span>Try Vs AI</span>
              } @else {
                <ng-icon name="lucideUsers" class="text-base" />
                <span>2 Players</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeWinDialogComponent {
  readonly state = inject(BarricadeStateService);

  onPlayAgain(): void {
    this.state.resetGame();
  }

  onSwitchMode(): void {
    const nextMode =
      this.state.gameMode() === 'two_players' ? 'vs_computer' : 'two_players';
    this.state.setGameMode(nextMode);
  }
}
