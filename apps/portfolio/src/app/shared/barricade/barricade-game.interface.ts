import { CellCoord, Wall } from './barricade-board.interface';
import { MoveRecord } from './barricade-move.interface';

/**
 * 9x9 Quoridor (Barricade) Core Game Models & State
 */

export type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

export type PlayerColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'amber'
  | 'purple'
  | 'cyan'
  | 'pink'
  | 'orange';

export interface ColorOption {
  key: PlayerColor;
  name: string;
  hex: string;
  glowClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const PLAYER_COLOR_PALETTE: ColorOption[] = [
  {
    key: 'red',
    name: 'Crimson Red',
    hex: '#ef4444',
    glowClass: 'shadow-[0_0_14px_rgba(239,68,68,0.7)]',
    bgClass: 'bg-red-500',
    borderClass: 'border-red-500',
    textClass: 'text-red-400',
  },
  {
    key: 'blue',
    name: 'Sapphire Blue',
    hex: '#3b82f6',
    glowClass: 'shadow-[0_0_14px_rgba(59,130,246,0.7)]',
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-400',
  },
  {
    key: 'green',
    name: 'Emerald Green',
    hex: '#10b981',
    glowClass: 'shadow-[0_0_14px_rgba(16,185,129,0.7)]',
    bgClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-400',
  },
  {
    key: 'amber',
    name: 'Amber Gold',
    hex: '#f59e0b',
    glowClass: 'shadow-[0_0_14px_rgba(245,158,11,0.7)]',
    bgClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
    textClass: 'text-amber-400',
  },
  {
    key: 'purple',
    name: 'Royal Purple',
    hex: '#8b5cf6',
    glowClass: 'shadow-[0_0_14px_rgba(139,92,246,0.7)]',
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-400',
  },
  {
    key: 'cyan',
    name: 'Cyan Teal',
    hex: '#06b6d4',
    glowClass: 'shadow-[0_0_14px_rgba(6,182,212,0.7)]',
    bgClass: 'bg-cyan-500',
    borderClass: 'border-cyan-500',
    textClass: 'text-cyan-400',
  },
  {
    key: 'pink',
    name: 'Rose Pink',
    hex: '#ec4899',
    glowClass: 'shadow-[0_0_14px_rgba(236,72,153,0.7)]',
    bgClass: 'bg-pink-500',
    borderClass: 'border-pink-500',
    textClass: 'text-pink-400',
  },
  {
    key: 'orange',
    name: 'Neon Orange',
    hex: '#f97316',
    glowClass: 'shadow-[0_0_14px_rgba(249,115,22,0.7)]',
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500',
    textClass: 'text-orange-400',
  },
];

export type AiDifficulty = 'intro' | 'medium' | 'hard';
export type GameMode = 'two_players' | 'vs_computer' | 'four_players';
export type PlayerCount = 2 | 4;
export type GameStatus = 'lobby' | 'playing' | 'game_over';
export type TurnPhase = 'PLAYER_TURN' | 'AI_THINKING' | 'GAME_OVER';
export type GoalTargetType = 'row' | 'center';

export type ActionEconomyOption =
  | '1+0'
  | '1+3'
  | '3+0'
  | '3+2'
  | '5+3'
  | '10+0'
  | '15+10';

export interface ActionEconomyRules {
  code: ActionEconomyOption;
  stepsPerTurn: number;
  wallsPerTurn: number;
  description: string;
}

export const ACTION_ECONOMY_CONFIGS: Record<ActionEconomyOption, ActionEconomyRules> = {
  '1+0': {
    code: '1+0',
    stepsPerTurn: 1,
    wallsPerTurn: 0,
    description: '1 Step, 0 Walls (Sprint)',
  },
  '1+3': {
    code: '1+3',
    stepsPerTurn: 1,
    wallsPerTurn: 3,
    description: '1 Step + up to 3 Walls',
  },
  '3+0': {
    code: '3+0',
    stepsPerTurn: 3,
    wallsPerTurn: 0,
    description: '3 Steps, 0 Walls (Dash)',
  },
  '3+2': {
    code: '3+2',
    stepsPerTurn: 3,
    wallsPerTurn: 2,
    description: '3 Steps + up to 2 Walls (Blitz)',
  },
  '5+3': {
    code: '5+3',
    stepsPerTurn: 5,
    wallsPerTurn: 3,
    description: '5 Steps + up to 3 Walls (Barrage)',
  },
  '10+0': {
    code: '10+0',
    stepsPerTurn: 10,
    wallsPerTurn: 0,
    description: '10 Steps, 0 Walls (Marathon)',
  },
  '15+10': {
    code: '15+10',
    stepsPerTurn: 15,
    wallsPerTurn: 10,
    description: '15 Steps + up to 10 Walls (Mega)',
  },
};

export type TimeControlMinutes = 0 | 5 | 10 | 15 | 20 | 25 | 30;

export interface TimeControlOption {
  value: TimeControlMinutes;
  label: string;
}

export const TIME_CONTROL_OPTIONS: TimeControlOption[] = [
  { value: 0, label: 'Unlimited' },
  { value: 5, label: '5 mins' },
  { value: 10, label: '10 mins' },
  { value: 15, label: '15 mins' },
  { value: 20, label: '20 mins' },
  { value: 25, label: '25 mins' },
  { value: 30, label: '30 mins' },
];

export interface Pawn {
  id: string;
  playerId: PlayerId;
  name: string;
  color: PlayerColor;
  position: CellCoord;
  startPosition?: CellCoord;
  goalTargetType?: GoalTargetType;
  goalRow?: number; // 9 for Player 1, 1 for Player 2 (in 2-player mode)
  goalCoord?: CellCoord; // { row: 5, col: 5 } (in 4-player mode)
  wallsRemaining: number;
  isComputer: boolean;
  timeRemainingMs?: number;
  isEliminated?: boolean;
}

export interface TurnActionUsage {
  stepsTaken: number;
  wallsPlaced: number;
}

export interface BarricadeConfig {
  gameMode: GameMode;
  playerCount: PlayerCount;
  aiDifficulty: AiDifficulty;
  actionEconomy: ActionEconomyOption;
  timeLimitMinutes: TimeControlMinutes;
  players: Array<{
    name: string;
    color: PlayerColor;
    isComputer: boolean;
  }>;
}

export interface GameState {
  gameMode: GameMode;
  playerCount: PlayerCount;
  aiDifficulty: AiDifficulty;
  actionEconomy: ActionEconomyOption;
  timeLimitMinutes: TimeControlMinutes;
  status: GameStatus;
  phase: TurnPhase;
  currentPlayerIndex: number;
  players: Pawn[];
  walls: Wall[];
  winner: Pawn | null;
  winReason?: 'goal_reached' | 'timeout' | 'resignation' | null;
  lastMove: MoveRecord | null;
  turnCount: number;
  turnActionUsage?: TurnActionUsage;
}
