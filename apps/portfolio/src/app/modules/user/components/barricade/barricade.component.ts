import {
  Component,
  ChangeDetectionStrategy,
  inject,
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
import { BarricadeStateService } from './services/barricade-state.service';
import { BarricadeAiService } from './services/barricade-ai.service';
import { BarricadeBoardComponent } from './components/barricade-board/barricade-board.component';
import { BarricadeControlsComponent } from './components/barricade-controls/barricade-controls.component';
import { BarricadeRelocationDialogComponent } from './components/barricade-relocation-dialog/barricade-relocation-dialog.component';
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
    BarricadeRelocationDialogComponent,
    BarricadeWinDialogComponent,
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
  readonly state = inject(BarricadeStateService);
  // Inject AI service so it is instantiated and registered with the state machine
  readonly ai = inject(BarricadeAiService);
}
