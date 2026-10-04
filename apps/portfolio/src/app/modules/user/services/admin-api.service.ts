import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminUsersQuery,
  AdminUsersResponse,
  AdminUserListItem,
  UpdateUserPermissionsPayload,
  AdminDashboardStats,
  CreateMoviePayload,
  UpdateMoviePayload,
  IMovie,
  IMovieListResponse,
} from '@portfolio/shared-types';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get adminUrl(): string {
    return `${environment.APIURL}/admin`;
  }

  private get movieUrl(): string {
    return `${environment.APIURL}/movies`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- User Permissions Management ---

  getUsers(query?: AdminUsersQuery): Observable<AdminUsersResponse> {
    let params = new HttpParams();
    if (query?.page) params = params.set('page', query.page.toString());
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.search && query.search.trim())
      params = params.set('search', query.search.trim());
    if (query?.role && query.role !== 'all')
      params = params.set('role', query.role);
    if (query?.status && query.status !== 'all')
      params = params.set('status', query.status);

    return this.http.get<AdminUsersResponse>(`${this.adminUrl}/users`, {
      params,
      headers: this.getAuthHeaders(),
    });
  }

  updateUserPermissions(
    userId: string,
    payload: UpdateUserPermissionsPayload,
  ): Observable<{ success: boolean; user: AdminUserListItem; message: string }> {
    return this.http.patch<{
      success: boolean;
      user: AdminUserListItem;
      message: string;
    }>(
      `${this.adminUrl}/users/${userId}/permissions`,
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  deleteUser(
    userId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.adminUrl}/users/${userId}`,
      { headers: this.getAuthHeaders() },
    );
  }

  getDashboardStats(): Observable<{ success: boolean; stats: AdminDashboardStats }> {
    return this.http.get<{ success: boolean; stats: AdminDashboardStats }>(
      `${this.adminUrl}/stats`,
      { headers: this.getAuthHeaders() },
    );
  }

  // --- Movie Management ---

  getMovies(options?: {
    page?: number;
    limit?: number;
    search?: string;
    year?: number;
  }): Observable<IMovieListResponse> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.limit) params = params.set('limit', options.limit.toString());
    if (options?.search && options.search.trim())
      params = params.set('search', options.search.trim());
    if (options?.year) params = params.set('year', options.year.toString());

    return this.http.get<IMovieListResponse>(this.movieUrl, { params });
  }

  createMovie(
    payload: CreateMoviePayload,
  ): Observable<{ success: boolean; movie: IMovie; message: string }> {
    return this.http.post<{ success: boolean; movie: IMovie; message: string }>(
      this.movieUrl,
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  updateMovie(
    id: string,
    payload: UpdateMoviePayload,
  ): Observable<{ success: boolean; movie: IMovie; message: string }> {
    return this.http.put<{ success: boolean; movie: IMovie; message: string }>(
      `${this.movieUrl}/${id}`,
      payload,
      { headers: this.getAuthHeaders() },
    );
  }

  deleteMovie(
    id: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.movieUrl}/${id}`,
      { headers: this.getAuthHeaders() },
    );
  }
}
