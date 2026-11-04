import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideVolume2,
  lucideVolumeX,
  lucideMoreHorizontal,
  lucideFlag,
  lucideRotateCcw,
  lucideBot,
  lucideUsers,
  lucideSparkles,
  lucideTrophy,
  lucideCheck,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { AiDifficulty, GameMode } from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';
import { BarricadeSoundService } from '../../services/barricade-sound.service';

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
      lucideChevronLeft,
      lucideVolume2,
      lucideVolumeX,
      lucideMoreHorizontal,
      lucideFlag,
      lucideRotateCcw,
      lucideBot,
      lucideUsers,
      lucideSparkles,
      lucideTrophy,
      lucideCheck,
    }),
  ],
  templateUrl: './barricade-controls.component.html',
  styleUrl: './barricade-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeControlsComponent {
  readonly state = inject(BarricadeStateService);
  readonly sound = inject(BarricadeSoundService);
  private readonly router = inject(Router);

  readonly isMenuOpen = signal<boolean>(false);
  readonly showResignConfirm = signal<boolean>(false);

  // Array of 10 indices for rendering the 10-segment wall meter
  readonly wallSlots = Array.from({ length: 10 }, (_, i) => i);

  onLobbyClick(): void {
    // Navigate back to user games or trigger lobby mode
    this.router.navigate(['/user/game']);
  }

  onToggleSound(): void {
    this.sound.toggleMute();
  }

  onToggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  onSelectMode(mode: GameMode, difficulty: AiDifficulty = 'intro'): void {
    this.state.initGame(mode, difficulty);
    this.isMenuOpen.set(false);
  }

  onUndo(): void {
    this.state.undo();
  }

  onResignClick(): void {
    if (this.state.isGameOver()) return;
    this.showResignConfirm.set(true);
  }

  onConfirmResign(): void {
    this.showResignConfirm.set(false);
    this.state.resign();
  }

  onCancelResign(): void {
    this.showResignConfirm.set(false);
  }
}
