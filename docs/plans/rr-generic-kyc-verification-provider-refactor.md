# Implementation Plan: Generic Identity Verification (KYC) Provider Refactoring

## 1. Executive Summary & Objectives

### Problem & Context
The RoadReady Rentals (`rr`) portal currently provides Indian identity verification (Aadhaar Paperless e-KYC and Driving License validation) tied to a legacy third-party provider name (Surepass). 

This implementation plan refactors the identity verification architecture to a **fully provider-agnostic, generic design**:
1. **Generic File & Service Names**: Replaces provider-specific files with generic implementations (e.g., `kyc-verification.service.ts`).
2. **Generic Function & Method Names**: Configuration accessors and verification logic use generic names (`getKycClientId()`, `getKycClientSecret()`, `getKycBaseUrl()`, `isKycSandbox()`, `generateAadhaarOtp()`, `submitAadhaarOtp()`, `verifyDrivingLicense()`).
3. **Generic Clean REST APIs**: All API endpoints remain neutral under `/api/kyc/*` and `/api/rr/kyc/*` with zero provider references.
4. **Complete Frontend De-Branding & White-Labeling**: No third-party provider names appear anywhere on the frontend (HTML templates, placeholders, input attributes, buttons, status badges, footers, tooltips, or routing SEO metadata).
5. **Modern Provider Engine Integration**: Upgrades the backend verification engine to use the modern verification gateway under the hood, with generic environment variables (`KYC_CLIENT_ID`, `KYC_CLIENT_SECRET`, `KYC_BASE_URL`, `KYC_SANDBOX_MODE`) and backwards-compatible credential fallbacks.

---

## 2. Git Information

### Branch Strategy
- **Primary Feature Branch**: `feat/rr-identity-kyc-verification`
- **Optional Modular Branches** (if splitting into separate PRs):
  - Backend API: `feat/rr-kyc-backend-integration`
  - Frontend UI: `feat/rr-kyc-generic-ui`

---

## 3. Divided Task Breakdown & Commit Messages

| Task # | Scope | Description | Commit Message |
| :--- | :--- | :--- | :--- |
| **Task 1** | Backend Config | Add generic KYC credentials and security accessors (`getKycClientId`, `getKycClientSecret`, `getKycBaseUrl`, `isKycSandbox`) in `security.ts` | `feat(core): add generic kyc credentials and security configuration` |
| **Task 2** | Backend Service | Create `KycVerificationService` (`kyc-verification.service.ts`) with Aadhaar OTP & Driving License verification and local mock sandbox mode | `feat(core): implement kyc verification service for aadhaar and driving license` |
| **Task 3** | Backend Controller | Decouple `KycController` from legacy provider, standardizing error formatting and neutral logging | `refactor(core): decouple kyc controller and endpoints from legacy provider` |
| **Task 4** | Frontend UI | Sanitize KYC HTML template, component logic, and routing SEO metadata to use generic gateway terminology | `feat(rr): standardize generic kyc verification ui and remove legacy provider branding` |
| **Task 5** | Tests & Verification | Update Playwright E2E tests and component specs to validate generic labels (`Sandbox Verification Mode`, `Send Verification OTP`) | `test(rr): update kyc verification e2e test assertions for generic gateway` |
| **Task 6** | Documentation | Update architecture documentation and environment configuration guides with generic specs | `docs(rr): document generic kyc verification architecture and provider configuration` |

### Combined Squash Commit Option
```text
feat(rr): modernize kyc identity verification service with generic provider abstraction and white-label ui

- Introduce generic KycVerificationService for Aadhaar OTP and Driving License verification
- Add generic security configuration accessors (KYC_CLIENT_ID, KYC_CLIENT_SECRET, KYC_BASE_URL, KYC_SANDBOX_MODE)
- Build local synthetic sandbox mock engine for development and testing without paid API credits
- Decouple KycController and routes from provider-specific references with standardized error handling
- Sanitize frontend templates, buttons, badges, placeholders, and routing SEO with generic gateway terminology
- Update Playwright E2E test suite to assert on generic verification gateway labels
```

---

## 4. Generic Architectural & API Specifications

### 4.1 Generic Configuration & Environment Variables
The application uses generic environment variables, with backward-compatible fallbacks:

| Generic Accessor Function | Primary Environment Variable | Fallback Variable(s) | Default / Description |
| :--- | :--- | :--- | :--- |
| `getKycClientId()` | `KYC_CLIENT_ID` | `CASHFREE_CLIENT_ID`, `CASHFREE_APP_ID` | Client identifier for gateway |
| `getKycClientSecret()` | `KYC_CLIENT_SECRET` | `CASHFREE_CLIENT_SECRET` | Client authentication secret |
| `getKycBaseUrl()` | `KYC_BASE_URL` | `CASHFREE_BASE_URL` | Gateway URL (e.g. sandbox / live) |
| `isKycSandbox()` | `KYC_SANDBOX_MODE` | `CASHFREE_SANDBOX_MODE` | `true` if empty credentials or flag set |

### 4.2 Generic Endpoint & Service Mapping

#### A. Aadhaar OTP Generation
- **Backend Route**: `POST /api/kyc/aadhaar/generate-otp`
- **Controller Method**: `KycController.generateAadhaarOtp(req, res)`
- **Service Method**: `KycVerificationService.generateAadhaarOtp(rawAadhaar: string): Promise<IAadhaarOtpResponse>`
- **Outgoing Gateway Call**: `POST {baseUrl}/offline-aadhaar/otp`
  - **Headers**: `x-client-id`, `x-client-secret`, `Content-Type: application/json`
  - **Payload**: `{ "aadhaar_number": "123456789012" }`
  - **Gateway Response**: `{ "status": "SUCCESS", "message": "OTP sent successfully", "ref_id": "987654321" }`
  - **Unified Output Contract (`IAadhaarOtpResponse`)**:
    ```json
    {
      "clientId": "987654321",
      "otpSent": true,
      "message": "OTP sent successfully to registered mobile number.",
      "validAadhaar": true
    }
    ```

#### B. Aadhaar OTP Verification
- **Backend Route**: `POST /api/kyc/aadhaar/submit-otp`
- **Controller Method**: `KycController.submitAadhaarOtp(req, res)`
- **Service Method**: `KycVerificationService.submitAadhaarOtp(clientId: string, otp: string): Promise<IAadhaarVerifiedData>`
- **Outgoing Gateway Call**: `POST {baseUrl}/offline-aadhaar/verify`
  - **Headers**: `x-client-id`, `x-client-secret`, `Content-Type: application/json`
  - **Payload**: `{ "otp": "123456", "ref_id": clientId }`
  - **Unified Output Contract (`IAadhaarVerifiedData`)**:
    - `clientId`: gateway reference ID
    - `fullName`: legal name from verified record
    - `dob`: date of birth
    - `gender`: gender identifier (`M`, `F`, `O`)
    - `maskedAadhaar`: masked 12-digit string (`XXXX-XXXX-8899`)
    - `address`: structured address object
    - `profileImage`: profile photograph data/link
    - `verifiedAt`: ISO timestamp

#### C. Driving License Verification
- **Backend Route**: `POST /api/kyc/driving-license/verify`
- **Controller Method**: `KycController.verifyDrivingLicense(req, res)`
- **Service Method**: `KycVerificationService.verifyDrivingLicense(dlNumber: string, dob?: string): Promise<IDrivingLicenseVerifiedData>`
- **Outgoing Gateway Call**: `POST {baseUrl}/driving-license` (or `/verification/driving-license`)
  - **Headers**: `x-client-id`, `x-client-secret`, `Content-Type: application/json`
  - **Payload**: `{ "dl_number": dlNumber, "dob": dob }`
  - **Unified Output Contract (`IDrivingLicenseVerifiedData`)**:
    - `clientId`: reference ID
    - `licenseNumber`: sanitized license number
    - `holderName`: driver legal name
    - `fatherOrHusbandName`: parent/spouse name
    - `status`: `ACTIVE` | `EXPIRED` | `SUSPENDED` | `INVALID`
    - `covDetails`: permitted vehicle categories (e.g. `LMV`, `MCWG`)
    - `address`: registered RTO address
    - `validTill`: license expiry date
    - `verifiedAt`: ISO timestamp

---

## 5. Generic Frontend String Matrix (Strict White-Labeling)

No third-party provider names appear anywhere in the client UI:

| Location | Legacy Text | Generic Replacement |
| :--- | :--- | :--- |
| `kyc-verification.component.html:13` | `Verify official Indian identity credentials with Surepass...` | `Verify official Indian identity credentials securely. All authentication and cryptographic secrets remain safely secured on the backend.` |
| `kyc-verification.component.html:22` | `Surepass Sandbox Mode` | `Sandbox Verification Mode` |
| `kyc-verification.component.html:27` | `Surepass Production Gateway` | `Live Verification Gateway` |
| `kyc-verification.component.html:144` | `Send OTP via Surepass` | `Send Verification OTP` |
| `kyc-verification.component.html:356` | `Validate license validity, transport classes, and driver credentials with Surepass` | `Validate license validity, transport classes, and driver credentials` |
| `kyc-verification.component.html:547` | `Verified via Surepass Gateway` | `Verified via Secure Gateway` |
| `kyc-verification.component.ts:126` | `baseUrl: 'https://kyc-api.surepass.io'` | `baseUrl: ''` |
| `rr-routing.module.ts:152` | `Validate customer Aadhaar and Driving License credentials with Surepass.` | `Validate customer Aadhaar and Driving License credentials.` |
| `user-routing.module.ts:83` | `...powered by Surepass API.` | `...via secure government registry verification.` |
| HTML Inputs & Placeholders | `XXXX XXXX XXXX`, `123456`, `e.g. DL1420110012345` | Kept neutral and generic |

---

## 6. Implementation Steps in Detail

### Task 1: Update Security Config (`apps/portfolio-core/src/config/security.ts`)
1. Implement generic helper functions:
   - `getKycClientId()`
   - `getKycClientSecret()`
   - `getKycBaseUrl()`
   - `isKycSandbox()`
2. Add fallbacks to legacy environment variables for zero-downtime transition.
3. Export generic functions and deprecate legacy provider accessors.

### Task 2: Create Generic KYC Service (`apps/portfolio-core/src/services/kyc-verification.service.ts`)
1. Create `KycVerificationService` class with methods:
   - `getServiceStatus(): IKycServiceStatus`
   - `generateAadhaarOtp(rawAadhaar: string): Promise<IAadhaarOtpResponse>`
   - `submitAadhaarOtp(clientId: string, rawOtp: string): Promise<IAadhaarVerifiedData>`
   - `verifyDrivingLicense(rawDl: string, rawDob?: string): Promise<IDrivingLicenseVerifiedData>`
2. Implement **Synthetic Sandbox Mode**:
   - If `isKycSandbox()` is `true` or credentials are missing/mock, generates synthetic verified identity data instantly.
   - Allows local development and automated CI test runs without hitting external third-party servers.
3. Remove/deprecate `apps/portfolio-core/src/services/surepass.service.ts`.

### Task 3: Decouple Controller & Route Handlers
1. Update `apps/portfolio-core/src/controllers/kyc.controller.ts` to call `KycVerificationService`.
2. Standardize error handling and eliminate any provider-specific error prefixes or log messages.
3. Keep routes unchanged in `apps/portfolio-core/src/routes/kyc.routes.ts`.

### Task 4: Sanitize Frontend KYC Component & Routing
1. Update `apps/portfolio/src/app/modules/user/components/kyc-verification/kyc-verification.component.html` using the Generic Replacement strings from Section 5.
2. Update `apps/portfolio/src/app/modules/user/components/kyc-verification/kyc-verification.component.ts` to remove hardcoded URLs in error fallbacks.
3. Update routing descriptions in `apps/portfolio/src/app/modules/rr/rr-routing.module.ts` and `apps/portfolio/src/app/modules/user/user-routing.module.ts`.

### Task 5: Update Playwright E2E Tests
1. Update `apps/portfolio/src/app/modules/user/components/kyc-verification/kyc-verification.component.spec.ts`:
   - Replace assertions looking for legacy badges with `Sandbox Verification Mode`.
   - Update button selector to `name: /Send Verification OTP/i`.
   - Update mocked route endpoints to generic URLs.

### Task 6: Testing & Quality Assurance
1. Run backend unit tests: `pnpm nx test portfolio-core`.
2. Run frontend component/e2e tests: `pnpm nx e2e portfolio`.
3. Check TypeScript compilation: `pnpm nx build portfolio` and `pnpm nx build portfolio-core`.
4. Run full-text search across codebase to ensure 0 remaining occurrences of legacy provider names.
5. Verify customer-facing frontend has 0 provider-specific terms.

---

## 7. Rollout & Environment Setup Checklist

- [ ] Set `KYC_CLIENT_ID` in deployment environment.
- [ ] Set `KYC_CLIENT_SECRET` in deployment environment.
- [ ] Set `KYC_SANDBOX_MODE=true` (or `false` for live production).
- [ ] Set `KYC_BASE_URL` (defaults to appropriate gateway endpoint).
- [ ] Verify both `/api/kyc/*` and `/api/rr/kyc/*` routes respond accurately with sanitized payloads.

