# Module Checkpoint & Invariant Specification: Royal Rentals (RR) Module

**Module Path**: `apps/portfolio/src/app/modules/rr/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / SCSS)

---

## 1. Module Overview & Core Responsibilities
The **RR (Royal Rentals) Module** is a full-featured car rental operations platform. It combines a public vehicle showcase and booking inquiry system with a secured staff/admin dashboard covering fleet inventory, walk-in and advance bookings, vehicle return settlement workflows, customer membership tiers, employee assignments, and financial invoice generation.

---

## 2. Protected Routes & Navigation Architecture

| Route Path | Component / Target | Purpose / Invariant |
|---|---|---|
| `/user/rr` or `/user/rr/home` | `RRHomepageComponent` | Public showcase, vehicle catalog with seating/fuel filters, booking inquiry form |
| `/user/rr/login` | `RRLoginComponent` | Staff & admin authentication portal for RR dashboard |
| `/user/rr/dashboard` | `RRDashboardComponent` | Admin workspace shell with tab navigation & idle session protection |
| `.../dashboard/stats` | `RRStatsViewComponent` | Fleet KPI metrics, revenue cards, utilization graphs, quick action dialogs |
| `.../dashboard/bookings` | `RRBookingListComponent` | Active & pending car rental reservations, live vehicle status |
| `.../dashboard/advance-bookings`| `RRAdvanceBookingListComponent` | Forward reservation schedule & advance-to-active conversion |
| `.../dashboard/vehicles` | `RRVehicleListComponent` | Fleet inventory, drag-and-drop ordering, pricing, maintenance status |
| `.../dashboard/employees` | `RREmployeeListComponent` | Staff directory, roles (Admin/Manager/Driver), contact details |
| `.../dashboard/customers` | `RRCustomerListComponent` | Customer directory, membership tiers, masked Aadhar/DL, booking history |
| `.../dashboard/history` | `RRHistoryComponent` | Completed rentals archive, date filters, invoice export |
| `.../dashboard/activity-logs` | `RRActivityLogsComponent` | Immutable audit trail of all booking, vehicle, and payment actions |
| `.../dashboard/announcements` | `RRAnnouncementsComponent` | Public banner announcements manager (active toggles, validity dates) |
| `.../dashboard/home-content` | `RRHomeContentAdminComponent` | Dynamic CMS editor for homepage copy, featured vehicles, reviews |

---

## 3. Core Business Logic, Validations & Calculations

### A. Finalize & End Rental Booking (`RREndBookingDialogComponent`)

#### 1. Input Validations
- **Odometer End Reading**:
  - Required and numeric.
  - **Constraint**: `odometerEnd >= vehicleOdometerStart` (cannot return vehicle with lower mileage than pickup).
- **Return Date & Time**:
  - Required and valid ISO date-time.
  - **Constraint**: `returnDateTimeActual >= pickupDateTime` (cannot return vehicle before pickup).
- **Cleanliness Fee**:
  - Required selection: `'none' | '500' | '1000' | 'custom'`.
  - If `'custom'`, amount must be numeric and `>= 0`.
- **Damages Assessment**:
  - Dynamic damage items: each item must have non-empty description and valid non-negative amount.
- **Challana / Toll / Fines**:
  - Optional; if entered must be numeric and `>= 0`.

#### 2. The 5 End-Booking Scenarios & Calculations
- **Case 1: Standard / Early Return**: Returned on or before scheduled end date without exceeding KM allowance. Only base rent and standard fees apply.
- **Case 2: Late Return (Extra Hours)**:
  - `extraHours = actualReturnTime - scheduledReturnTime` (rounded up).
  - `extraHourFee = extraHours * vehicle.extraHourRate`.
- **Case 3: KM Overage**:
  - `actualDistanceDriven = odometerEnd - odometerStart`.
  - `extraKms = max(0, actualDistanceDriven - allowedKms)`.
  - `extraKmFee = extraKms * vehicle.extraKmRate`.
- **Case 4.1: Combined Late Return + Extra KMs**:
  - Applies both `extraHourFee` and `extraKmFee`.
  - **Non-Intimation Fine**: If return is overdue without intimation and exceeds both limits, an optional `nonIntimationFine` (default 1000, no cap) can be applied.
- **Case 4.2: Extension / Slab Recalculation Mode**:
  - If rental is extended into a higher day/hour slab (`recalculateSlabMode = true`):
    - Recalculates base slab rent and effective KM allowance (`slabExtraKmAllowance`).
    - Adjusts remaining extra KM fees based on new effective limits.

#### 3. Settlement & Balance Pending Formulas
- `totalAdditionalFees = cleanlinessFee + extraKmFee + extraHourFee + damagesTotal + challanaTollFinesTotal + (applyNonIntimationFine ? nonIntimationFine : 0)`
- `finalTotalPayable = finalRentAmount + totalAdditionalFees`
- `balancePending = finalTotalPayable - totalPaidAmount`
- If `balancePending > 0`: Customer owes remaining balance (paid via Cash, UPI, Card, Net Banking).
- If `balancePending < 0`: Refund owed to customer (e.g. from security deposit).
- Generates official PDF invoice via `RRInvoicePdfService`.

---

### B. New Booking Creation (`RRNewBookingDialogComponent`)

#### 1. Renter Details Validation
- **Names**: `renterFirstName`, `renterSecondName`, `renterFatherName` required; alphabet characters only (`/^[A-Za-z ]+$/`).
- **Aadhar**: Required 12 digits (`/^[0-9]{12}$/`). Masked in UI via `RRAadharInputComponent`.
- **Driving License (DL)**: Required 16 alphanumeric characters (`/^[A-Za-z0-9]{16}$/`).
- **Phone Numbers**: `renterPhone` required 10 digits (`/^[0-9]{10}$/`). `renterAltPhone` optional 10 digits.
- **Address & Email**: Address required; email must match standard email pattern.

#### 2. Guarantor Details Validation
- **Names & Phone**: `guarFirstName`, `guarSecondName`, `guarFatherName`, `guarPhone` (10 digits), and `guarAddress` required.
- **Optional Verification**: `guarAadhar` (12 digits), `guarDL` (16 alphanumeric).

#### 3. Vehicle Selection & Real-Time Schedule Conflict Engine
- Validates selected vehicle against active rentals and advance reservations.
- Conflict detection triggers if `[pickupDateTime, returnDateTime]` overlaps with:
  - An active booking
  - An advance booking
  - Scheduled maintenance or external contract
- Blocks booking confirmation unless conflict is resolved or override authorized.

#### 4. Security Deposit Types & Requirements
- `depositType` strictly one of:
  - `'none'`: No deposit item collected.
  - `'bike'`: Requires `bikeRegNo`, `bikeManufacturer`, `bikeModel`, `bikeOwner`.
  - `'cash'`: Requires positive `cashAmount`.
  - `'other'`: Requires `otherItemName` and estimated `otherItemValue`.

#### 5. Financial & Pricing Slab Calculations
- `durationDays` and `durationHours` calculated from pickup and return timestamps.
- Base rent resolved from vehicle pricing scheme (daily slab vs hourly rate).
- **Membership Discount**: Applied automatically if customer is a registered member (`ICustomerMembershipDiscount`).
- `finalRentalAmount = totalRentalAmount - discount`.
- `pendingAmount = finalRentalAmount - amountPaid`.
- Payment modes: `'Cash' | 'UPI' | 'Card' | 'Net Banking'`.

---

### C. Booking Modification & Cancellation (`RRModifyBookingDialogComponent`)

#### 1. Modification Rules
- Allows vehicle swapping, return date extension, and start odometer adjustment.
- Recalculates total duration, revised KM limit, and updated rental charges automatically.

#### 2. Cancellation & Deletion Flow
- Requires explicit cancellation reason (recorded in audit log).
- **Refund Processing**: If advance payment was made, records `returnedAmountMode`:
  - `'Original method' | 'Cash' | 'UPI Transfer' | 'Bank Transfer' | 'Used for another Booking'`.
- Immediately releases the vehicle status back to `'Available'`.

---

### D. Advance Booking System (`RRAdvanceBookingListComponent` & `ReserveBookingDialog`)
- **Public Reservation**: Inquiries from homepage capture customer contact, requested dates, and vehicle preference.
- **Conversion to Active Booking**:
  - Automatically transfers customer and schedule data into `NewBookingDialog`.
  - Deducts advance deposit from total payable rent upon handover.

---

### E. Vehicle Inventory & Fleet Rules (`RRVehicleListComponent`)
- **Status Lifecycle**: `Available` ➔ `Booked (In-Use)` ➔ `Maintenance` ➔ `Contract`.
- **Drag-and-Drop Display Order**: Uses CDK drag-drop to persist public showcase ordering.
- **Multi-Image Carousel**: Supports primary thumbnail designation and image uploads.
- **Compliance Tracking**: Insurance expiry, Fitness Certificate (FC), and PUC validity alerts.

---

### F. Customer Management & Membership Tiers (`RRCustomerListComponent`)
- **Membership Tiers**: `Standard`, `Silver`, `Gold`, `Platinum / VIP`.
- **Member Autocomplete**: Search by phone or name instantly populates KYC details in booking forms.
- **Privacy Compliance**: Aadhar and DL numbers masked in lists (`AadharVisiblePipe`).

---

### G. Dashboard KPI Metrics & Session Security
- **Stats Calculations**:
  - Fleet Utilization % = `(Active Bookings / Total Vehicles) * 100`.
  - Total Revenue = `sum(paidRent) + sum(additionalFees)`.
  - Total Outstanding Dues = `sum(pendingBalances)`.
- **Inactivity Session Lock (`RRInactivityService`)**:
  - Automatically locks staff dashboard session after prolonged inactivity to safeguard customer KYC and billing data.

---

## 4. Critical Invariants (Non-Negotiables)
1. **Public vs. Dashboard Separation**:
   - The public homepage (`/user/rr` / `/user/rr/home`) must remain accessible without requiring staff login.
   - Dashboard routes must require authenticated RR staff/admin credentials.
2. **Booking State Machine**:
   - A vehicle cannot be simultaneously marked "Available" and actively assigned to an ongoing booking without explicit status handling.
   - Modifying booking flows must preserve audit logging (`activity-logs`).
3. **Data Models & Contracts**:
   - Changes to Vehicle, Booking, or Customer models must maintain backward compatibility with existing mock/storage data.
4. **Style Integrity**:
   - Global RR styling in `rr-shared.scss` provides theme variables. Do not overwrite shared CSS variables that could distort existing dashboard views.

---

## 5. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **RR Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new vehicle filter, new export action, new sub-metric card, or new modal that does not alter existing workflows.
- 🟡 **Behavioral Modification**: Changing booking status transition rules, modifying customer data fields, altering dashboard navigation tabs, or updating vehicle calculation logic.
- 🔴 **Breaking Change**: Removing dashboard tabs, changing route URLs, altering auth requirements on public routes, or deleting activity log triggers.

### Step 2: Checkpoint Gate Table
Include in the plan:
```markdown
| Target File / Feature | Impact | Existing Behavior | Proposed Behavior | Checkpoint Result |
|---|---|---|---|---|
| ... | 🟢 / 🟡 / 🔴 | ... | ... | Proceed / Needs User Question |
```

### Step 3: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in RR Module
- **Question**: "The prompt alters existing RR functionality: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing RR functionality to match the new requirement"
