import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../modules/user/services/auth';
import {
  IAadhaarOtpRequest,
  IAadhaarOtpResponse,
  IAadhaarSubmitOtpRequest,
  IAadhaarVerifiedData,
  IDrivingLicenseVerifyRequest,
  IDrivingLicenseVerifiedData,
  IKycServiceStatus,
} from '@portfolio/shared-types';

@Injectable({
  providedIn: 'root',
})
export class KycApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private get kycUrl(): string {
    return `${environment.APIURL}/kyc`;
  }

  private getAuthHeaders(): HttpHeaders {
    let token = this.authService.getAccessToken();

    // Fallback to RR token if user is signed in under RR module
    if (!token && typeof window !== 'undefined') {
      try {
        const rrSession = localStorage.getItem('rr_session') || sessionStorage.getItem('rr_session');
        if (rrSession) {
          const parsed = JSON.parse(rrSession);
          if (parsed && parsed.access_token) {
            token = parsed.access_token;
          }
        }
      } catch {
        // Ignore fallback extraction failure
      }
    }

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /**
   * Fetches KYC service status (live vs sandbox)
   */
  getServiceStatus(): Observable<IKycServiceStatus> {
    return this.http.get<IKycServiceStatus>(`${this.kycUrl}/config`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Generates OTP for 12-digit Aadhaar number
   */
  generateAadhaarOtp(
    payload: IAadhaarOtpRequest,
  ): Promise<IAadhaarOtpResponse> {
    return firstValueFrom(
      this.http.post<IAadhaarOtpResponse>(
        `${this.kycUrl}/aadhaar/generate-otp`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );
  }

  /**
   * Submits OTP and retrieves verified Aadhaar details
   */
  submitAadhaarOtp(
    payload: IAadhaarSubmitOtpRequest,
  ): Promise<IAadhaarVerifiedData> {
    return firstValueFrom(
      this.http.post<IAadhaarVerifiedData>(
        `${this.kycUrl}/aadhaar/submit-otp`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );
  }

  /**
   * Verifies Driving License number and optional DOB
   */
  verifyDrivingLicense(
    payload: IDrivingLicenseVerifyRequest,
  ): Promise<IDrivingLicenseVerifiedData> {
    return firstValueFrom(
      this.http.post<IDrivingLicenseVerifiedData>(
        `${this.kycUrl}/driving-license/verify`,
        payload,
        { headers: this.getAuthHeaders() },
      ),
    );
  }
}
