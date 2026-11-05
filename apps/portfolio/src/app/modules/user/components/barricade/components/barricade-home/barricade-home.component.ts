import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideBot,
  lucideUsers,
  lucideClock,
  lucidePlay,
  lucideSparkles,
  lucidePalette,
  lucideCheck,
  lucideSliders,
  lucideLayers,
  lucideRotateCcw,
  lucideTarget,
  lucideChevronRight,
  lucideTrophy,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import {
  ActionEconomyOption,
  ACTION_ECONOMY_CONFIGS,
  AiDifficulty,
  BarricadeConfig,
  GameMode,
  PlayerColor,
  PlayerCount,
  PLAYER_COLOR_PALETTE,
  TimeControlMinutes,
  TIME_CONTROL_OPTIONS,
} from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';

interface PlayerDraft {
  name: string;
  color: PlayerColor;
  isComputer: boolean;
}

@Component({
  selector: 'app-barricade-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideBot,
      lucideUsers,
      lucideClock,
      lucidePlay,
      lucideSparkles,
      lucidePalette,
      lucideCheck,
      lucideSliders,
      lucideLayers,
      lucideRotateCcw,
      lucideTarget,
      lucideChevronRight,
      lucideTrophy,
    }),
  ],
  templateUrl: './barricade-home.component.html',
  styleUrl: './barricade-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeHomeComponent {
  readonly stateService = inject(BarricadeStateService);

  readonly colorPalette = PLAYER_COLOR_PALETTE;
  readonly actionConfigs = ACTION_ECONOMY_CONFIGS;
  readonly timeOptions = TIME_CONTROL_OPTIONS;

  // Configuration Signals
  readonly selectedMode = signal<GameMode>('vs_computer');
  readonly selectedPlayerCount = signal<PlayerCount>(2);
  readonly selectedDifficulty = signal<AiDifficulty>('intro');
  readonly selectedActionEconomy = signal<ActionEconomyOption>('1+0');
  readonly selectedTimeControl = signal<TimeControlMinutes>(10);

  // Player Drafts: up to 4 players
  readonly playersDraft = signal<PlayerDraft[]>([
    { name: 'Player 1 (You)', color: 'red', isComputer: false },
    { name: 'Computer (Intro)', color: 'blue', isComputer: true },
    { name: 'Player 3', color: 'green', isComputer: false },
    { name: 'Player 4', color: 'amber', isComputer: false },
  ]);

  readonly activeDrafts = computed(() => {
    const count = this.selectedPlayerCount();
    const isAi = this.selectedMode() === 'vs_computer';
    const drafts = this.playersDraft();

    if (isAi) {
      return [
        { ...drafts[0], isComputer: false },
        { ...drafts[1], name: `Computer (${this.selectedDifficulty()})`, isComputer: true },
      ];
    }

    return drafts.slice(0, count).map((p, idx) => ({
      ...p,
      name: p.name.includes('Computer') ? `Player ${idx + 1}` : p.name,
      isComputer: false,
    }));
  });

  readonly is4Player = computed(() => this.selectedPlayerCount() === 4);

  readonly hasActiveGame = computed(() => {
    return (
      this.stateService.walls().length > 0 ||
      this.stateService.moveHistory().length > 0
    );
  });

  // Action Economy option codes
  readonly actionOptionKeys: ActionEconomyOption[] = [
    '1+0',
    '1+3',
    '3+0',
    '3+2',
    '5+3',
    '10+0',
    '15+10',
  ];

  onSelectMode(mode: GameMode): void {
    this.selectedMode.set(mode);
    if (mode === 'vs_computer') {
      this.selectedPlayerCount.set(2);
    } else if (mode === 'four_players') {
      this.selectedPlayerCount.set(4);
    } else {
      this.selectedPlayerCount.set(2);
    }
  }

  onSelectPlayerCount(count: PlayerCount): void {
    this.selectedPlayerCount.set(count);
    if (count === 4) {
      this.selectedMode.set('four_players');
    } else if (this.selectedMode() === 'four_players') {
      this.selectedMode.set('two_players');
    }
  }

  onSelectDifficulty(diff: AiDifficulty): void {
    this.selectedDifficulty.set(diff);
  }

  onSelectActionEconomy(opt: ActionEconomyOption): void {
    this.selectedActionEconomy.set(opt);
  }

  onSelectTimeControl(mins: TimeControlMinutes): void {
    this.selectedTimeControl.set(mins);
  }

  updatePlayerName(index: number, newName: string): void {
    this.playersDraft.update((drafts) => {
      const copy = [...drafts];
      copy[index] = { ...copy[index], name: newName };
      return copy;
    });
  }

  selectPlayerColor(playerIndex: number, color: PlayerColor): void {
    this.playersDraft.update((drafts) => {
      const copy = [...drafts];
      // Check if another active player has this color, if so swap
      const existingIdx = copy.findIndex((p, i) => i !== playerIndex && p.color === color);
      if (existingIdx !== -1) {
        copy[existingIdx] = { ...copy[existingIdx], color: copy[playerIndex].color };
      }
      copy[playerIndex] = { ...copy[playerIndex], color };
      return copy;
    });
  }

  isColorChosen(color: PlayerColor, currentIdx: number): boolean {
    const active = this.activeDrafts();
    return active.some((p, i) => i !== currentIdx && p.color === color);
  }

  getColorHex(color: PlayerColor): string {
    return this.colorPalette.find((c) => c.key === color)?.hex ?? '#ef4444';
  }

  onStartMatch(): void {
    const drafts = this.activeDrafts();
    const config: BarricadeConfig = {
      gameMode: this.selectedMode(),
      playerCount: this.selectedPlayerCount(),
      aiDifficulty: this.selectedDifficulty(),
      actionEconomy: this.selectedActionEconomy(),
      timeLimitMinutes: this.selectedTimeControl(),
      players: drafts.map((d) => ({
        name: d.name,
        color: d.color,
        isComputer: d.isComputer,
      })),
    };

    this.stateService.startConfiguredGame(config);
  }

  onResumeMatch(): void {
    this.stateService.resumeGame();
  }
}
