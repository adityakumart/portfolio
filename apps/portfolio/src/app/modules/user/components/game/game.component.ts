import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from './services/game-engine.service';
import { GameDashboardComponent } from './components/game-dashboard/game-dashboard.component';
import { GameplayComponent } from './components/gameplay/gameplay.component';
import { GameOverModalComponent } from './components/game-over-modal/game-over-modal.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    GameDashboardComponent,
    GameplayComponent,
    GameOverModalComponent,
  ],
  template: `
    <div class="game-container min-h-screen p-4 md:p-8">
      @switch (engine.status()) {
        @case ('setup') {
          <app-game-dashboard (startGame)="onStartGame($event)"></app-game-dashboard>
        }
        @case ('in_progress') {
          <app-gameplay></app-gameplay>
        }
        @case ('paused') {
          <app-gameplay></app-gameplay>
        }
        @case ('completed') {
          <app-game-over-modal></app-game-over-modal>
        }
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  readonly engine = inject(GameEngineService);

  onStartGame(config: { durationSeconds: number; playerNames: string[] }): void {
    this.engine.startGame(config);
  }
}
