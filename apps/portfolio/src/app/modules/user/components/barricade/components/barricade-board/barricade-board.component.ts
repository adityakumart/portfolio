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
  lucideCheck,
  lucideX,
  lucideMove,
  lucideLayers,
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
import { ThemeService } from '../../../../../../theme.service';
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
  isP1Goal: boolean; // row 9 in 2-player
  isP2Goal: boolean; // row 1 in 2-player
  p1GoalColorHex?: string;
  p2GoalColorHex?: string;
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
      lucideCheck,
      lucideX,
      lucideMove,
      lucideLayers,
    }),
  ],
  templateUrl: './barricade-board.component.html',
  styleUrl: './barricade-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeBoardComponent {
  readonly state = inject(BarricadeStateService);
  readonly theme = inject(ThemeService);
  private readonly bfsEngine = inject(BarricadeBfsEngineService);

  readonly colLetters = COL_LETTERS; // ['a'..'i']
  readonly rowsDescending = [9, 8, 7, 6, 5, 4, 3, 2, 1]; // Ranks from top (9) to bottom (1)
  readonly colsAscending = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Files from left (1) to right (9)

  readonly interactionMode = signal<'move' | 'wall'>('move');
  readonly hoveredSlot = signal<{
    row: number;
    col: number;
    orientation: WallOrientation;
    isLegal: boolean;
  } | null>(null);

  getColorHex(color: PlayerColor): string {
    return PLAYER_COLOR_PALETTE.find((c) => c.key === color)?.hex ?? '#ef4444';
  }

  getPlayerPawnHex(playerId?: string): string {
    const p = this.state.players().find((pl) => pl.playerId === playerId);
    return p ? this.getColorHex(p.color) : '#ef4444';
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

    const p1 = players[0];
    const p2 = players[1];
    const p1Hex = p1 ? this.getColorHex(p1.color) : '#ef4444';
    const p2Hex = p2 ? this.getColorHex(p2.color) : '#3b82f6';

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
          isP1Goal: !is4P && r === 9,
          isP2Goal: !is4P && r === 1,
          p1GoalColorHex: p1Hex,
          p2GoalColorHex: p2Hex,
          pawn,
          isPreviousMove: areCoordsEqual(prevTile, coord),
          isLegalMove: isLegal,
        };
      })
    );
  });

  getCellFill(cell: RenderCell): string {
    const isDark = this.theme.darkMode();
    if (cell.isPreviousMove) {
      return isDark ? '#4e4321' : '#fef3c7';
    }
    if (cell.isCenterGoal) {
      return isDark ? '#382810' : '#fef9c3';
    }
    if (cell.isP1Goal && cell.p1GoalColorHex) {
      return isDark ? cell.p1GoalColorHex + '30' : cell.p1GoalColorHex + '20';
    }
    if (cell.isP2Goal && cell.p2GoalColorHex) {
      return isDark ? cell.p2GoalColorHex + '30' : cell.p2GoalColorHex + '20';
    }
    if (cell.isLegalMove) {
      return isDark ? '#1e3a2b' : '#dcfce7';
    }
    return isDark ? '#27272a' : '#e2e8f0';
  }

  getWallFill(): string {
    return this.theme.darkMode() ? '#f4f4f5' : '#1e293b';
  }

  getWallPreviewFill(isLegal: boolean): string {
    if (!isLegal) return 'rgba(239, 68, 68, 0.7)';
    return this.theme.darkMode()
      ? 'rgba(255, 255, 255, 0.75)'
      : 'rgba(30, 41, 59, 0.75)';
  }

  getWallPreviewStroke(isLegal: boolean): string {
    if (!isLegal) return '#ef4444';
    return this.theme.darkMode() ? '#ffffff' : '#1e293b';
  }

  getLegalMoveStroke(): string {
    return this.theme.darkMode() ? '#e4e4e7' : '#475569';
  }

  getCoordinateFill(): string {
    return this.theme.darkMode() ? '#71717a' : '#64748b';
  }

  setInteractionMode(mode: 'move' | 'wall'): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    this.interactionMode.set(mode);
    if (mode === 'move') {
      this.hoveredSlot.set(null);
    }
  }

  onCellClick(cell: RenderCell): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    if (cell.isLegalMove) {
      const success = this.state.movePawn({ row: cell.row, col: cell.col });
      if (success) {
        this.hoveredSlot.set(null);
        if (
          this.state.stepsRemainingThisTurn() <= 0 &&
          this.state.wallsRemainingThisTurn() > 0 &&
          this.state.currentPlayer().wallsRemaining > 0
        ) {
          this.interactionMode.set('wall');
        } else {
          this.interactionMode.set('move');
        }
      }
    }
  }

  toggleOrientation(): void {
    this.state.toggleWallOrientation();
    const cur = this.hoveredSlot();
    if (cur) {
      this.onWallSlotHover(cur.row, cur.col, this.state.wallOrientation());
    }
  }

  confirmWallPlacement(): void {
    const cur = this.hoveredSlot();
    if (!cur || !cur.isLegal || this.state.isGameOver() || this.state.isAiThinking()) return;
    const success = this.state.placeWall({
      row: cur.row,
      col: cur.col,
      orientation: cur.orientation,
    });
    if (success) {
      this.hoveredSlot.set(null);
      if (this.state.stepsRemainingThisTurn() > 0) {
        this.interactionMode.set('move');
      }
    }
  }

  cancelWallPlacement(): void {
    this.hoveredSlot.set(null);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.code === 'Space' && !this.state.isGameOver()) {
      event.preventDefault();
      this.interactionMode.set('wall');
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
    if (this.interactionMode() === 'wall' && this.hoveredSlot()?.isLegal) {
      return;
    }
    this.hoveredSlot.set(null);
  }

  onWallSlotClick(row: number, col: number): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    const orientation = this.state.wallOrientation();
    const success = this.state.placeWall({ row, col, orientation });
    if (success) {
      this.hoveredSlot.set(null);
      if (this.state.stepsRemainingThisTurn() > 0) {
        this.interactionMode.set('move');
      }
    }
  }

  /**
   * Two-tap placement for mobile touchscreens:
   * 1st tap previews wall & validity, 2nd tap on the same slot places the wall.
   */
  onWallSlotTap(row: number, col: number): void {
    if (this.state.isGameOver() || this.state.isAiThinking()) return;
    this.interactionMode.set('wall');
    const cur = this.hoveredSlot();
    const orientation = this.state.wallOrientation();

    if (cur && cur.row === row && cur.col === col && cur.orientation === orientation) {
      if (cur.isLegal) {
        this.confirmWallPlacement();
      }
    } else {
      this.onWallSlotHover(row, col, orientation);
    }
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
}
