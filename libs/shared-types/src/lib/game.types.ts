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
  durationSeconds: number;
  targetWordCount: number;
  players: IGamePlayer[];
}

export type GameStatus = 'setup' | 'countdown' | 'in_progress' | 'paused' | 'completed';

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
  remainingSeconds: number;
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
