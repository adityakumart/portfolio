import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../services/auth';

export interface ChatMessageHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiAiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  /**
   * Dispatches the chat prompt and history context to the portfolio-core backend
   */
  sendMessage(
    message: string,
    history: ChatMessageHistoryItem[] = [],
  ): Observable<{ reply: string }> {
    const url = `${environment.APIURL}/chat`;
    const token = this.authService.getAccessToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    return this.http.post<{ reply: string }>(
      url,
      { message, history },
      { headers },
    );
  }
}
