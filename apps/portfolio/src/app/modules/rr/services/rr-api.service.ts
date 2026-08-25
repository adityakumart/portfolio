import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IRRUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'employee';
}

@Injectable({
  providedIn: 'root',
})
export class RRApiService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = `${environment.APIURL}/rr`;

  // Signals
  currentUser = signal<IRRUser | null>(null);

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const userStr = sessionStorage.getItem('rr_user');
      const token = sessionStorage.getItem('rr_token');
      if (userStr && token) {
        try {
          this.currentUser.set(JSON.parse(userStr));
        } catch (e) {
          this.clearSession();
        }
      }
    }
  }

  private saveSession(user: IRRUser, token: string) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('rr_user', JSON.stringify(user));
      sessionStorage.setItem('rr_token', token);
      sessionStorage.setItem('loggedInUser', JSON.stringify({ role: user.role, id: user.id }));
    }
    this.currentUser.set(user);
  }

  private clearSession() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('rr_user');
      sessionStorage.removeItem('rr_token');
      sessionStorage.removeItem('loggedInUser');
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem('rr_token');
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // --- API Methods ---

  // Auth Login
  async login(body: { username?: string; password?: string; empId?: string; dob?: string }): Promise<IRRUser> {
    const res = await firstValueFrom(
      this.http.post<{ access_token: string; user: IRRUser }>(
        `${this.baseUrl}/auth/login`,
        body,
        { headers: this.getHeaders() }
      )
    );
    this.saveSession(res.user, res.access_token);
    return res.user;
  }

  // Auth Logout
  logout() {
    this.clearSession();
    this.router.navigate(['/user/rr/login']);
  }

  // Vehicles
  async getVehicles(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/vehicles`, { headers: this.getHeaders() })
    );
  }

  async createVehicle(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/vehicles`, data, { headers: this.getHeaders() })
    );
  }

  async updateVehicle(id: string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${this.baseUrl}/vehicles/${id}`, data, { headers: this.getHeaders() })
    );
  }

  async deleteVehicle(id: string): Promise<any> {
    return firstValueFrom(
      this.http.delete<any>(`${this.baseUrl}/vehicles/${id}`, { headers: this.getHeaders() })
    );
  }

  // Bookings
  async getBookings(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/bookings`, { headers: this.getHeaders() })
    );
  }

  async createBooking(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/bookings`, data, { headers: this.getHeaders() })
    );
  }

  async updateBooking(id: string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${this.baseUrl}/bookings/${id}`, data, { headers: this.getHeaders() })
    );
  }

  // Employees
  async getEmployees(): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/employees`, { headers: this.getHeaders() })
    );
  }

  async createEmployee(data: any): Promise<any> {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/employees`, data, { headers: this.getHeaders() })
    );
  }

  async updateEmployee(id: string, data: any): Promise<any> {
    return firstValueFrom(
      this.http.put<any>(`${this.baseUrl}/employees/${id}`, data, { headers: this.getHeaders() })
    );
  }

  // Logs
  async getLogs(from?: string, to?: string): Promise<any[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return firstValueFrom(
      this.http.get<any[]>(`${this.baseUrl}/logs`, {
        headers: this.getHeaders(),
        params: params,
      })
    );
  }
}
