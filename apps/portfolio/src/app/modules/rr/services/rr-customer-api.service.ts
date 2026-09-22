import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IRegularCustomerMasked,
  ICreateCustomerDTO,
  IUpdateCustomerDTO,
  ICustomerMembershipDiscount,
  ICustomerListResponse,
  ICustomerAutocompleteItem,
} from '@portfolio/shared-types';

/**
 * Angular Service managing API interactions for the RoadReady Rentals
 * Customer Membership & KYC module.
 */
@Injectable({
  providedIn: 'root',
})
export class RRCustomerApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.APIURL}/rr/customers`;

  // Reactive state signals
  customers = signal<IRegularCustomerMasked[]>([]);
  totalCustomers = signal<number>(0);
  isLoading = signal<boolean>(false);
  selectedCustomer = signal<IRegularCustomerMasked | null>(null);

  /**
   * Constructs authorization headers from active RR session.
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const token = sessionStorage.getItem('rr_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  /**
   * Fetches paginated customer records with optional search filter.
   */
  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ICustomerListResponse> {
    this.isLoading.set(true);
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search.trim());

    try {
      const response = await firstValueFrom(
        this.http.get<ICustomerListResponse>(this.baseUrl, {
          headers: this.getHeaders(),
          params: httpParams,
        })
      );
      this.customers.set(response.customers);
      this.totalCustomers.set(response.total);
      return response;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Retrieves single customer profile by membershipId or MongoDB ID.
   */
  async getCustomerById(id: string): Promise<IRegularCustomerMasked> {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<IRegularCustomerMasked>(`${this.baseUrl}/${encodeURIComponent(id)}`, {
          headers: this.getHeaders(),
        })
      );
      this.selectedCustomer.set(res);
      return res;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Fast autocomplete lookup returning only ID and Name.
   */
  async getAutocomplete(query?: string): Promise<ICustomerAutocompleteItem[]> {
    let httpParams = new HttpParams();
    if (query?.trim()) {
      httpParams = httpParams.set('q', query.trim());
    }

    try {
      const res = await firstValueFrom(
        this.http.get<ICustomerAutocompleteItem[]>(`${this.baseUrl}/autocomplete`, {
          headers: this.getHeaders(),
          params: httpParams,
        })
      );
      return res || [];
    } catch {
      return [];
    }
  }

  /**
   * Registers a new regular customer with KYC details.
   */
  async createCustomer(data: ICreateCustomerDTO): Promise<IRegularCustomerMasked> {
    this.isLoading.set(true);
    try {
      const newCustomer = await firstValueFrom(
        this.http.post<IRegularCustomerMasked>(this.baseUrl, data, {
          headers: this.getHeaders(),
        })
      );
      this.customers.update((prev) => [newCustomer, ...prev]);
      this.totalCustomers.update((count) => count + 1);
      return newCustomer;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Updates an existing customer membership record.
   */
  async updateCustomer(id: string, data: IUpdateCustomerDTO): Promise<IRegularCustomerMasked> {
    this.isLoading.set(true);
    try {
      const updated = await firstValueFrom(
        this.http.put<IRegularCustomerMasked>(`${this.baseUrl}/${encodeURIComponent(id)}`, data, {
          headers: this.getHeaders(),
        })
      );
      this.customers.update((prev) =>
        prev.map((c) => (c._id === updated._id || c.membershipId === updated.membershipId ? updated : c))
      );
      if (this.selectedCustomer()?._id === updated._id) {
        this.selectedCustomer.set(updated);
      }
      return updated;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Soft-deletes a customer membership profile.
   */
  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.delete<{ success: boolean; message: string }>(
          `${this.baseUrl}/${encodeURIComponent(id)}`,
          { headers: this.getHeaders() }
        )
      );
      this.customers.update((prev) => prev.filter((c) => c._id !== id && c.membershipId !== id));
      this.totalCustomers.update((count) => Math.max(0, count - 1));
      return result;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Queries the backend BillingService to check if customer is a regular member
   * and automatically calculate membership discount for a checkout/booking amount.
   */
  async checkMembershipDiscount(
    identifier: string,
    rentalAmount: number
  ): Promise<ICustomerMembershipDiscount> {
    const params = new HttpParams()
      .set('identifier', identifier.trim())
      .set('rentalAmount', rentalAmount.toString());

    return await firstValueFrom(
      this.http.get<ICustomerMembershipDiscount>(`${this.baseUrl}/billing/discount`, {
        headers: this.getHeaders(),
        params,
      })
    );
  }
}
