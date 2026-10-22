# Module Checkpoint & Invariant Specification: Royal Rentals (RR) Module

**Module Path**: `apps/portfolio/src/app/modules/rr/`  
**Route Prefix**: `/user/rr/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / SCSS)

---

## 1. Module Overview & Global Invariants
The **RR (Royal Rentals) Module** is an enterprise-grade car rental operations platform. It combines a public vehicle showcase with an administrative dashboard covering fleet management, walk-in and advance reservations, return settlements, customer KYC membership tiers, employee permissions, activity audits, customer delay intimations, and legal invoice generation.

### Global Invariants
1. **Public vs. Dashboard Separation**:
   - The public showcase (`/user/rr`, `/user/rr/home`) must remain 100% accessible without authentication.
   - All dashboard routes (`/user/rr/dashboard/*`) require verified staff credentials (`IRRUser`: role `'admin'` or `'employee'`).
2. **Inactivity Session Lock (`RRInactivityService` & `RRLockScreenComponent`)**:
   - **Timeout**: Strictly 5 minutes (`RR_INACTIVITY_TIMEOUT_MS = 300,000ms`) of idle time.
   - Monitored inputs: `mousemove`, `keydown`, `touchstart`, `scroll`, `click` (throttled at 1,500ms).
   - Once expired, sets `rr_session_is_locked = 'true'` and renders `RRLockScreenComponent` requiring password re-verification.
   - Unlock verifies password via `RRApiService.verifyPassword()` and dismisses the overlay without page reload.
   - State synchronizes across browser tabs, Chrome Extension storage, and desktop wrappers.
3. **AES-256 Encrypted Storage Envelopes**:
   - Tokens and session payloads are encrypted using AES-256 (`portfolio_rr_secure_session_v1`) via `createStorageEnvelope` and `verifyStorageEnvelope`.
4. **Audit Trail Immutability**:
   - Every booking creation, modification, vehicle return, login, and deletion must write an entry to `RRActivityLogsComponent`.
5. **Vehicle State Machine Integrity**:
   - Valid lifecycle: `Available` ➔ `Reserved` ➔ `Booked (In-Use)` ➔ `Maintenance` / `Contract` ➔ `Available`.
   - A vehicle cannot be simultaneously marked `Available` while assigned to an active booking.

---

## 2. Page-by-Page Specifications

### Page 2.1: Public Homepage & Showcase (`/user/rr`, `/user/rr/home`)
- **Component**: `RRHomepageComponent`
- **Access**: Public (No Auth Required)
- **Features & Logic**:
  - **Live Scrolling Ticker (`IRRScrollingTicker`)**: Renders dynamic ticker banner configured from announcements (`speed: 'slow' | 'normal' | 'fast'`).
  - **Dynamic CMS Content**: Loads hero headline, promotional banners, services grid, fleet statistics, and customer testimonials from `IRRHomePageContent`.
  - **Vehicle Fleet Catalog (`RRVehicleCardComponent` variant `'homepage'`)**:
    - Filter by Seating: `'all' | '5' | '7'`.
    - Filter by Fuel: Petrol, Diesel, CNG.
    - Filter by Transmission: Manual, Automatic.
    - Vehicle cards display primary thumbnail, daily rate, seating capacity, fuel type, and "Reserve / Book" CTA.
  - **Inquiry Modal**: Clicking "Reserve" opens `RRReserveBookingDialogComponent`.

---

### Page 2.2: Staff Login Portal (`/user/rr/login`)
- **Component**: `RRLoginComponent`
- **Access**: Public
- **Inputs & Validations**:
  - `email`: Required, valid email format regex.
  - `password`: Required string.
- **State Logic**:
  - Calls `RRApiService.login()`.
  - Checks `employee.allowLogin === true` and `employee.status === 'active'`.
  - On success: Stores encrypted session envelopes (`rr_token`, `rr_user`, `loggedInUser: { role, id }`), writes audit log, and navigates to `/user/rr/dashboard/stats`.
  - On failure: Displays inline error alert without clearing email.

---

### Page 2.3: Dashboard Shell & Inactivity Lock Screen (`/user/rr/dashboard`)
- **Component**: `RRDashboardComponent` with `RRLockScreenComponent`
- **Access Guard**: Staff Auth (`IRRUser`)
- **Features**:
  - Header with current employee profile, active role badge (`Admin` vs `Employee`), and Sign Out.
  - Responsive sub-navigation bar with badge counters for active bookings, advance bookings, and pending payments.
  - **Lock Screen Overlay (`RRLockScreenComponent`)**:
    - Displays employee avatar, name, and email.
    - Password input with toggleable show/hide eye icon (`lucideEye` / `lucideEyeOff`).
    - Unlocks session in-place upon valid password check.
    - Logout button clears all storage keys (`rr_user`, `rr_token`, `loggedInUser`, `rr_session_is_locked`) and redirects to login.

---

### Page 2.4: Stats & Operations Overview (`.../dashboard/stats`)
- **Component**: `RRStatsViewComponent`
- **7 Core KPI Categories (`StatCategory`)**:
  1. `fleet`: Total vehicles in system.
  2. `available`: Vehicles ready for immediate rental (`status === 'available'`).
  3. `contract`: Vehicles leased on long-term corporate contracts.
  4. `bookings`: Active on-road rentals.
  5. `maintenance`: Vehicles grounded for service (`status === 'maintenance'`).
  6. `payments`: Active rentals with unpaid balances (`pendingAmount > 0`).
  7. `reserved`: Forward advance reservations.
- **Calculations**:
  - Fleet Utilization % = `round((activeBookings / totalFleet) * 100)`.
  - Quick action modal triggers: "New Rental", "Advance Reservation", "End Rental".

---

### Page 2.5: Active Rentals Management (`.../dashboard/bookings`)
- **Component**: `RRBookingListComponent`
- **Features & Table Controls**:
  - Lists all bookings where `status === 'active'`.
  - Live search filtering by Vehicle Reg No, Renter Name, Phone, or Booking ID.
  - Cards / rows show pickup timestamp, scheduled return, odometer start, paid amount, pending dues, and payment mode.
- **Actions**:
  - **End Rental**: Opens `RREndBookingDialogComponent` for final return calculation.
  - **Modify Rental**: Opens `RRModifyBookingDialogComponent` to extend dates or swap vehicles.
  - **Customer Intimation Modal (`openIntimationModal`)**:
    - Operator logs customer delay call: `intimationType` (`'delay'`), `notes` (min length 3), and `expectedReturnDateTime`.
    - Saves intimation via `rrApi.recordCustomerIntimation()`.
    - **Critical Link**: Directly determines whether the **Non-Intimation Fine** (`nonIntimationFine: 1000`) is triggered during end-booking return settlement.
  - **Print Handover Agreement**: Calls `RRInvoicePdfService.viewAgreementPdf()`.

---

### Page 2.6: Advance Bookings Schedule (`.../dashboard/advance-bookings`)
- **Component**: `RRAdvanceBookingListComponent`
- **Features**:
  - Lists forward reservations where `status === 'reserved'`.
  - Pagination controls (`currentPage`, `prevPage`, `nextPage`).
  - Search by vehicle, customer name, or reservation ID.
- **Actions**:
  - **Reserve Booking**: Opens `RRReserveBookingDialogComponent`.
  - **Modify Reservation**: Edit schedule dates or vehicle preference.
  - **Book Now (Handover Pipeline)**: Auto-fills `RRNewBookingDialogComponent` and promotes to Active Rental with advance credit.
  - **Delete Reservation**: Confirmation prompt, releases vehicle calendar, logs audit entry.

---

### Page 2.7: Vehicle Fleet Inventory (`.../dashboard/vehicles`)
- **Component**: `RRVehicleListComponent`
- **Inventory Rules & State**:
  - Statuses: `Available`, `Booked (In-Use)`, `Maintenance`, `Contract`.
  - If `Maintenance` or `Contract`: Requires `availableBy` / `nextAvailableDate` and sets `allowBooking = false`.
  - **CDK Drag-and-Drop**: `CdkDropList` allows operators to reorder vehicle cards; order persists to backend.
  - **Multi-Image Carousel (`VehicleImageItem` & `RRVehicleImageCarouselComponent`)**:
    - Add, delete, and reorder vehicle photos with fallback image support.
    - Keyboard arrow listeners (`ArrowLeft` / `ArrowRight`) for quick photo browsing.
    - Set single primary image (`isPrimary: boolean`) used as showcase thumbnail.
  - **Pricing Slabs Structure (`IVehiclePricing`)**:
    - `h23`: 24-Hour slab (Price + standard KM allowance, e.g. ₹2500 / 300 KM).
    - `h11`: 12-Hour slab (Price + standard KM allowance, e.g. ₹1600 / 150 KM).
    - `h3`: 4-Hour slab (Price + standard KM allowance, e.g. ₹900 / 60 KM).
    - `h1`: 1-Hour slab (Price + standard KM allowance, e.g. ₹400 / 20 KM).
    - `extraKmPrice`: Rate per excess kilometer (e.g. ₹12/km).
    - `extraHourPrice`: Rate per excess hour (e.g. ₹150/hr).
  - **Compliance Tracking**: Inputs for `insuranceExpiry` and `pollutionExpiry` (PUC) with warning badges for upcoming expiry.

---

### Page 2.8: Employee Directory (`.../dashboard/employees`)
- **Component**: `RREmployeeListComponent`
- **Inputs & Validations**:
  - `firstName`, `lastName`: Required alphabet strings.
  - `dob`: Date of birth ISO string.
  - `phone`: 10-digit number (`/^[0-9]{10}$/`).
  - `email`: Valid email format.
  - `aadhar`: 12-digit number masked via `RRAadharInputComponent`.
  - `dl`: Driving license identifier.
  - `address`: Required physical address.
- **Controls & Actions**:
  - `allowLogin`: Boolean toggle enabling/disabling dashboard login access.
  - `status`: `'active' | 'pending_activation' | 'inactive'`.
  - `role`: `'admin' | 'employee'`.
  - Password Key Reset action for credential recreation.

---

### Page 2.9: Customer Directory & Membership (`.../dashboard/customers`)
- **Component**: `RRCustomerListComponent`
- **Membership Tiers & Discount Structure**:
  - `Standard`: 0% discount.
  - `Silver`: 5% auto-discount.
  - `Gold`: 10% auto-discount.
  - `Platinum / VIP`: 15% auto-discount.
- **Fields & KYC Protection**:
  - `membershipId`: Formatted ID (e.g. `RR-MEM-001`).
  - Masked Aadhar (`AadharVisiblePipe`) and masked Driving License (`XXXXXXXXXXXX-1234`).
  - `totalBookings` and lifetime spend counter.
  - Membership validity window (`startDate` to `endDate`).

---

### Page 2.10: Completed Rentals Archive (`.../dashboard/history`)
- **Component**: `RRHistoryComponent`
- **Features & Filtering**:
  - Archive of all closed rentals (`status === 'completed'`).
  - Date Range Filter: `startDate` to `endDate` using `HlmDatePickerImports`.
  - Vehicle Filter: Live autocomplete dropdown.
  - Customer Search by name or phone.
  - View full return summary: odometer start/end, actual distance driven, extra KM/hour charges, damages deducted, and payment mode.
  - One-click reprint of final tax invoice PDF via `RRInvoicePdfService`.

---

### Page 2.11: Activity Audit Logs (`.../dashboard/activity-logs`)
- **Component**: `RRActivityLogsComponent`
- **Log Structure (`ILog`)**:
  - `action`: e.g. `'started booking'`, `'ended booking'`, `'modified booking'`, `'logged in'`, `'deleted reservation'`, `'recorded intimation'`.
  - `performedBy`: Operator name and ID (e.g. `Desk Agent (RRA002)`).
  - `role`: `'admin' | 'employee'`.
  - `timestamp`: UTC ISO timestamp formatted via `IndianDatePipe`.
  - `details`: Descriptive string including vehicle reg no and booking ID.

---

### Page 2.12: Announcements & Ticker Manager (`.../dashboard/announcements`)
- **Component**: `RRAnnouncementsComponent`
- **Scrolling Ticker Controls**:
  - `message`: Ticker announcement text.
  - `badgeText`: Tag chip label (e.g. `FESTIVAL SPECIAL`).
  - `speed`: `'slow' | 'normal' | 'fast'`.
  - `isActive`: Toggle displaying ticker on public homepage.
  - `linkText` & `linkUrl`: Optional CTA hyperlink.
- **Announcement Cards (`IRRAnnouncementItem`)**:
  - Categories: `festival`, `offer`, `intimation`.
  - Priority ordering (higher priority cards render first).
  - Promotional fields: `promoCode`, `discountText`, `validUntil`.
  - CTA action: `'call'` (dials phone) vs `'link'` (opens URL).

---

### Page 2.13: Homepage Content CMS (`.../dashboard/home-content`)
- **Component**: `RRHomeContentAdminComponent`
- **CMS Sections**:
  - Hero banner headline, subtitle, primary CTA text, and background image URL.
  - Promotional banners array (`banners: IRRHomeBanner[]`).
  - Services array (`services: IRRHomeServiceItem[]`).
  - Statistics counters (`stats: IRRHomeStatItem[]`).
  - Contact information (helpline phone, email, operating hours, address).
  - "Reset to Defaults" button: Restores content back to `DEFAULT_RR_HOMEPAGE_CONTENT`.

---

## 3. Deep-Dive Dialog & Shared Component Specifications

### Dialog 3.1: New Booking Dialog (`RRNewBookingDialogComponent`)
- **1. Renter Validations**:
  - `renterFirstName`, `renterSecondName`, `renterFatherName`: Required, regex `/^[A-Za-z ]+$/`.
  - `renterAadhar`: Required 12 digits (`/^[0-9]{12}$/`). Masked in UI via `RRAadharInputComponent`.
  - `renterDL`: Required 16 alphanumeric characters (`/^[A-Za-z0-9]{16}$/`).
  - `renterPhone`: Required 10 digits (`/^[0-9]{10}$/`). `renterAltPhone`: Optional 10 digits.
  - `renterAddress`: Required. `renterEmail`: Valid email regex.
- **2. Guarantor Validations**:
  - `guarFirstName`, `guarSecondName`, `guarFatherName`, `guarPhone` (10 digits), `guarAddress` required.
  - `guarAadhar` (12 digits) and `guarDL` (16 alphanumeric) optional.
- **3. Real-Time Schedule Conflict Engine (`ScheduleConflict`)**:
  - Validates `[pickupDateTime, returnDateTime]` against active bookings and advance reservations.
  - Hard blocks confirmation if conflict is detected.
- **4. Security Deposit Options**:
  - `'none'`: No deposit.
  - `'bike'`: Requires `bikeRegNo`, `bikeManufacturer`, `bikeModel`, `bikeOwner`.
  - `'cash'`: Requires positive `cashAmount`.
  - `'other'`: Requires `otherItemName` and `otherItemValue`.
- **5. Pricing & Discount Calculations**:
  - Computes duration in days and hours.
  - Discount Types:
    - If `discountType === 'rupee'`: Flat rupee discount deducted.
    - If `discountType === 'percentage'`: Deducts `(totalRentalAmount * discountPercent) / 100`.
  - Membership auto-discount applied if customer found in directory.
  - `finalRentalAmount = totalRentalAmount - discount`.
  - `pendingAmount = finalRentalAmount - amountPaid`.
  - Payment modes: `'Cash' | 'UPI' | 'Card' | 'Net Banking'`.
  - Operator manual paid tracking via `amountByUser`.

---

### Dialog 3.2: Finalize & End Rental Dialog (`RREndBookingDialogComponent`)
- **1. Form Validations**:
  - `odometerEnd`: Required numeric; **must be `>= vehicleOdometerStart`**.
  - `returnDateTimeActual`: Required valid ISO date; **must be `>= pickupDateTime`**.
  - `cleanlinessChoice`: Required `'none' | '500' | '1000' | 'custom'`. Custom amounts must be `>= 0`.
  - Dynamic damages list: Each damage requires description and non-negative amount.
  - Challana / Toll / Fines: Optional; must be `>= 0`.
- **2. The 5 End-Booking Scenarios**:
  - **Case 1: Standard / Early Return**: Returned on or before scheduled end without exceeding KM limit.
  - **Case 2: Late Return (Extra Hours)**:
    - `extraHours = actualReturnTime - scheduledReturnTime` (rounded up).
    - `extraHourFee = extraHours * vehicle.extraHourRate`.
  - **Case 3: KM Overage**:
    - `actualDistanceDriven = odometerEnd - odometerStart`.
    - `extraKms = max(0, actualDistanceDriven - allowedKms)`.
    - `extraKmFee = extraKms * vehicle.extraKmRate`.
  - **Case 4.1: Combined Late Return + Extra KMs**:
    - Applies both `extraHourFee` and `extraKmFee`.
    - **Non-Intimation Fine Evaluation**: If customer exceeded both limits without logging an advance intimation (`submitCustomerIntimation`), an optional `nonIntimationFine` (default 1000, uncapped) is applied.
  - **Case 4.2: Extension / Slab Recalculation Mode**:
    - Recalculates base slab rent and effective KM allowance (`slabExtraKmAllowance`), adjusting overage charges.
- **3. Settlement Formulas**:
  - `totalAdditionalFees = cleanlinessFee + extraKmFee + extraHourFee + damagesTotal + challanaTollFinesTotal + nonIntimationFine`.
  - `finalTotalPayable = finalRentAmount + totalAdditionalFees`.
  - `balancePending = finalTotalPayable - totalPaidAmount`.
  - If `balancePending > 0`: Customer pays due balance.
  - If `balancePending < 0`: Refund owed to customer (security deposit return).
  - Triggers automated tax-compliant PDF invoice via `RRInvoicePdfService`.

---

### Dialog 3.3: Modify & Cancel Booking Dialog (`RRModifyBookingDialogComponent`)
- **Modification**: Allows vehicle swapping, return date extension, and start odometer adjustment.
- **Cancellation & Deletion Flow**:
  - Mandatory cancellation reason recorded in audit log.
  - Refund handling: `returnedAmountMode` strictly one of:
    - `'Original method' | 'Cash' | 'UPI Transfer' | 'Bank Transfer' | 'Used for another Booking'`.
  - Immediately releases vehicle status back to `'available'`.

---

### Dialog 3.4: Reserve Booking Dialog (`RRReserveBookingDialogComponent`)
- Captures forward reservation schedules, vehicle reg preference, and customer contact details.
- Validates against schedule conflicts before recording as `reserved`.

---

### Dialog 3.5: PDF Viewer & Agreement Generator (`RRInvoicePdfService` & `RRPdfViewerDialogComponent`)
- Output: Legal paper format `[216, 356]` mm.
- Includes complete terms and conditions clauses (intoxication, unauthorized drivers, breakdown protocol, damage indemnity).
- Masks Aadhar numbers (`XXXX XXXX 1234`) for privacy compliance.
- Three signature blocks: Renter Signature, Guarantor Signature, Ram's Cars Authorised Signatory.
- Memory leak protection: Revokes object URL (`URL.revokeObjectURL(blobUrl)`) on dialog destroy.

---

### Component 3.6: Aadhaar Custom CVA Input (`RRAadharInputComponent`)
- Implements Angular `ControlValueAccessor` (`NG_VALUE_ACCESSOR`).
- Real-time 4-digit space formatting (`1234 5678 9012`).
- Rejects non-numeric key presses on `keydown`.
- Eye toggle (`lucideEye` / `lucideEyeOff`) flips between masked (`XXXX XXXX 1234`) and visible modes.
- Emits raw unmasked 12 digits to the parent form group.

---

### Component 3.7: Multi-Variant Vehicle Card (`RRVehicleCardComponent`)
- Three operation modes:
  - `'homepage'`: Public view with primary photo, badges, daily rent, and "Reserve" button.
  - `'fleet'`: Staff inventory view with CDK drag handle, pricing breakdown, compliance badges, and edit/delete actions.
  - `'stats'`: Dashboard operations card showing live status, current renter name, and quick return/modify actions.

---

## 4. Active Rentals ⟷ Advance Bookings Bridge
The operational link between **Active Rentals** (`RRBookingListComponent`) and **Advance Bookings** (`RRAdvanceBookingListComponent`) must adhere to these 5 points:

1. **Shared Conflict Engine**: Both lists scan each other in real time to prevent any double-booking.
2. **"Book Now" Handover Pipeline**: Clicking "Book Now" on an advance reservation opens `RRNewBookingDialogComponent` with **100% pre-filled data** (KYC, guarantor, dates, vehicle, and advance payment credited toward `amountPaid`).
3. **Customer Delay Intimation Bridge**: Intimations logged in Active Bookings via `submitCustomerIntimation` communicate delay notices to avoid inappropriate `nonIntimationFine` charges.
4. **Customer Directory Sync**: Both lists sync with `RRCustomerApiService` for autocomplete, membership tier discounts, and booking history updates.
5. **Vehicle State Machine**: `Available` ➔ `Reserved` ➔ `Booked (In-Use)` ➔ `Available`.
6. **Shared Invoicing & Audit Logging**: Both operations generate official PDF receipts and immutable audit logs.

---

## 5. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **RR Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new vehicle filter, new export action, new sub-metric card, or new modal that does not alter existing workflows.
- 🟡 **Behavioral Modification**: Changing booking status transition rules, modifying customer data fields, altering dashboard navigation tabs, or updating vehicle calculation logic.
- 🔴 **Breaking Change**: Removing dashboard tabs, changing route URLs, altering auth requirements on public routes, or deleting activity log triggers.

### Step 2: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in RR Module
- **Question**: "The prompt alters existing RR functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing RR functionality to match the new requirement"
