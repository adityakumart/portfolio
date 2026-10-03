import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IMovieUploadResponse,
  IMovieListResponse,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class MovieApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/movies';

  /**
   * Uploads an array of movie objects to the backend for deduplication and insertion.
   */
  uploadMovies(movies: unknown[]): Observable<IMovieUploadResponse> {
    return this.http.post<IMovieUploadResponse>(`${this.baseUrl}/upload`, movies);
  }

  /**
   * Fetches paginated movies with optional search and year filter.
   */
  getMovies(options?: {
    page?: number;
    limit?: number;
    search?: string;
    year?: number;
  }): Observable<IMovieListResponse> {
    let params = new HttpParams();

    if (options?.page) {
      params = params.set('page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('limit', options.limit.toString());
    }
    if (options?.search && options.search.trim()) {
      params = params.set('search', options.search.trim());
    }
    if (options?.year) {
      params = params.set('year', options.year.toString());
    }

    return this.http.get<IMovieListResponse>(this.baseUrl, { params });
  }

  /**
   * Deletes a movie record by ID.
   */
  deleteMovie(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}`,
    );
  }
}
