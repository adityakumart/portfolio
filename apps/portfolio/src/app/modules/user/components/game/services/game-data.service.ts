import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IFetchGameWordsRequest,
  IFetchGameWordsResponse,
} from '@portfolio/shared-types';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameDataService {
  private http = inject(HttpClient);
  private get baseUrl(): string {
    return `${environment.APIURL}/game/words/batch`;
  }

  /**
   * Fetches a batch of random movie words excluding already seen IDs.
   */
  fetchWordsBatch(
    limit: number,
    excludeIds: string[] = [],
  ): Observable<IFetchGameWordsResponse> {
    const payload: IFetchGameWordsRequest = { limit, excludeIds };
    return this.http.post<IFetchGameWordsResponse>(this.baseUrl, payload);
  }
}
