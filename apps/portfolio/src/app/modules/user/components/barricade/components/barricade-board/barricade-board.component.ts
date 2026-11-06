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
  lucideTarget,
  lucideCrown,
} from '@ng-icons/lucide';
import {
  CellCoord,
  COL_LETTERS,
  PLAYER_COLOR_PALETTE,
  PlayerColor,
  Wall,
  WallCoord,
  WallOrientation,
  areCoordsEqual,
  coordToAlgebraic,
} from '../../../../../../shared/barricade';
import { BarricadeStateService } from '../../services/barricade-state.service';
import { BarricadeBfsEngineService } from '../../services/barricade-bfs-engine.service';

export interface RenderPawn {
  id: string;
  name: string;
  colorHex: string;
  label: string; // P1, P2, P3, P4
  isCurrentTurn: boolean;
}

export interface RenderCell {
  row: number;
  col: number;
  algebraic: string;
  isCenterGoal: boolean; // row 5, col 5 in 4-player
  isRedGoal: boolean; // row 9 in 2-player
  isBlueGoal: boolean; // row 1 in 2-player
  pawn: RenderPawn | null;
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
      lucideTarget,
      lucideCrown,
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

  readonly isWallPlacementMode = signal<boolean>(false);
  readonly hoveredSlot = signal<{
    row: number;
    col: number;
    orientation: WallOrientation;
    isLegal: boolean;
  } | null>(null);

  getColorHex(color: PlayerColor): string {
    return PLAYER_COLOR_PALETTE.find((c) => c.key === color)?.hex ?? '#ef4444';
  }

  /**
   * Precomputed 9x9 grid cells for reactive rendering.
   */
  readonly gridCells = computed<RenderCell[][]>(() => {
    const is4P = this.state.isFourPlayer();
    const players = this.state.players();
    const currentIdx = this.state.currentPlayerIndex();
    const prevTile = this.state.previousOpponentTile();
    const legalMoves = this.state.legalMoves();

    return this.rowsDescending.map((r) =>
      this.colsAscending.map((c) => {
        const coord: CellCoord = { row: r, col: c };
        const algebraic = coordToAlgebraic(coord);
        const isLegal = legalMoves.some((m) => areCoordsEqual(m.target, coord));

        // Find pawn at this cell
        const playerOnCell = players.find(
          (p) => !p.isEliminated && areCoordsEqual(p.position, coord)
        );
        let pawn: RenderPawn | null = null;
        if (playerOnCell) {
          const pIndex = players.indexOf(playerOnCell);
          pawn = {
            id: playerOnCell.id,
            name: playerOnCell.name,
            colorHex: this.getColorHex(playerOnCell.color),
            label: `P${pIndex + 1}`,
            isCurrentTurn: pIndex === currentIdx,
          };
        }

        return {
          row: r,
          col: c,
          algebraic,
          isCenterGoal: is4P && r === 5 && c === 5,
          isRedGoal: !is4P && r === 9,
          isBlueGoal: !is4P && r === 1,
          pawn,
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

  toggleOrientation(): void {
    this.state.toggleWallOrientation();
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
    const current = this.state.currentPlayer();

    if (
      current.wallsRemaining <= 0 ||
      this.state.wallsRemainingThisTurn() <= 0 ||
      this.state.wallsAllowed() === 0
    ) {
      this.hoveredSlot.set({ row, col, orientation, isLegal: false });
      return;
    }

    const isLegal = this.bfsEngine.canPlaceWallMulti(
      { row, col, orientation },
      this.state.walls(),
      this.state.players()
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
