import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  lucideClock,
  lucideLayers,
  lucideCheckCircle2,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import {
  AiDifficulty,
  GameMode,
  PLAYER_COLOR_PALETTE,
  PlayerColor,
} from '../../../../../../shared/barricade';
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
      lucideClock,
      lucideLayers,
      lucideCheckCircle2,
    }),
  ],
  templateUrl: './barricade-controls.component.html',
  styleUrl: './barricade-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeControlsComponent {
  readonly state = inject(BarricadeStateService);
  readonly sound = inject(BarricadeSoundService);

  readonly isMenuOpen = signal<boolean>(false);
  readonly showResignConfirm = signal<boolean>(false);

  readonly maxWallsPerPlayer = computed(() =>
    this.state.isFourPlayer() ? 5 : 10
  );

  readonly wallSlots = computed(() =>
    Array.from({ length: this.maxWallsPerPlayer() }, (_, i) => i)
  );

  getColorHex(color: PlayerColor): string {
    return PLAYER_COLOR_PALETTE.find((c) => c.key === color)?.hex ?? '#ef4444';
  }

  formatClock(ms: number | undefined): string {
    if (this.state.timeLimitMinutes() === 0) return '∞';
    if (ms === undefined || ms === null) return '00:00';
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  isLowTime(ms: number | undefined): boolean {
    if (this.state.timeLimitMinutes() === 0) return false;
    return (ms ?? 0) > 0 && (ms ?? 0) <= 60000;
  }

  isCriticalTime(ms: number | undefined): boolean {
    if (this.state.timeLimitMinutes() === 0) return false;
    return (ms ?? 0) > 0 && (ms ?? 0) <= 10000;
  }

  onLobbyClick(): void {
    this.state.goToLobby();
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

  onCancelResign(): void {
    this.showResignConfirm.set(false);
  }

  onConfirmResign(): void {
    this.showResignConfirm.set(false);
    this.state.resign();
  }
}
