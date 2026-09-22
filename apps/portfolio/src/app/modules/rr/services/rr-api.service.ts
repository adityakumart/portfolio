import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IRRUser,
  IVehicle,
  IVehicleAutocompleteItem,
  IBooking,
  IEmployee,
  ILog,
  ILogsResponse,
  IBookingsResponse,
  IRRDashboardStats,
  IRRVehicleAvailability,
  IRRLoginRequest,
  IRRLoginResponse,
  ICustomerIntimation,
  IVehicleImageUploadResponse,
  IVehicleUploadedAsset,
} from '@portfolio/shared-types';

export {
  IRRUser,
  IVehicle,
  IVehicleAutocompleteItem,
  IBooking,
  IEmployee,
  ILog,
  ILogsResponse,
  IBookingsResponse,
  IRRDashboardStats,
  IRRVehicleAvailability,
  IRRLoginRequest,
  IRRLoginResponse,
  ICustomerIntimation,
  IVehicleImageUploadResponse,
  IVehicleUploadedAsset,
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
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

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
  async logout(): Promise<void> {
    try {
      if (this.getToken()) {
        await firstValueFrom(
          this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() })
        );
      }
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      this.clearSession();
      this.router.navigate(['/user/rr/login']);
    }
  }

  // Vehicles
  async getVehicles(params?: { search?: string; limit?: number }): Promise<IVehicle[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return firstValueFrom(
      this.http.get<IVehicle[]>(`${this.baseUrl}/vehicles`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getBookingVehiclesAutocomplete(params?: { search?: string; limit?: number; status?: string }): Promise<IVehicleAutocompleteItem[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.status) httpParams = httpParams.set('status', params.status);

    return firstValueFrom(
      this.http.get<IVehicleAutocompleteItem[]>(`${this.baseUrl}/bookings/vehicles/autocomplete`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getVehiclesAutocomplete(params?: { search?: string; limit?: number; status?: string }): Promise<IVehicleAutocompleteItem[]> {
    return this.getBookingVehiclesAutocomplete(params);
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
  async getBookings(params?: {
    status?: string;
    vehicle?: string;
    customer?: string;
    from?: string;
    to?: string;
    search?: string;
  }): Promise<IBooking[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.vehicle) httpParams = httpParams.set('vehicle', params.vehicle);
    if (params?.customer) httpParams = httpParams.set('customer', params.customer);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return firstValueFrom(
      this.http.get<IBooking[]>(`${this.baseUrl}/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
    );
  }

  async getBookingsPaginated(params?: {
    status?: string;
    vehicle?: string;
    customer?: string;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<IBookingsResponse> {
    let httpParams = new HttpParams().set('paginate', 'true');
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.vehicle) httpParams = httpParams.set('vehicle', params.vehicle);
    if (params?.customer) httpParams = httpParams.set('customer', params.customer);
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return firstValueFrom(
      this.http.get<IBookingsResponse>(`${this.baseUrl}/bookings`, {
        headers: this.getHeaders(),
        params: httpParams,
      })
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

  async deleteBooking(id: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/bookings/${id}`, { headers: this.getHeaders() })
    );
  }

  async recordCustomerIntimation(
    id: string,
    data: { intimationType: string; notes: string; expectedReturnDateTime?: string }
  ): Promise<{ success: boolean; message: string; intimation: ICustomerIntimation; booking: IBooking }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; message: string; intimation: ICustomerIntimation; booking: IBooking }>(
        `${this.baseUrl}/bookings/${id}/customer-intimation`,
        data,
        { headers: this.getHeaders() }
      )
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

  async deleteEmployee(id: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.delete<{ message: string }>(`${this.baseUrl}/employees/${id}`, { headers: this.getHeaders() })
    );
  }

  // Logs
  async getLogs(params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ILogsResponse> {
    let httpParams = new HttpParams();
    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return firstValueFrom(
      this.http.get<ILogsResponse>(`${this.baseUrl}/logs`, {
        headers: this.getHeaders(),
        params: httpParams,
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
    formData.append('images', file);

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await firstValueFrom(
      this.http.post<IVehicleImageUploadResponse>(
        `${this.baseUrl}/vehicles/upload`,
        formData,
        { headers }
      )
    );

    const first = res.images && res.images.length > 0 ? res.images[0] : null;
    return {
      key: first?.key || res.key || '',
      url: first?.url || res.url || '',
    };
  }

  async uploadVehicleImages(files: File[]): Promise<IVehicleImageUploadResponse> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return firstValueFrom(
      this.http.post<IVehicleImageUploadResponse>(
        `${this.baseUrl}/vehicles/upload`,
        formData,
        { headers }
      )
    );
  }
}
