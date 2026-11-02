import {
  getKycClientId,
  getKycClientSecret,
  getKycBaseUrl,
  isKycSandbox,
} from '../config/security';
import { maskAadhaar } from '../utils/security/kyc-crypto.util';
import {
  IAadhaarOtpResponse,
  IAadhaarVerifiedData,
  IDrivingLicenseVerifiedData,
  IKycServiceStatus,
} from '@portfolio/shared-types';

/**
 * Enterprise KYC & Identity Verification Service.
 * Provides Aadhaar Paperless e-KYC and Driving License validation
 * with full provider abstraction and local sandbox simulation.
 */
export class KycVerificationService {
  private static getHeaders(): Record<string, string> {
    const clientId = getKycClientId();
    const clientSecret = getKycClientSecret();
    return {
      'Content-Type': 'application/json',
      'x-client-id': clientId,
      'x-client-secret': clientSecret,
    };
  }

  /**
   * Returns current KYC provider service readiness and operating mode.
   */
  public static getServiceStatus(): IKycServiceStatus {
    const isSandbox = isKycSandbox();
    return {
      isConfigured: !!getKycClientId() && !!getKycClientSecret(),
      mode: isSandbox ? 'sandbox' : 'live',
      baseUrl: getKycBaseUrl(),
    };
  }

  /**
   * Generates an OTP for Aadhaar verification via Paperless e-KYC gateway.
   */
  public static async generateAadhaarOtp(
    rawAadhaar: string,
  ): Promise<IAadhaarOtpResponse> {
    const cleanAadhaar = (rawAadhaar || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      throw new Error('Aadhaar number must be exactly 12 numeric digits.');
    }

    if (isKycSandbox()) {
      return {
        clientId: `sandbox_adh_${Date.now()}_${cleanAadhaar.slice(-4)}`,
        otpSent: true,
        message: 'Sandbox: OTP sent successfully to linked mobile number.',
        validAadhaar: true,
      };
    }

    const baseUrl = getKycBaseUrl();
    const url = baseUrl.endsWith('/verification')
      ? `${baseUrl}/offline-aadhaar/otp`
      : `${baseUrl}/verification/offline-aadhaar/otp`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ aadhaar_number: cleanAadhaar }),
    });

    const result = await response.json().catch(() => null);

    if (
      !response.ok ||
      !result ||
      (result.status && result.status !== 'SUCCESS') ||
      result.success === false
    ) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Aadhaar OTP generation failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const refId = String(
      result.ref_id ||
        result.data?.ref_id ||
        result.client_id ||
        result.data?.client_id ||
        '',
    );

    return {
      clientId: refId,
      otpSent: true,
      message: result.message || 'OTP sent successfully to registered mobile.',
      validAadhaar: true,
    };
  }

  /**
   * Submits Aadhaar OTP and retrieves verified demographic information.
   */
  public static async submitAadhaarOtp(
    clientId: string,
    rawOtp: string,
  ): Promise<IAadhaarVerifiedData> {
    const cleanOtp = (rawOtp || '').trim();
    if (!cleanOtp || cleanOtp.length < 4 || cleanOtp.length > 8) {
      throw new Error('OTP must be between 4 and 8 digits.');
    }

    if (!clientId) {
      throw new Error('Missing verification reference identifier for OTP submission.');
    }

    if (isKycSandbox() || clientId.startsWith('sandbox_adh_')) {
      const lastDigits = clientId.split('_').pop() || '8899';
      return {
        clientId,
        fullName: 'Alex Morgan',
        dob: '1995-08-15',
        gender: 'M',
        maskedAadhaar: `XXXX-XXXX-${lastDigits}`,
        address: {
          careOf: 'S/O Robert Morgan',
          line: 'Flat 101, Skyline Towers',
          street: 'Tech Park Road',
          locality: 'Central District',
          district: 'Metro City',
          state: 'State',
          pin: '500001',
          country: 'India',
        },
        profileImage: '',
        zip: '500001',
        verifiedAt: new Date().toISOString(),
      };
    }

    const baseUrl = getKycBaseUrl();
    const url = baseUrl.endsWith('/verification')
      ? `${baseUrl}/offline-aadhaar/verify`
      : `${baseUrl}/verification/offline-aadhaar/verify`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        otp: cleanOtp,
        ref_id: clientId,
      }),
    });

    const result = await response.json().catch(() => null);

    if (
      !response.ok ||
      !result ||
      (result.status && result.status !== 'SUCCESS') ||
      result.success === false
    ) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Aadhaar OTP verification failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const d = result.data || result;
    const addr = d.address_details || d.split_address || d.address || {};

    const rawAadhaarNum = d.aadhaar_number || d.id_number || '';
    const masked =
      maskAadhaar(rawAadhaarNum) ||
      `XXXX-XXXX-${cleanOtp.slice(-4)}`;

    return {
      clientId: String(d.ref_id || clientId),
      fullName: d.name || d.full_name || 'Verified Citizen',
      dob: d.dob || '',
      gender: (d.gender || 'O').toUpperCase().charAt(0) as 'M' | 'F' | 'O',
      maskedAadhaar: masked,
      address: {
        careOf: d.care_of || addr.care_of || addr.co || '',
        line: addr.house || addr.line || '',
        street: addr.street || '',
        locality: addr.locality || addr.vtc || addr.subdist || '',
        district: addr.dist || addr.district || '',
        state: addr.state || '',
        pin: String(addr.pincode || addr.pin || addr.zip || '500034'),
        country: addr.country || 'India',
      },
      profileImage: d.photo_link || d.profile_image || '',
      zip: String(addr.pincode || addr.pin || addr.zip || '500034'),
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Verifies Driving License details via National Registry gateway.
   */
  public static async verifyDrivingLicense(
    rawDl: string,
    rawDob?: string,
  ): Promise<IDrivingLicenseVerifiedData> {
    const cleanDl = (rawDl || '').replace(/[\s-]/g, '').toUpperCase();
    if (cleanDl.length < 10 || cleanDl.length > 20) {
      throw new Error(
        'Driving License number must be between 10 and 20 alphanumeric characters.',
      );
    }

    const formattedDob = rawDob ? rawDob.trim() : undefined;

    if (isKycSandbox()) {
      return {
        clientId: `sandbox_dl_${Date.now()}`,
        licenseNumber: cleanDl,
        holderName: 'Alex Morgan',
        fatherOrHusbandName: 'Robert Morgan',
        dob: formattedDob || '1995-08-15',
        bloodGroup: 'O+',
        status: 'ACTIVE',
        issueDate: '2016-04-12',
        validTill: '2036-04-11',
        nonTransportValidity: {
          from: '2016-04-12',
          to: '2036-04-11',
        },
        transportValidity: {
          from: '2020-01-01',
          to: '2028-01-01',
        },
        covDetails: [
          { cov: 'MCWG (Motor Cycle With Gear)', issueDate: '2016-04-12' },
          { cov: 'LMV (Light Motor Vehicle - Car)', issueDate: '2016-04-12' },
        ],
        address: 'Flat 101, Skyline Towers, Tech Park Road, Metro City - 500001',
        state: 'State',
        verifiedAt: new Date().toISOString(),
      };
    }

    const baseUrl = getKycBaseUrl();
    const url = baseUrl.endsWith('/verification')
      ? `${baseUrl}/driving-license`
      : `${baseUrl}/verification/driving-license`;

    const payload: Record<string, string> = { dl_number: cleanDl };
    if (formattedDob) {
      payload['dob'] = formattedDob;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (
      !response.ok ||
      !result ||
      (result.status && result.status !== 'VALID' && result.status !== 'SUCCESS') ||
      result.success === false
    ) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Driving License verification failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const d = result.details_of_driving_licence || result.data || result;
    const covList = Array.isArray(result.class_of_vehicle)
      ? result.class_of_vehicle.map((cov: string) => ({ cov }))
      : Array.isArray(d.cov_details)
        ? d.cov_details.map((covItem: Record<string, string>) => ({
            cov: covItem['cov'] || covItem['category'] || 'VEHICLE',
            issueDate: covItem['issue_date'],
          }))
        : [{ cov: 'LMV / MCWG' }];

    const rawStatus = (d.status || result.status || 'ACTIVE').toUpperCase();
    const status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INVALID' =
      rawStatus === 'VALID' || rawStatus === 'ACTIVE'
        ? 'ACTIVE'
        : rawStatus === 'EXPIRED'
          ? 'EXPIRED'
          : rawStatus === 'SUSPENDED'
            ? 'SUSPENDED'
            : 'INVALID';

    const addressStr =
      Array.isArray(result.address_list) && result.address_list[0]
        ? result.address_list[0].complete_address || JSON.stringify(result.address_list[0])
        : typeof d.address === 'string'
          ? d.address
          : '';

    return {
      clientId: String(result.ref_id || result.client_id || `dl_${Date.now()}`),
      licenseNumber: d.license_number || cleanDl,
      holderName: d.name || d.holder_name || 'Verified License Holder',
      fatherOrHusbandName: d.father_or_husband_name || d.relation_name || '',
      dob: d.dob || formattedDob || '',
      bloodGroup: d.blood_group || '',
      status,
      issueDate: d.issue_date || d.date_of_issue || '',
      validTill: d.valid_till || '',
      nonTransportValidity: d.non_transport_validity,
      transportValidity: d.transport_validity,
      covDetails: covList,
      address: addressStr,
      state: result.state || d.state || '',
      verifiedAt: new Date().toISOString(),
    };
  }
}
