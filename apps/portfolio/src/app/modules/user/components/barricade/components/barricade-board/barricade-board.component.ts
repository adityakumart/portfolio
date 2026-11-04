import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideRotateCw,
  lucideShield,
  lucideHand,
  lucideInfo,
} from '@ng-icons/lucide';
import {
  CellCoord,
  COL_LETTERS,
  Wall,
  WallCoord,
  WallOrientation,
  areCoordsEqual,
  coordToAlgebraic,
} from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';
import { BarricadeBfsEngineService } from '../../services/barricade-bfs-engine.service';

interface RenderCell {
  row: number;
  col: number;
  algebraic: string;
  isRedGoal: boolean;
  isBlueGoal: boolean;
  isP1: boolean;
  isP2: boolean;
  isPreviousMove: boolean;
  isLegalMove: boolean;
}

@Component({
  selector: 'app-barricade-board',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideRotateCw,
      lucideShield,
      lucideHand,
      lucideInfo,
    }),
  ],
  templateUrl: './barricade-board.component.html',
  styleUrl: './barricade-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeBoardComponent {
  readonly state = inject(BarricadeStateService);
  private readonly bfsEngine = inject(BarricadeBfsEngineService);

  readonly colLetters = COL_LETTERS; // ['a'..'i']
  readonly rowsDescending = [9, 8, 7, 6, 5, 4, 3, 2, 1]; // Ranks from top (9) to bottom (1)
  readonly colsAscending = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Files from left (1) to right (9)

  // Wall placement mode & hover preview
  readonly isWallPlacementMode = signal<boolean>(false);
  readonly hoveredSlot = signal<{ row: number; col: number; orientation: WallOrientation; isLegal: boolean } | null>(null);

  /**
   * Precomputed 9x9 grid cells for reactive rendering.
   */
  readonly gridCells = computed<RenderCell[][]>(() => {
    const p1Pos = this.state.player1().position;
    const p2Pos = this.state.player2().position;
    const prevTile = this.state.previousOpponentTile();
    const legalMoves = this.state.legalMoves();

    return this.rowsDescending.map((r) =>
      this.colsAscending.map((c) => {
        const coord: CellCoord = { row: r, col: c };
        const algebraic = coordToAlgebraic(coord);
        const isLegal = legalMoves.some((m) => areCoordsEqual(m.target, coord));

        return {
          row: r,
          col: c,
          algebraic,
          isRedGoal: r === 9,
          isBlueGoal: r === 1,
          isP1: areCoordsEqual(p1Pos, coord),
          isP2: areCoordsEqual(p2Pos, coord),
          isPreviousMove: areCoordsEqual(prevTile, coord),
          isLegalMove: isLegal,
        };
      })
    );
  });

  onCellClick(cell: RenderCell): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    if (cell.isLegalMove) {
      this.state.movePawn({ row: cell.row, col: cell.col });
    }
  }

  togglePlacementMode(): void {
    this.isWallPlacementMode.update((v) => !v);
  }

  toggleOrientation(): void {
    this.state.toggleWallOrientation();
    // Update preview if hovering
    const cur = this.hoveredSlot();
    if (cur) {
      this.onWallSlotHover(cur.row, cur.col, this.state.wallOrientation());
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.state.isGameOver()) {
      event.preventDefault();
      this.toggleOrientation();
    }
  }

  onWallSlotHover(row: number, col: number, orientation: WallOrientation): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    const p1 = this.state.player1();
    const p2 = this.state.player2();
    const current = this.state.currentPlayer();

    if (current.wallsRemaining <= 0) {
      this.hoveredSlot.set({ row, col, orientation, isLegal: false });
      return;
    }

    const isLegal = this.bfsEngine.canPlaceWall(
      { row, col, orientation },
      this.state.walls(),
      p1.position,
      p2.position
    );

    this.hoveredSlot.set({ row, col, orientation, isLegal });
  }

  onWallSlotLeave(): void {
    this.hoveredSlot.set(null);
  }

  onWallSlotClick(row: number, col: number): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    const orientation = this.state.wallOrientation();
    const success = this.state.placeWall({ row, col, orientation });
    if (success) {
      this.hoveredSlot.set(null);
    }
  }
}
