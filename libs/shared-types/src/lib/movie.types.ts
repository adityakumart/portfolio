export interface IMovie {
  id?: string;
  _id?: string;
  title: string;
  cast?: string;
  englishTranslation: string;
  year?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IMovieUploadStats {
  totalReceived: number;
  insertedCount: number;
  skippedDuplicates: number;
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
