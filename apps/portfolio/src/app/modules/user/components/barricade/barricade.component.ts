import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideSparkles,
  lucideHelpCircle,
  lucideRotateCcw,
  lucideCompass,
  lucideAward,
  lucideLayers,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { BarricadeStateService } from './services/barricade-state.service';
import { BarricadeAiService } from './services/barricade-ai.service';
import { BarricadeBoardComponent } from './components/barricade-board/barricade-board.component';
import { BarricadeControlsComponent } from './components/barricade-controls/barricade-controls.component';
import { BarricadeWinDialogComponent } from './components/barricade-win-dialog/barricade-win-dialog.component';

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
    BarricadeBoardComponent,
    BarricadeControlsComponent,
    BarricadeWinDialogComponent,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideSparkles,
      lucideHelpCircle,
      lucideRotateCcw,
      lucideCompass,
      lucideAward,
      lucideLayers,
    }),
  ],
  templateUrl: './barricade.component.html',
  styleUrl: './barricade.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeComponent implements OnInit {
  readonly stateService = inject(BarricadeStateService);
  // Ensure AI handler is registered
  private readonly aiService = inject(BarricadeAiService);

  ngOnInit(): void {
    // If empty game, start fresh
    if (this.stateService.walls().length === 0 && this.stateService.moveHistory().length === 0) {
      this.stateService.initGame('vs_computer', 'intro');
    }
  }

  /**
   * Sets up the exact board state depicted in the user's reference screenshot:
   * - Red pawn (Player 1) at e4
   * - Blue pawn (Computer) at c7
   * - Previous move highlight on b7
   * - 3 horizontal walls between row 6 and 7 across columns a-b, c-d, e-f
   * - Player 1 has 7/10 walls, Computer has 10/10 walls
   */
  loadReferencePreset(): void {
    this.stateService.initGame('vs_computer', 'intro');
    this.stateService.setScenario(
      { row: 4, col: 5 }, // e4
      { row: 7, col: 3 }, // c7
      [
        { id: 'w_ab_67', row: 6, col: 1, orientation: 'horizontal', placedBy: 'player1' }, // cols a-b
        { id: 'w_cd_67', row: 6, col: 3, orientation: 'horizontal', placedBy: 'player1' }, // cols c-d
        { id: 'w_ef_67', row: 6, col: 5, orientation: 'horizontal', placedBy: 'player1' }, // cols e-f
      ],
      { row: 7, col: 2 }, // b7
      7,
      10
    );
  }
}
