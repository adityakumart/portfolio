export interface IMovieWordDto {
  id: string;
  title: string;
  cast?: string;
  englishTranslation: string;
  teluguTranslation?: string;
  year?: number;
}

export interface IGamePlayer {
  id: string;
  name: string;
  score: number;
  passedCount: number;
  colorClass: string;
  badgeBgClass: string;
}

export interface IGameSettings {
  turnDurationSeconds: number; // Selected clock time for EACH player (e.g. 60s)
  durationSeconds?: number;    // Deprecated / total match duration
  targetWordCount: number;     // Buffer target: Math.ceil((turnDurationSeconds * players.length) / 5)
  players: IGamePlayer[];
}

export type GameStatus = 'setup' | 'countdown' | 'in_progress' | 'paused' | 'completed';
export type GameTurnState = 'playing' | 'turn_handover';

export interface IGameWordHistoryItem {
  wordId: string;
  title: string;
  englishTranslation: string;
  teluguTranslation?: string;
  cast?: string;
  guessedByPlayerId: string;
  result: 'correct' | 'pass';
  responseTimeMs: number;
}

export interface IGameSessionState {
  status: GameStatus;
  settings: IGameSettings;
  remainingSeconds: number;        // Active player's countdown seconds
  turnState: GameTurnState;        // 'playing' vs 'turn_handover'
  completedPlayerIds: string[];    // IDs of players who finished their turn
  activePlayerIndex: number;
  activeWord: IMovieWordDto | null;
  queue: IMovieWordDto[];
  history: IGameWordHistoryItem[];
  isFetchingWords: boolean;
  totalWordsFetched: number;
  gameStartTimeMs: number | null;
  currentWordStartTimeMs: number | null;
}

export interface IFetchGameWordsRequest {
  limit: number;
  excludeIds?: string[];
}

export interface IFetchGameWordsResponse {
  success: boolean;
  words: IMovieWordDto[];
  count: number;
  hasMore: boolean;
}
