import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideDices,
  lucideRotateCcw,
  lucideUsers,
  lucideBot,
  lucideSparkles,
  lucideShieldAlert,
  lucideTrophy,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { GameMode } from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';

@Component({
  selector: 'app-barricade-controls',
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
      lucideDices,
      lucideRotateCcw,
      lucideUsers,
      lucideBot,
      lucideSparkles,
      lucideShieldAlert,
      lucideTrophy,
    }),
  ],
  templateUrl: './barricade-controls.component.html',
  styleUrl: './barricade-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeControlsComponent {
  readonly state = inject(BarricadeStateService);
  readonly isRollingAnimation = signal<boolean>(false);

  onRollDice(): void {
    if (
      this.state.phase() !== 'WAITING_FOR_DICE' ||
      this.state.isCurrentPlayerComputer() ||
      this.state.isGameOver()
    ) {
      return;
    }

    this.isRollingAnimation.set(true);
    setTimeout(() => {
      this.state.rollDice();
      this.isRollingAnimation.set(false);
    }, 400);
  }

  onToggleMode(mode: GameMode): void {
    this.state.setGameMode(mode);
  }

  onReset(): void {
    this.state.resetGame();
  }
}
