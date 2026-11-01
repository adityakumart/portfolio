import {
  getSurepassToken,
  getSurepassBaseUrl,
  isSurepassSandbox,
} from '../config/security';
import { maskAadhaar } from '../utils/security/kyc-crypto.util';
import {
  IAadhaarOtpResponse,
  IAadhaarVerifiedData,
  IDrivingLicenseVerifiedData,
  IKycServiceStatus,
} from '@portfolio/shared-types';

export class SurepassService {
  private static getHeaders(): Record<string, string> {
    const token = getSurepassToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  public static getServiceStatus(): IKycServiceStatus {
    const isSandbox = isSurepassSandbox();
    return {
      isConfigured: !!getSurepassToken(),
      mode: isSandbox ? 'sandbox' : 'live',
      baseUrl: getSurepassBaseUrl(),
    };
  }

  /**
   * Generates an OTP for Aadhaar verification via Surepass Aadhaar v2 API.
   */
  public static async generateAadhaarOtp(
    rawAadhaar: string,
  ): Promise<IAadhaarOtpResponse> {
    const cleanAadhaar = (rawAadhaar || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      throw new Error('Aadhaar number must be exactly 12 numeric digits.');
    }

    if (isSurepassSandbox()) {
      return {
        clientId: `sandbox_adh_${Date.now()}_${cleanAadhaar.slice(-4)}`,
        otpSent: true,
        message: 'Sandbox: OTP sent successfully to linked mobile number.',
        validAadhaar: true,
      };
    }

    const baseUrl = getSurepassBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/aadhaar-v2/generate-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ id_number: cleanAadhaar }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.success === false) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Surepass Aadhaar OTP generation failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const data = result.data || {};
    return {
      clientId: data.client_id || '',
      otpSent: !!data.otp_sent,
      message: result.message || 'OTP sent successfully to registered mobile.',
      validAadhaar: !!data.if_number,
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
      throw new Error('Missing client_id for OTP verification.');
    }

    if (isSurepassSandbox() || clientId.startsWith('sandbox_adh_')) {
      const lastDigits = clientId.split('_').pop() || '8899';
      return {
        clientId,
        fullName: 'Aditya Kumar Talapula',
        dob: '1995-08-15',
        gender: 'M',
        maskedAadhaar: `XXXX-XXXX-${lastDigits}`,
        address: {
          careOf: 'S/O Satyanarayana T',
          line: 'Flat 402, Royal Residency',
          street: 'Road No. 12, Banjara Hills',
          locality: 'Banjara Hills',
          district: 'Hyderabad',
          state: 'Telangana',
          pin: '500034',
          country: 'India',
        },
        profileImage: '',
        zip: '500034',
        verifiedAt: new Date().toISOString(),
      };
    }

    const baseUrl = getSurepassBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/aadhaar-v2/submit-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        client_id: clientId,
        otp: cleanOtp,
      }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.success === false) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Surepass Aadhaar OTP verification failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const d = result.data || {};
    const addr = d.split_address || d.address || {};

    const rawAadhaarNum = d.aadhaar_number || d.id_number || '';
    const masked = maskAadhaar(rawAadhaarNum) || 'XXXX-XXXX-XXXX';

    return {
      clientId: d.client_id || clientId,
      fullName: d.full_name || d.name || 'Verified Citizen',
      dob: d.dob || '',
      gender: d.gender || 'O',
      maskedAadhaar: masked,
      address: {
        careOf: addr.care_of || addr.co || '',
        line: addr.line || addr.house || '',
        street: addr.street || '',
        locality: addr.locality || addr.subdist || '',
        district: addr.dist || addr.district || '',
        state: addr.state || '',
        pin: addr.pincode || addr.zip || '',
        country: addr.country || 'India',
      },
      profileImage: d.profile_image || d.face_image || '',
      zip: d.zip || addr.pincode || '',
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Verifies Driving License details via Surepass Driving License API.
   */
  public static async verifyDrivingLicense(
    rawDl: string,
    rawDob?: string,
  ): Promise<IDrivingLicenseVerifiedData> {
    const cleanDl = (rawDl || '').replace(/[\s-]/g, '').toUpperCase();
    if (cleanDl.length < 10 || cleanDl.length > 20) {
      throw new Error('Driving License number must be between 10 and 20 alphanumeric characters.');
    }

    const formattedDob = rawDob ? rawDob.trim() : undefined;

    if (isSurepassSandbox()) {
      return {
        clientId: `sandbox_dl_${Date.now()}`,
        licenseNumber: cleanDl,
        holderName: 'Aditya Kumar Talapula',
        fatherOrHusbandName: 'Satyanarayana Talapula',
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
        address: 'H No. 8-2-293/82, Banjara Hills, Hyderabad, Telangana - 500034',
        state: 'Telangana',
        verifiedAt: new Date().toISOString(),
      };
    }

    const baseUrl = getSurepassBaseUrl();
    const payload: Record<string, string> = { id_number: cleanDl };
    if (formattedDob) {
      payload['dob'] = formattedDob;
    }

    const response = await fetch(`${baseUrl}/api/v1/driving-license/driving-license`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result || result.success === false) {
      const errMsg =
        result?.message ||
        result?.error ||
        `Surepass Driving License verification failed with HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const d = result.data || {};
    const validity = d.validity || {};
    const covList = Array.isArray(d.cov_details)
      ? d.cov_details.map((covItem: Record<string, string>) => ({
          cov: covItem['cov'] || covItem['category'] || 'VEHICLE',
          issueDate: covItem['issue_date'],
        }))
      : [];

    return {
      clientId: d.client_id || `dl_${Date.now()}`,
      licenseNumber: d.license_number || cleanDl,
      holderName: d.name || d.holder_name || 'Verified License Holder',
      fatherOrHusbandName: d.father_or_husband_name || d.relation_name || '',
      dob: d.dob || formattedDob || '',
      bloodGroup: d.blood_group || '',
      status: (d.status || 'ACTIVE').toUpperCase() as 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INVALID',
      issueDate: d.issue_date || '',
      validTill: validity.non_transport?.to || validity.transport?.to || d.valid_till || '',
      nonTransportValidity: validity.non_transport
        ? { from: validity.non_transport.from, to: validity.non_transport.to }
        : undefined,
      transportValidity: validity.transport
        ? { from: validity.transport.from, to: validity.transport.to }
        : undefined,
      covDetails: covList.length > 0 ? covList : [{ cov: 'LMV / MCWG' }],
      address: Array.isArray(d.address_list) && d.address_list[0]
        ? d.address_list[0].complete_address || JSON.stringify(d.address_list[0])
        : d.address || '',
      state: d.state || '',
      verifiedAt: new Date().toISOString(),
    };
  }
}

