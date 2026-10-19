# Implementation Plan: RR Homepage Scrolling Message & Announcements Section

## 1. Overview & Objectives

This feature introduces a dynamic announcement and communication system into the RoadReady (`RR`) module. It enables administrators to communicate directly with public visitors on the homepage through:
1. **Customizable Marquee / Scrolling Message (Ticker)**:
   - A high-visibility, smoothly animated marquee bar placed on the RR homepage.
   - Fully customizable by Administrators (ticker text, badge label, scrolling speed, link/CTA, and active visibility toggle).
2. **Dedicated Homepage Section for Intimations, Offers & Festival Wishes**:
   - A curated, responsive showcase section on the homepage highlighting:
     - **Special Offers & Deals**: Seasonal discounts, promo codes, weekend rates, and bulk booking offers.
     - **Intimations & Fleet Advisories**: Travel advisories, seasonal maintenance notices, office timing updates, and emergency roadside instructions.
     - **Festival Wishes & Greetings**: Festive greetings (Diwali, Dussehra, Sankranti, New Year, etc.) with celebratory themes and holiday rental packages.
   - Interactive category filtering pills (`All`, `Special Offers`, `Fleet Intimations`, `Festival Wishes`).
   - Actionable CTAs (Direct Call, WhatsApp Inquiry, Copy Promo Code).
3. **Admin Management Console (`/user/rr/announcements`)**:
   - A dedicated tab in the RR Admin Dashboard for admins to configure the live scrolling ticker and manage the announcements collection (CRUD, toggle visibility, schedule validity dates, set priority).

---

## 2. Git Information

- **Suggested Branch Name**: `feat/rr-homepage-scrolling-ticker-and-announcements`
- **Commit Message**:
  ```text
  feat(rr): add customizable homepage scrolling ticker and notices section for offers intimations and festival wishes

  - Implement customizable marquee scrolling announcement ticker on RR homepage
  - Create dedicated homepage section for offers, intimations, and festival wishes
  - Add interactive category filtering (All, Offers, Intimations, Festival Wishes)
  - Create Admin management dashboard tab for announcements & ticker configuration
  - Add backend CRUD APIs for ticker configuration and announcement cards
  - Seed initial festival wishes, promotions, and fleet advisories with MongoDB persistence
  ```

---

## 3. Data Models & Architecture

### 3.1 Shared Types (`libs/shared-types/src/lib/rr.ts`)

```typescript
export type RRAnnouncementCategory = 'offer' | 'intimation' | 'festival';

export interface IRRScrollingTicker {
  message: string;
  badgeText: string;
  isActive: boolean;
  speed: 'slow' | 'normal' | 'fast';
  linkText?: string;
  linkUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IRRAnnouncementItem {
  _id?: string;
  title: string;
  description: string;
  category: RRAnnouncementCategory;
  tag?: string; // e.g. "Diwali Special", "Fleet Advisory", "Weekend 15% OFF"
  promoCode?: string;
  discountText?: string; // e.g. "Flat 15% OFF"
  validFrom?: string;
  validUntil?: string;
  ctaText?: string;
  ctaAction?: 'call' | 'whatsapp' | 'link' | 'none';
  ctaLink?: string;
  icon?: string; // Lucide icon identifier
  priority: number; // Sort order (higher displays first)
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface IRRHomepageAnnouncementsData {
  ticker: IRRScrollingTicker;
  items: IRRAnnouncementItem[];
}
```

### 3.2 Database Schema (`MongoDB`)
- Collection name: `rr_announcements`
  - Stores announcement cards (`IRRAnnouncementItem`).
- Collection name: `rr_settings` (or a singleton document in `rr_announcements` with `type: 'ticker_config'`):
  - Stores the ticker configuration (`IRRScrollingTicker`).

---

## 4. UI/UX Design & Homepage Layout

### 4.1 Scrolling Marquee Ticker
- **Placement**: Directly below the main navigation header, above the hero section.
- **Aesthetics**:
  - Sleek glassmorphic bar (`bg-card/80 backdrop-blur-md border-y border-border/60`).
  - Pulsing notification badge (e.g. `LATEST UPDATE` in cyan / gold badge).
  - Smooth infinite linear marquee CSS animation with pause-on-hover.
  - Action link / "Read More" button that anchors to the `#announcements` section or opens WhatsApp.
  - Respects user accessibility preferences (`prefers-reduced-motion`).
  - Hides seamlessly when Admin toggles `isActive: false` or when no message is set.

### 4.2 Dedicated Section: "Offers, Intimations & Celebrations"
- **Placement**: On the RR Homepage (`apps/portfolio/src/app/modules/rr/components/homepage/homepage.component.html`), between Hero and Services (or between Services and Browse Fleet).
- **Header**:
  - Badge: `ANNOUNCEMENTS & UPDATES`
  - Headline: `Exclusive Offers & Fleet Intimations`
  - Subtitle: `Stay updated with festive packages, seasonal savings, and important rental advisories.`
- **Interactive Category Filter Tabs**:
  - `All Updates`
  - `Offers & Deals` (Amber/Emerald badge with discount callouts)
  - `Fleet Intimations` (Sky/Indigo badge for advisories)
  - `Festival Wishes` (Gold/Rose gradient badge with celebratory greetings)
- **Card Design Elements**:
  - Category-specific iconography and gradient accents.
  - Validity banner (`Valid till: Oct 31, 2026` or `Active Advisory`).
  - Promo code snippet with 1-click copy button (for offers).
  - Direct Action buttons: "Reserve with Offer", "Inquire via WhatsApp", or "Call Desk".

---

## 5. Admin Management Console (`/user/rr/announcements`)

### 5.1 Navigation & Permissions
- Accessible under `Section: Administrative (Admin Only)` in RR Dashboard sidebar.
- Route: `/user/rr/announcements`
- Protected by `isAdmin()` check (returns 403 / redirects non-admins).

### 5.2 Admin Console Views
1. **Scrolling Ticker Configuration Card**:
   - Live preview box displaying exactly how the ticker animates.
   - Text inputs for Message, Badge Text, Speed Selector (`Slow`, `Normal`, `Fast`), Link URL/Text.
   - Master toggle: `Enable / Disable Scrolling Marquee`.
   - `Save Ticker Settings` button with instant feedback toast.
2. **Notices & Offers Management Table/Grid**:
   - Filter bar: Filter by Category (`All`, `Offer`, `Intimation`, `Festival`) and Status (`All`, `Active`, `Inactive`).
   - "New Announcement" button opening a clean modal dialog:
     - Fields: Title, Category (dropdown), Tag/Badge, Description, Promo Code, Validity Dates, CTA Type & Link, Priority, Active toggle.
   - Action controls for each card:
     - Toggle Active/Inactive inline switch.
     - Edit modal with pre-populated values.
     - Delete with confirmation dialog.

---

## 6. Backend API Specifications (`portfolio-core`)

### 6.1 Public Endpoints (`rr-public.routes.ts`)
- `GET /api/rr/public/announcements`
  - **Auth**: None (Public visitor).
  - **Response**: `{ ticker: IRRScrollingTicker, items: IRRAnnouncementItem[] }`
  - **Logic**: Returns only non-deleted, active items (`isActive: true`), sorted by `priority` descending, then `createdAt` descending.

### 6.2 Admin Endpoints (`rr.routes.ts`)
- `GET /api/rr/announcements`
  - **Auth**: Required (`authenticateRRToken`, `requireAdmin`).
  - **Response**: `{ ticker: IRRScrollingTicker, items: IRRAnnouncementItem[] }`
- `PUT /api/rr/announcements/ticker`
  - **Auth**: Required (`requireAdmin`).
  - **Body**: `IRRScrollingTicker`.
  - **Audit Log**: Logs activity `UPDATE_TICKER_SETTINGS`.
- `POST /api/rr/announcements`
  - **Auth**: Required (`requireAdmin`).
  - **Body**: `Omit<IRRAnnouncementItem, '_id'>`.
  - **Audit Log**: Logs activity `CREATE_ANNOUNCEMENT`.
- `PUT /api/rr/announcements/:id`
  - **Auth**: Required (`requireAdmin`).
  - **Body**: Partial updates.
  - **Audit Log**: Logs activity `UPDATE_ANNOUNCEMENT`.
- `PATCH /api/rr/announcements/:id/toggle`
  - **Auth**: Required (`requireAdmin`).
  - **Body**: `{ isActive: boolean }`.
  - **Audit Log**: Logs activity `TOGGLE_ANNOUNCEMENT_STATUS`.
- `DELETE /api/rr/announcements/:id`
  - **Auth**: Required (`requireAdmin`).
  - **Audit Log**: Logs activity `DELETE_ANNOUNCEMENT`.

### 6.3 Seed Data
On server boot (`RRService.seedInitialData()`):
- Seed default ticker:
  `"🎉 Festive Season Offer: Enjoy up to 15% off on all 7-seater SUV rentals! Flat discounts on advance weekend bookings. Call our 24/7 desk at +91 9494873336."`
- Seed sample initial cards:
  1. **Festival Wish**: `Diwali & Festive Blessings` - Warm greetings with festive holiday rental packages.
  2. **Offer**: `Weekend SUV Getaway Special` - 15% discount on Innova & Ertiga with promo code `ROYALWEEKEND`.
  3. **Intimation**: `Monsoon & Highway Travel Advisory` - All fleet vehicles equipped with all-weather tyres, rain wipers, and 24/7 roadside assistance support.

---

## 7. Implementation Checklist

- [ ] **Step 1: Define Shared Types**
  - Add `RRAnnouncementCategory`, `IRRScrollingTicker`, `IRRAnnouncementItem`, `IRRHomepageAnnouncementsData` to `libs/shared-types/src/lib/rr.ts`.
- [ ] **Step 2: Backend DB Collections & Seeding**
  - Add `getAnnouncementsCol()` and `getSettingsCol()` in `apps/portfolio-core/src/app/rr/rr.service.ts`.
  - Seed default ticker and announcement cards in `seedInitialData()`.
- [ ] **Step 3: Public & Admin Endpoints**
  - Add `GET /vehicles` companion route `GET /announcements` in `apps/portfolio-core/src/app/rr/rr-public.routes.ts`.
  - Add admin CRUD routes in `apps/portfolio-core/src/app/rr/rr.routes.ts` with admin auth and audit logs.
- [ ] **Step 4: Frontend Services**
  - Add public fetch in `apps/portfolio/src/app/modules/rr/services/rr-public-api.service.ts`.
  - Add admin CRUD methods in `apps/portfolio/src/app/modules/rr/services/rr-api.service.ts`.
- [ ] **Step 5: Admin Management Component**
  - Create `RRAnnouncementsComponent` (`apps/portfolio/src/app/modules/rr/components/dashboard/components/announcements/`).
  - Add route in `rr-routing.module.ts`.
  - Add navigation item in `dashboard.component.html` (Admin section).
- [ ] **Step 6: Public Homepage Integration**
  - Add animated scrolling ticker bar below header in `homepage.component.html`.
  - Add dedicated `Offers, Intimations & Festival Wishes` section with category filter pills and responsive cards in `homepage.component.html`.
  - Add signal-based state and category switching logic in `homepage.component.ts`.
  - Implement smooth marquee styling and card hover animations in `homepage.component.scss`.
- [ ] **Step 7: Validation & Testing**
  - Verify live updates from Admin Console reflect immediately on the public homepage.
  - Test responsiveness across mobile, tablet, and desktop breakpoints.
  - Verify linting, build, and automated tests.
