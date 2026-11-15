import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { RRCustomerApiService } from './rr-customer-api.service';
import { RRApiService } from './rr-api.service';
import { environment } from '../../../../environments/environment';
import { IRegularCustomerMasked } from '@portfolio/shared-types';

describe('RRCustomerApiService', () => {
  let service: RRCustomerApiService;
  let httpMock: HttpTestingController;
  let rrApiMock: {
    getToken: ReturnType<typeof vi.fn>;
  };

  const mockCustomer: IRegularCustomerMasked = {
    _id: 'cust-123',
    membershipId: 'RR-MEM-001',
    firstName: 'Suresh',
    lastName: 'Varma',
    fatherName: 'Venkat Varma',
    phone: '9876543210',
    altPhone: '',
    email: 'suresh@example.com',
    aadhar: 'XXXX-XXXX-1234',
    dl: 'XXXX-XXXX-5678',
    address: '123 Royal Street, Hyderabad',
    membershipTier: 'gold',
    discountRate: 20,
    maxDiscountAmount: 1000,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-01-01T00:00:00.000Z',
    durationMonths: 12,
    totalBookings: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    rrApiMock = {
      getToken: vi.fn().mockReturnValue('mock-jwt-token-abc'),
    };

    TestBed.configureTestingModule({
      providers: [
        RRCustomerApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RRApiService, useValue: rrApiMock },
      ],
    });

    service = TestBed.inject(RRCustomerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should attach Bearer token from RRApiService.getToken() when fetching customers', async () => {
    const promise = service.getCustomers({ limit: 100 });

    const req = httpMock.expectOne((r) => r.url === `${environment.APIURL}/rr/customers`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-abc');
    expect(req.request.params.get('limit')).toBe('100');

    req.flush({
      customers: [mockCustomer],
      total: 1,
      page: 1,
      limit: 100,
      totalPages: 1,
    });

    const result = await promise;
    expect(result.customers.length).toBe(1);
    expect(service.customers().length).toBe(1);
    expect(service.customers()[0].membershipId).toBe('RR-MEM-001');
    expect(service.totalCustomers()).toBe(1);
    expect(service.isLoading()).toBe(false);
  });

  it('should fallback to storage token when RRApiService.getToken() returns null', async () => {
    rrApiMock.getToken.mockReturnValue(null);
    sessionStorage.setItem('rr_token', 'fallback-session-token');

    try {
      const promise = service.getCustomers();
      const req = httpMock.expectOne((r) => r.url === `${environment.APIURL}/rr/customers`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer fallback-session-token');

      req.flush([]);
      await promise;
    } finally {
      sessionStorage.removeItem('rr_token');
    }
  });

  it('should attach Bearer token when querying autocomplete', async () => {
    const promise = service.getAutocomplete('Sur');

    const req = httpMock.expectOne((r) => r.url === `${environment.APIURL}/rr/customers/autocomplete`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-abc');
    expect(req.request.params.get('q')).toBe('Sur');

    req.flush([
      {
        _id: 'cust-123',
        membershipId: 'RR-MEM-001',
        name: 'Suresh Varma',
        endDate: '2027-01-01',
      },
    ]);

    const result = await promise;
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Suresh Varma');
  });

  it('should attach Bearer token when checking discount calculation', async () => {
    const promise = service.checkMembershipDiscount('9876543210', 5000);

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.APIURL}/rr/customers/billing/discount`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-jwt-token-abc');
    expect(req.request.params.get('identifier')).toBe('9876543210');
    expect(req.request.params.get('rentalAmount')).toBe('5000');

    req.flush({
      isRegularCustomer: true,
      membershipTier: 'gold',
      discountRate: 20,
      discountAmount: 1000,
      finalAmount: 4000,
    });

    const result = await promise;
    expect(result.isRegularCustomer).toBe(true);
    expect(result.discountRate).toBe(20);
  });
});

