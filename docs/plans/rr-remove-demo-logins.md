# Implementation Plan: Remove Demo Desk Staff and Demo Admin Logins from RR Module

## Overview
Remove the demo quick-login shortcut buttons ("Demo Desk Staff" and "Demo Admin") and their associated component logic from the RoadReady (RR) login page in the frontend, and update all affected unit and E2E test specs to enter credentials directly.

---

## 1. Proposed Git Metadata

- **Branch Name**: `refactor/rr-remove-demo-logins`
- **Commit Message**: `refactor(rr): remove demo desk staff and demo admin login shortcuts`

---

## 2. File Changes

### A. Template: `apps/portfolio/src/app/modules/rr/components/login/rr-login.component.html`
- **Remove Demo Helper Buttons Container**:
  Remove the `<div>` container with class `flex items-center justify-center gap-2 pt-3` (lines 194–218) containing:
  - `Demo Desk Staff` button with `(click)="fillDemoEmployee()"`
  - `Demo Admin` button with `(click)="fillDemoAdmin()"`
- Retain tabs, login forms, validation errors, and submit buttons as-is.

### B. Component Logic: `apps/portfolio/src/app/modules/rr/components/login/rr-login.component.ts`
- **Remove Demo Helper Methods**:
  - Delete `fillDemoAdmin()` (lines 180–186).
  - Delete `fillDemoEmployee()` (lines 188–194).
- **Clean Up Icons**:
  - Remove `lucideZap` from `@ng-icons/lucide` imports.
  - Remove `lucideZap` from `provideIcons({ ... })`.

### C. Component Spec: `apps/portfolio/src/app/modules/rr/components/login/rr-login.component.spec.ts`
- **Update Tests relying on Demo buttons**:
  - Test `should quick-fill desk staff credentials with Demo button and login successfully`:
    - Rename to `should fill desk staff credentials and login successfully`.
    - Replace clicking `Demo Desk Staff` button with filling `#empId` (`RRA002`) and `#dob` (`15-05-1990`).
  - Test `should validate admin credentials, toggle password visibility, and login via Demo Admin`:
    - Rename to `should validate admin credentials, toggle password visibility, and login successfully`.
    - Replace clicking `Demo Admin` button with filling `#adminUsername` (`admin@rams-cars.com`) and `#adminPassword` (`AdminPD`).
  - Test `should display error message on failed login attempt`:
    - Replace clicking `Demo Desk Staff` button with filling `#empId` and `#dob` directly before submitting.

### D. E2E Spec: `apps/portfolio/src/app/modules/rr/rr.spec.ts`
- **Update E2E Auth and Inactivity Flows**:
  - In `should complete desk staff authentication flow using demo credentials`:
    - Rename to `should complete desk staff authentication flow`.
    - Replace clicking `Demo Desk Staff` button with filling `#empId` (`RRA002`) and `#dob` (`15-05-1990`).
  - In `should not display lock screen overlay immediately after fresh login even if prior storage has stale lock state`:
    - Replace clicking `Demo Desk Staff` button with filling `#empId` (`RRA002`) and `#dob` (`15-05-1990`).

---

## 3. Verification Plan

### Automated Tests
1. **Login Component Spec**:
   ```bash
   npx playwright test apps/portfolio/src/app/modules/rr/components/login/rr-login.component.spec.ts
   ```
2. **RR Module E2E Flow Spec**:
   ```bash
   npx playwright test apps/portfolio/src/app/modules/rr/rr.spec.ts
   ```
3. **Build & Lint Verification**:
   ```bash
   npx nx run portfolio:build --skip-nx-cache
   ```

### Manual Verification
1. Navigate to `/user/rr/login`.
2. Verify that neither "Demo Desk Staff" nor "Demo Admin" buttons appear between the tabs header and form content.
3. Manually enter desk staff credentials (`RRA002` + DOB) and admin credentials (`admin@rams-cars.com` + `AdminPD`) to verify login remains functional.
