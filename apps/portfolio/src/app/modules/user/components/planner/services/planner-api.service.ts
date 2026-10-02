import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../services/auth';
import {
  INote,
  ITodoItem,
  ICreateNoteDto,
  IUpdateNoteDto,
  ICreateTodoDto,
  IUpdateTodoDto,
  IPlannerDashboardResponse,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class PlannerApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get baseUrl(): string {
    return `${environment.APIURL}/user/planner`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  getDashboard(): Observable<IPlannerDashboardResponse> {
    return this.http.get<IPlannerDashboardResponse>(`${this.baseUrl}/dashboard`, {
      headers: this.getHeaders(),
    });
  }

  // Notes
  getNotes(search?: string, tag?: string): Observable<INote[]> {
    let url = `${this.baseUrl}/notes`;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (tag) params.push(`tag=${encodeURIComponent(tag)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http.get<INote[]>(url, { headers: this.getHeaders() });
  }

  createNote(dto: ICreateNoteDto): Observable<INote> {
    return this.http.post<INote>(`${this.baseUrl}/notes`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateNote(id: string, dto: IUpdateNoteDto): Observable<INote> {
    return this.http.put<INote>(`${this.baseUrl}/notes/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  deleteNote(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/notes/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Todos
  getTodos(status?: string, priority?: string, dueDate?: string): Observable<ITodoItem[]> {
    let url = `${this.baseUrl}/todos`;
    const params: string[] = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (priority) params.push(`priority=${encodeURIComponent(priority)}`);
    if (dueDate) params.push(`dueDate=${encodeURIComponent(dueDate)}`);
    if (params.length) url += `?${params.join('&')}`;

    return this.http.get<ITodoItem[]>(url, { headers: this.getHeaders() });
  }

  createTodo(dto: ICreateTodoDto): Observable<ITodoItem> {
    return this.http.post<ITodoItem>(`${this.baseUrl}/todos`, dto, {
      headers: this.getHeaders(),
    });
  }

  updateTodo(id: string, dto: IUpdateTodoDto): Observable<ITodoItem> {
    return this.http.put<ITodoItem>(`${this.baseUrl}/todos/${id}`, dto, {
      headers: this.getHeaders(),
    });
  }

  toggleTodo(id: string): Observable<ITodoItem> {
    return this.http.patch<ITodoItem>(`${this.baseUrl}/todos/${id}/toggle`, {}, {
      headers: this.getHeaders(),
    });
  }

  deleteTodo(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/todos/${id}`, {
      headers: this.getHeaders(),
    });
  }

  // Reminders
  getActiveReminders(): Observable<ITodoItem[]> {
    return this.http.get<ITodoItem[]>(`${this.baseUrl}/reminders/active`, {
      headers: this.getHeaders(),
    });
  }

  snoozeReminder(id: string, minutes: number = 10): Observable<ITodoItem> {
    return this.http.post<ITodoItem>(
      `${this.baseUrl}/todos/${id}/snooze`,
      { minutes },
      { headers: this.getHeaders() },
    );
  }
}
