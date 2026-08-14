import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ChatMessageHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiAiService {
  private http = inject(HttpClient);

  /**
   * Dispatches the chat prompt and history context to the portfolio-core backend
   */
  sendMessage(message: string, history: ChatMessageHistoryItem[] = []): Observable<{ reply: string }> {
    const url = `${environment.apiUrl}/chat`;
    return this.http.post<{ reply: string }>(url, { message, history });
  }
}
