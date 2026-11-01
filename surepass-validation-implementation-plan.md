# Implementation Plan: Surepass Aadhaar & Driving License Verification

## 1. Metadata
- **Branch Name**: `feat/surepass-aadhaar-dl-verification`
- **Commit Message**: `feat(kyc): implement Surepass Aadhaar and Driving License validation with backend authentication`
- **Scope**: Frontend Angular Page + Backend Express API Service + Shared Types

---

## 2. Architecture & Design Principles

```
┌────────────────────────────────────────────────────────┐
│             Frontend (Angular 22 / Spartan)            │
│  - Aadhaar Verification Tab (OTP Generation & Submit)  │
│  - Driving License Tab (DL Number + DOB Verification)  │
│  - Verified Identity Cards (Masked PII, Badges)        │
└───────────────────────────┬────────────────────────────┘
                            │ (Calls internal API only)
                            ▼
┌────────────────────────────────────────────────────────┐
│           Backend API (apps/portfolio-core)            │
│  - Auth Middleware (JWT check & Rate Limiting)         │
│  - Input Sanity & Format Validation                    │
│  - Surepass Service (Bearer Token in server env)       │
│  - KYC Masking / AES-256-GCM Encryption utilities      │
└───────────────────────────┬────────────────────────────┘
                            │ (Secure Server-to-Server)
                            ▼
┌────────────────────────────────────────────────────────┐
│                Surepass API Gateway                    │
│  - POST /api/v1/aadhaar-v2/generate-otp                │
│  - POST /api/v1/aadhaar-v2/submit-otp                  │
│  - POST /api/v1/driving-license/driving-license        │
└────────────────────────────────────────────────────────┘
```

### Security & Privacy Non-Negotiables:
1. **Zero Client Secrets**: The frontend never has access to the Surepass API token or endpoints. All calls are proxied through backend endpoints.
2. **PII Masking & Encryption**: Aadhaar numbers are never logged in plaintext. Responses mask the Aadhaar (displaying only the last 4 digits: `XXXX-XXXX-1234`).
3. **Environment Isolation & Dev Mock Sandbox**: Support both live Surepass credentials (`SUREPASS_API_TOKEN`) and an automatic mock sandbox mode for local development/testing without consuming paid API credits.
4. **Rate Limiting & Abuse Prevention**: Strict rate-limiter applied on KYC endpoints to prevent brute-forcing OTPs or draining Surepass quotas.

---

## 3. Backend Implementation Details (`apps/portfolio-core`)

### 3.1 Environment Configuration (`apps/portfolio-core/src/config/security.ts`)
- Add environment variable accessors:
  - `SUREPASS_API_TOKEN`: Bearer token for Surepass API authentication.
  - `SUREPASS_BASE_URL`: Base URL (default: `https://kyc-api.surepass.io`).
  - `SUREPASS_SANDBOX_MODE`: Boolean flag (`true`/`false`) to toggle mock responses when developing locally without active credits.

### 3.2 Surepass Service (`apps/portfolio-core/src/services/surepass.service.ts`)
- Methods:
  1. `generateAadhaarOtp(aadhaarNumber: string)`:
     - Validates 12-digit format and Verhoeff algorithm checksum.
     - Calls `POST /api/v1/aadhaar-v2/generate-otp`.
     - Returns `client_id`, `otp_sent: boolean`, `if_number: boolean`.
  2. `submitAadhaarOtp(clientId: string, otp: string)`:
     - Calls `POST /api/v1/aadhaar-v2/submit-otp`.
     - Sanitizes response: extracts full name, DOB, gender, address, and profile photo/base64 avatar.
     - Masks Aadhaar number to `XXXX-XXXX-1234`.
  3. `verifyDrivingLicense(idNumber: string, dob?: string)`:
     - Validates DL format (e.g. `^[A-Z]{2}[0-9]{2}[0-9A-Z]{11,12}$`).
     - Calls `POST /api/v1/driving-license/driving-license`.
     - Returns holder name, status (`ACTIVE` / `EXPIRED`), validity periods (transport and non-transport), authorized vehicle categories (`LMV`, `MCWG`, etc.), state/RTO.
  4. Built-in Sandbox Mock Fallback:
     - If `SUREPASS_API_TOKEN` is not set or set to `mock`/`sandbox`, returns realistic synthetic verification payloads so developers and CI/CD tests run seamlessly.

### 3.3 KYC Controller & Routes (`apps/portfolio-core/src/routes/kyc.routes.ts`)
- **Endpoints**:
  - `POST /api/kyc/aadhaar/generate-otp`
    - Body: `{ aadhaarNumber: string }`
  - `POST /api/kyc/aadhaar/submit-otp`
    - Body: `{ clientId: string, otp: string }`
  - `POST /api/kyc/driving-license/verify`
    - Body: `{ dlNumber: string, dob?: string }`
  - `GET /api/kyc/config`
    - Returns service status (e.g. `{ isConfigured: boolean, mode: 'live' | 'sandbox' }`) without revealing tokens.
- **Middleware**:
  - `authenticateToken` / `authenticateRRToken`: Ensures caller is an authenticated user.
  - `express-rate-limit`: Rate limit KYC verification calls (e.g., max 10 requests per minute per IP/user).
- **Mounting in `main.ts`**:
  - `app.use('/api/kyc', kycRouter);`
  - Also mount under `rr.routes.ts` (`/api/rr/kyc`) for RR module integration if needed.

---

## 4. Shared Types (`libs/shared-types`)

### New file: `libs/shared-types/src/lib/kyc.ts` (Exported in `libs/shared-types/src/index.ts`):
```typescript
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

export interface IAadhaarVerifiedData {
  clientId: string;
  fullName: string;
  dob: string;
  gender: string;
  maskedAadhaar: string;
  address: {
    careOf?: string;
    line?: string;
    street?: string;
    locality?: string;
    district?: string;
    state?: string;
    pin: string;
    country: string;
  };
  profileImage?: string;
  verifiedAt: string;
}

export interface IDrivingLicenseVerifyRequest {
  dlNumber: string;
  dob?: string;
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
  covDetails: Array<{
    cov: string;
    issueDate?: string;
  }>;
  address?: string;
  state?: string;
  verifiedAt: string;
}

export interface IKycServiceStatus {
  isConfigured: boolean;
  mode: 'live' | 'sandbox';
}
```

---

## 5. Frontend Implementation (`apps/portfolio`)

### 5.1 Service: `apps/portfolio/src/app/shared/services/kyc-api.service.ts`
- Encapsulates `HttpClient` calls to `/api/kyc/...`.
- Provides reactive signals/methods:
  - `generateAadhaarOtp(aadhaarNumber: string)`
  - `submitAadhaarOtp(clientId: string, otp: string)`
  - `verifyDrivingLicense(dlNumber: string, dob?: string)`
  - `checkServiceStatus()`

### 5.2 Component: `KycVerificationComponent`
- **Location**: `apps/portfolio/src/app/modules/user/components/kyc-verification/` (or `apps/portfolio/src/app/modules/rr/components/kyc-verification/`)
- **Route**:
  - Accessible at `/user/kyc-verification` (and optional menu shortcut in RR dashboard navigation `/user/rr/kyc-verification`).
- **UI Structure & Design System**:
  - Spartan UI / Helm Tabs:
    - **Tab 1: Aadhaar Card Verification**
      - Visual step indicator: Step 1 (Enter Aadhaar) ➔ Step 2 (Verify OTP).
      - Step 1: Input with format masking (`XXXX XXXX XXXX`), Aadhaar length check (12 digits), "Send OTP" button with loading state.
      - Step 2: 6-digit OTP input, 60-second countdown timer for "Resend OTP", "Verify OTP" button.
      - Success Result Card:
        - UIDAI-styled verified credential summary.
        - Shield badge: "UIDAI Verified via Surepass".
        - Name, Masked Aadhaar (`XXXX-XXXX-1234`), Gender, DOB, Address breakdown, Avatar thumbnail.
        - "Copy Verified Info" and "Verify Another" actions.
    - **Tab 2: Driving License Verification**
      - Input fields: Driving License Number (`e.g. DL1420110012345`) + Date of Birth picker (`YYYY-MM-DD`).
      - "Verify License" button with loading state.
      - Success Result Card:
        - Transport Authority verified card with Status pill (`ACTIVE` in green, `EXPIRED` in red).
        - Name, Father/Husband Name, License Number.
        - Vehicle Class badges (e.g., `LMV - Light Motor Vehicle`, `MCWG - Motorcycle with Gear`).
        - Validity dates (Non-Transport & Transport).
        - "Copy Details" action.
  - **Shared UI Elements**:
    - Real-time input validation (formatting Aadhaar digits, uppercase DL formatting).
    - Sandbox/Demo mode badge indicator when running in test mode.
    - Clear error banners for invalid OTP, expired documents, or quota limits with retry actions.

### 5.3 Routing & Navigation Updates
- Add route to `user-routing.module.ts`:
  ```typescript
  {
    path: 'kyc-verification',
    loadComponent: () =>
      import('./components/kyc-verification/kyc-verification.component').then(
        (m) => m.KycVerificationComponent
      ),
    canActivate: [authGuard],
    data: {
      seo: {
        title: 'Aadhaar & Driving License KYC Verification | Surepass',
        description: 'Instant Aadhaar and Driving License identity verification powered by Surepass API.',
        robots: 'noindex, nofollow',
      },
    },
  }
  ```
- Add navigation item in user dashboard / RR sidebar for easy one-click access.

---

## 6. Testing & Quality Assurance

1. **Unit / Integration Tests**:
   - Backend service test: `surepass.service.spec.ts` testing Aadhaar OTP generation, OTP submission, DL verification, and error parsing.
   - Controller test: verifying status codes, input validation (rejecting malformed Aadhaar/DL), and rate limiter headers.
2. **Component Tests**:
   - `kyc-verification.component.spec.ts` testing form validation, tab switching, OTP countdown timer, and verified result card rendering.
3. **E2E / Playwright Test**:
   - Test flow: Navigate to KYC page ➔ Select Aadhaar ➔ Enter number ➔ Submit OTP ➔ Verify result card appears ➔ Switch to DL tab ➔ Enter DL & DOB ➔ Verify DL card displays vehicle categories and validity.

---

## 7. Deliverables Checklist

- [ ] `libs/shared-types/src/lib/kyc.ts` (Shared DTOs & Interfaces)
- [ ] `apps/portfolio-core/src/config/security.ts` (Surepass config accessors)
- [ ] `apps/portfolio-core/src/services/surepass.service.ts` (Surepass API client with sandbox mock fallback)
- [ ] `apps/portfolio-core/src/controllers/kyc.controller.ts` (API handlers with input validation)
- [ ] `apps/portfolio-core/src/routes/kyc.routes.ts` (Secured Express routes)
- [ ] `apps/portfolio-core/src/main.ts` (Mount KYC router)
- [ ] `apps/portfolio/src/app/shared/services/kyc-api.service.ts` (Angular API client)
- [ ] `apps/portfolio/src/app/modules/user/components/kyc-verification/` (Angular standalone component + template + styles + tests)
- [ ] `apps/portfolio/src/app/modules/user/user-routing.module.ts` (Route registration)

