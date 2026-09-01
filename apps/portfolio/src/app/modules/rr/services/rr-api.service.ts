import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IRRUser,
  IVehicle,
  IBooking,
  IEmployee,
  ILog,
  IRRDashboardStats,
  IRRVehicleAvailability,
  IRRLoginRequest,
  IRRLoginResponse,
} from '@portfolio/shared-types';

export {
  IRRUser,
  IVehicle,
  IBooking,
  IEmployee,
  ILog,
  IRRDashboardStats,
  IRRVehicleAvailability,
};

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
        } catch {
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
  async login(body: IRRLoginRequest): Promise<IRRUser> {
    const res = await firstValueFrom(
      this.http.post<IRRLoginResponse>(
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
  async getVehicles(): Promise<IVehicle[]> {
    return firstValueFrom(
      this.http.get<IVehicle[]>(`${this.baseUrl}/vehicles`, { headers: this.getHeaders() })
    );
  }

  async createVehicle(data: Partial<IVehicle>): Promise<IVehicle> {
    return firstValueFrom(
      this.http.post<IVehicle>(`${this.baseUrl}/vehicles`, data, { headers: this.getHeaders() })
    );
  }

  async updateVehicle(id: string, data: Partial<IVehicle>): Promise<IVehicle> {
    return firstValueFrom(
      this.http.put<IVehicle>(`${this.baseUrl}/vehicles/${id}`, data, { headers: this.getHeaders() })
    );
  }

  async deleteVehicle(id: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/vehicles/${id}`, { headers: this.getHeaders() })
    );
  }

  // Bookings
  async getBookings(): Promise<IBooking[]> {
    return firstValueFrom(
      this.http.get<IBooking[]>(`${this.baseUrl}/bookings`, { headers: this.getHeaders() })
    );
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    return firstValueFrom(
      this.http.post<IBooking>(`${this.baseUrl}/bookings`, data, { headers: this.getHeaders() })
    );
  }

  async updateBooking(id: string, data: Partial<IBooking>): Promise<IBooking> {
    return firstValueFrom(
      this.http.put<IBooking>(`${this.baseUrl}/bookings/${id}`, data, { headers: this.getHeaders() })
    );
  }

  // Employees
  async getEmployees(): Promise<IEmployee[]> {
    return firstValueFrom(
      this.http.get<IEmployee[]>(`${this.baseUrl}/employees`, { headers: this.getHeaders() })
    );
  }

  async createEmployee(data: Partial<IEmployee>): Promise<IEmployee> {
    return firstValueFrom(
      this.http.post<IEmployee>(`${this.baseUrl}/employees`, data, { headers: this.getHeaders() })
    );
  }

  async updateEmployee(id: string, data: Partial<IEmployee>): Promise<IEmployee> {
    return firstValueFrom(
      this.http.put<IEmployee>(`${this.baseUrl}/employees/${id}`, data, { headers: this.getHeaders() })
    );
  }

  // Logs
  async getLogs(from?: string, to?: string): Promise<ILog[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return firstValueFrom(
      this.http.get<ILog[]>(`${this.baseUrl}/logs`, {
        headers: this.getHeaders(),
        params: params,
      })
    );
  }

  async getDashboardStats(): Promise<IRRDashboardStats> {
    return firstValueFrom(
      this.http.get<IRRDashboardStats>(`${this.baseUrl}/dashboard/stats`, { headers: this.getHeaders() })
    );
  }

  async checkVehicleAvailability(regNo: string): Promise<IRRVehicleAvailability> {
    return firstValueFrom(
      this.http.get<IRRVehicleAvailability>(`${this.baseUrl}/vehicles/${regNo}/availability`, { headers: this.getHeaders() })
    );
  }

  async uploadVehicleImage(file: File): Promise<{ key: string; url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return firstValueFrom(
      this.http.post<{ key: string; url: string }>(
        `${this.baseUrl}/vehicles/upload`,
        formData,
        { headers }
      )
    );
  }
}
