export interface IMovie {
  id?: string;
  _id?: string;
  title: string;
  cast?: string;
  englishTranslation: string;
  teluguTranslation?: string;
  year?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMovieUploadStats {
  totalReceived: number;
  insertedCount: number;
  updatedCount: number;
  skippedDuplicates?: number;
  skippedMissingTranslation: number;
  skippedInvalid: number;
}

export interface IMovieSkippedDetail {
  title: string;
  reason: 'already_exists' | 'missing_translation' | 'duplicate_in_payload' | 'missing_title';
  year?: number;
}

export interface IMovieUploadResponse {
  success: boolean;
  message: string;
  stats: IMovieUploadStats;
  inserted: IMovie[];
  updated?: Array<{ id: string; title: string; year?: number }>;
  skipped?: IMovieSkippedDetail[];
}

export interface IMovieListResponse {
  success: boolean;
  movies: IMovie[];
  total: number;
  page: number;
  limit: number;
  years: number[];
}

export type UntranslatedFilterMode = 'both' | 'either' | 'english' | 'telugu';

export interface IUntranslatedCounts {
  missingBoth: number;
  missingEither: number;
  missingEnglish: number;
  missingTelugu: number;
}

export interface IUntranslatedCountsResponse {
  success: boolean;
  counts: IUntranslatedCounts;
}

export interface IDeleteUntranslatedResponse {
  success: boolean;
  deletedCount: number;
  message: string;
}
