export interface IAadhaarOtpRequest {
  aadhaarNumber: string;
}

export interface IAadhaarOtpResponse {
  clientId: string;
  otpSent: boolean;
  message: string;
  validAadhaar: boolean;
}

export interface IAadhaarSubmitOtpRequest {
  clientId: string;
  otp: string;
}

export interface IAadhaarAddress {
  careOf?: string;
  line?: string;
  street?: string;
  locality?: string;
  district?: string;
  state?: string;
  pin: string;
  country: string;
}

export interface IAadhaarVerifiedData {
  clientId: string;
  fullName: string;
  dob: string;
  gender: 'M' | 'F' | 'O' | string;
  maskedAadhaar: string;
  address: IAadhaarAddress;
  profileImage?: string;
  zip?: string;
  verifiedAt: string;
}

export interface IDrivingLicenseVerifyRequest {
  dlNumber: string;
  dob?: string;
}

export interface IDrivingLicenseCovDetail {
  cov: string;
  issueDate?: string;
}

export interface IDrivingLicenseVerifiedData {
  clientId: string;
  licenseNumber: string;
  holderName: string;
  fatherOrHusbandName?: string;
  dob?: string;
  bloodGroup?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'INVALID';
  issueDate?: string;
  validTill?: string;
  nonTransportValidity?: {
    from?: string;
    to?: string;
  };
  transportValidity?: {
    from?: string;
    to?: string;
  };
  covDetails: IDrivingLicenseCovDetail[];
  address?: string;
  state?: string;
  verifiedAt: string;
}

export interface IKycServiceStatus {
  isConfigured: boolean;
  mode: 'live' | 'sandbox';
  baseUrl: string;
}
