import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPublicVehicle } from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class RRPublicApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/rr/public`;

  /**
   * Fetch vehicles available for public customer viewing and reservation inquiries
   */
  async getVehicles(params?: { search?: string; limit?: number }): Promise<IPublicVehicle[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return firstValueFrom(
      this.http.get<IPublicVehicle[]>(`${this.baseUrl}/vehicles`, {
        params: httpParams,
      })
    );
  }
}
