# Implementation Plan: Fix RR Module Lock Screen Prompt After Login

## Problem Statement
When a user logs into the RoadReady (RR) module via `/user/rr/login` (Desk Agent or Admin), the system immediately displays the lock screen asking for credentials again ("Session Locked - Your workspace was locked after 5 minutes of inactivity..."), instead of showing the Fleet Dashboard.

---

## Root Cause Analysis
1. **Unsynchronized Storage State**:
   - `RRInactivityService` relies on two `localStorage` / `chrome.storage` keys: `rr_session_is_locked` and `rr_session_last_active`.
   - If an active session was previously locked or if the user logged out/closed their tab, these keys persist in `localStorage`.
   - `RRApiService.clearSession()` and `RRApiService.logout()` only remove user token and role keys, leaving `rr_session_is_locked` and `rr_session_last_active` untouched.

2. **Lazy Service Instantiation**:
   - `RRInactivityService` is only injected in `RRDashboardComponent` and `RRLockScreenComponent`.
   - It is not injected in `RRLoginComponent`. Therefore, when the user is on the login page, the inactivity service's constructor and effect do not run to clear storage.

3. **Stale Lock / Timestamp Detection on Dashboard Init**:
   - When the user logs in from `RRLoginComponent`, `RRApiService.login()` authenticates and navigates to `/user/rr/dashboard`.
   - `RRDashboardComponent` initializes and injects `RRInactivityService` for the first time.
   - `RRInactivityService` runs `initializeFromStorage()`:
     - If `rr_session_is_locked === 'true'`, it immediately sets `isLocked = true`.
     - Even if `rr_session_is_locked` was not `'true'`, `rr_session_last_active` holds a timestamp from minutes or hours ago. `initializeFromStorage()` computes `elapsed = Date.now() - parsedTime >= 5 minutes` and immediately calls `this.lockSession()`.
   - The `@if (inactivityService.isLocked())` guard in `dashboard.component.html` immediately mounts `<app-rr-lock-screen>`, asking for the user's password right after login.

---

## Proposed Changes

### 1. `RRInactivityService` (`apps/portfolio/src/app/modules/rr/services/rr-inactivity.service.ts`)
- Expose a public `resetSessionState()` / `resetOnLogin()` method that:
  - Sets `isLocked.set(false)`
  - Resets `errorMessage.set(null)`
  - Resets `remainingSeconds.set(Math.floor(this.timeoutMs() / 1000))`
  - Updates `lastActiveTimestamp = Date.now()`
  - Writes current timestamp to `rr_session_last_active` in `localStorage` and `chrome.storage`
  - Explicitly sets `rr_session_is_locked = 'false'` in `localStorage` and `chrome.storage`
  - Clears extension badge and updates window title
- Make `clearStorageState()` accessible or call `resetSessionState()` when a fresh session begins.

### 2. `RRApiService` (`apps/portfolio/src/app/modules/rr/services/rr-api.service.ts`)
- In `login()`:
  - On successful response before/after saving session, clear `rr_session_is_locked` and set `rr_session_last_active` to `Date.now().toString()` in both `localStorage` and `chrome.storage.local`.
- In `clearSession()` & `logout()`:
  - Remove `rr_session_is_locked` and `rr_session_last_active` from `localStorage` and `chrome.storage.local`.

### 3. `RRLoginComponent` (`apps/portfolio/src/app/modules/rr/components/login/rr-login.component.ts`)
- Inject `RRInactivityService`.
- In `ngOnInit()`:
  - Ensure any leftover `rr_session_is_locked` flag is removed on entry to the login screen.
- In `onEmployeeSubmit()` and `onAdminSubmit()`:
  - After `rrApi.login()` succeeds, call `inactivityService.resetSessionState()` to guarantee clean active session state before redirecting to `/user/rr/dashboard`.

### 4. `RRDashboardComponent` (`apps/portfolio/src/app/modules/rr/components/dashboard/dashboard.component.ts`)
- In `logout()`:
  - Ensure `this.inactivityService.clearStorageState()` or `this.inactivityService.logout()` is called so no stale locked flag is left for future logins.

### 5. Test Suite (`apps/portfolio/src/app/modules/rr/rr.spec.ts` & `rr-test.helper.ts`)
- In `clearRRSession()` helper:
  - Ensure `rr_session_last_active` is also cleaned up.
- Add an E2E test case verifying:
  - When `rr_session_is_locked = 'true'` or stale `rr_session_last_active` (> 5 mins old) exists in `localStorage`, logging in clears the lock screen and lands cleanly on the Overview Dashboard.

---

## Verification Plan

### Automated Tests
1. Run Playwright E2E test suite for RR auth and session locking:
   ```bash
   npx playwright test apps/portfolio/src/app/modules/rr/rr.spec.ts
   ```
2. Run Angular unit tests for RR components:
   ```bash
   npx nx test portfolio --test-file=apps/portfolio/src/app/modules/rr/components/login/rr-login.component.spec.ts
   npx nx test portfolio --test-file=apps/portfolio/src/app/modules/rr/components/lock-screen/rr-lock-screen.component.spec.ts
   ```

### Manual Verification
1. Open browser dev tools and manually inject stale lock data:
   ```javascript
   localStorage.setItem('rr_session_is_locked', 'true');
   localStorage.setItem('rr_session_last_active', String(Date.now() - 600000));
   ```
2. Navigate to `/user/rr/login`.
3. Use Demo Desk Staff (`RRA002`) or Demo Admin (`admin@rams-cars.com`) to log in.
4. Verify that:
   - Dashboard loads immediately (`/user/rr/dashboard`).
   - Lock screen dialog is NOT displayed.
   - User profile and fleet metrics render normally.
