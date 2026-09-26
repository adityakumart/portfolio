import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../services/auth';
import {
  IDailyDashboard,
  IMealItem,
  ICreateMealDto,
  IUpdateMealDto,
  IHydrationEntry,
  ILogHydrationDto,
  IJunkFoodLog,
  ILogJunkFoodDto,
  IUserDietConfig,
  IUpdateDietConfigDto,
  IDietStatsResponse,
  IS3PresignedUrlResponse,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class DietHydrationApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get baseUrl(): string {
    return `${environment.APIURL}/user/diet-hydration`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getDayDashboard(date: string): Observable<IDailyDashboard> {
    return this.http.get<IDailyDashboard>(`${this.baseUrl}/day?date=${date}`, {
      headers: this.getHeaders(),
    });
  }

  createMeal(dto: ICreateMealDto): Observable<IMealItem> {
    return this.http.post<IMealItem>(`${this.baseUrl}/meals`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateMeal(mealId: string, dto: IUpdateMealDto): Observable<IMealItem> {
    return this.http.put<IMealItem>(`${this.baseUrl}/meals/${mealId}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteMeal(mealId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/meals/${mealId}`,
      { headers: this.getHeaders() },
    );
  }

  getMealPhotoUploadUrl(
    fileName: string,
    mimeType: string,
  ): Observable<IS3PresignedUrlResponse> {
    return this.http.post<IS3PresignedUrlResponse>(
      `${this.baseUrl}/meals/upload-url`,
      { fileName, mimeType },
      { headers: this.getHeaders() },
    );
  }

  uploadPhotoToPresignedUrl(
    uploadUrl: string,
    file: Blob,
    mimeType: string,
  ): Observable<any> {
    return this.http.put(uploadUrl, file, {
      headers: new HttpHeaders({
        'Content-Type': mimeType,
      }),
    });
  }

  logHydration(dto: ILogHydrationDto): Observable<IHydrationEntry> {
    return this.http.post<IHydrationEntry>(`${this.baseUrl}/hydration`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteHydration(
    entryId: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/hydration/${entryId}`,
      { headers: this.getHeaders() },
    );
  }

  logJunkFood(dto: ILogJunkFoodDto): Observable<IJunkFoodLog> {
    return this.http.post<IJunkFoodLog>(`${this.baseUrl}/junk-food`, dto, {
      headers: this.getHeaders(),
    });
  }

  getConfig(): Observable<IUserDietConfig> {
    return this.http.get<IUserDietConfig>(`${this.baseUrl}/config`, {
      headers: this.getHeaders(),
    });
  }

  updateConfig(dto: IUpdateDietConfigDto): Observable<IUserDietConfig> {
    return this.http.patch<IUserDietConfig>(`${this.baseUrl}/config`, dto, {
      headers: this.getHeaders(),
    });
  }

  getStats(
    timeframe: 'weekly' | 'monthly',
    params?: {
      startDate?: string;
      endDate?: string;
      year?: number;
      month?: number;
    },
  ): Observable<IDietStatsResponse> {
    const query = new URLSearchParams();
    query.set('timeframe', timeframe);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.year) query.set('year', params.year.toString());
    if (params?.month) query.set('month', params.month.toString());

    return this.http.get<IDietStatsResponse>(
      `${this.baseUrl}/stats?${query.toString()}`,
      { headers: this.getHeaders() },
    );
  }
}
