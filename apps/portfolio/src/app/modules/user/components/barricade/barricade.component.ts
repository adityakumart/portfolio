import {
  Component,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideGamepad2,
  lucideUsers,
  lucideBot,
  lucideCrown,
  lucideDices,
  lucideSparkles,
  lucideArrowRight,
  lucideTrophy,
  lucideFlame,
  lucideCompass,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { GameMode } from '../../../../shared/barricade';

@Component({
  selector: 'app-barricade',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideGamepad2,
      lucideUsers,
      lucideBot,
      lucideCrown,
      lucideDices,
      lucideSparkles,
      lucideArrowRight,
      lucideTrophy,
      lucideFlame,
      lucideCompass,
    }),
  ],
  templateUrl: './barricade.component.html',
  styleUrl: './barricade.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeComponent {
  selectedMode = signal<GameMode>('two_players');
  isGameActive = signal<boolean>(false);

  setGameMode(mode: GameMode): void {
    this.selectedMode.set(mode);
  }

  launchGame(): void {
    this.isGameActive.set(true);
  }
}
