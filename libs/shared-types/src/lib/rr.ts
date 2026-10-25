import { ObjectId } from 'mongodb';

export type RRRole = 'admin' | 'employee';

export interface IRRUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: RRRole;
}

export interface IRRLoginRequest {
  username?: string;
  password?: string;
  empId?: string;
  dob?: string;
}

export type RRUserStatus = 'pending_activation' | 'active' | 'deactivated';

export interface IRRLoginResponse {
  access_token: string;
  user: IRRUser;
  status?: RRUserStatus;
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
  passwordAgeDays?: number;
  passwordExpiresInDays?: number;
  isBufferPeriod?: boolean;
  isExpired?: boolean;
}

export interface IRRChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface IRRPermissionsResponse {
  user: IRRUser;
  role: RRRole;
  status?: RRUserStatus;
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
  passwordAgeDays?: number;
  passwordExpiresInDays?: number;
  isBufferPeriod?: boolean;
  isExpired?: boolean;
}

export interface IEmployee {
  _id?: ObjectId | string;
  id: string; // Unique ID like 'RRA001'
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  phone: string;
  altPhone?: string;
  email: string;
  aadhar: string;
  dl: string;
  address: string;
  allowLogin: boolean;
  role: RRRole;
  status?: RRUserStatus;
  isFirstLogin?: boolean;
  mustChangePassword?: boolean;
  passwordLastChangedAt?: string | null;
  lastLoginAt?: string | null;
  password?: string; // Optional raw password passed from registration form (hidden field)
  passwordHash?: string; // Bcrypt hashed password
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  failedLoginAttempts?: number;
  lockoutUntil?: Date | string | null;
}

export interface IVehiclePricingTier {
  price: string;
  km: string;
}

export interface IVehiclePricing {
  h23: IVehiclePricingTier;
  h11: IVehiclePricingTier;
  h3: IVehiclePricingTier;
  h1: IVehiclePricingTier;
}

export type VehicleStatus = 'available' | 'in_booking' | 'maintenance' | 'rented' | string;

export interface IVehicle {
  _id?: ObjectId | string;
  regNo: string; // Unique ID (plate number)
  name: string;
  manufacturer: string;
  model: string; // YYYY-MM
  seating: string; // "5" or "7"
  odometer: string;
  type: string; // e.g. Hatchback, Sedan, SUV, Luxury
  color: string;
  fuelType: string;
  engineNo: string;
  chassisNo: string;
  insuranceExpiry: string;
  pollutionExpiry: string;
  pricing: IVehiclePricing;
  extraKmPrice: string;
  extraHourPrice: string;
  allowBooking: boolean;
  status: VehicleStatus;
  images: string[];
  bookingId?: string | null;
  availableBy?: string | null;
  nextAvailableDate?: string;
  createdAt: string;
  updatedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface IPublicVehicle {
  _id?: ObjectId | string;
  name: string;
  manufacturer: string;
  model?: string;
  seating: string;
  type: string;
  color: string;
  fuelType: string;
  images: string[];
  status?: VehicleStatus;
  allowBooking?: boolean;
}

export interface IVehicleUploadedAsset {
  key: string;
  url: string;
  originalName?: string;
}

export interface IVehicleImageUploadResponse {
  success: boolean;
  message: string;
  images: IVehicleUploadedAsset[];
  key?: string;
  url?: string;
}

export interface IVehicleAutocompleteItem {
  regNo: string;
  name: string;
  manufacturer: string;
  type?: string;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled' | 'reserved';
export type DepositType = 'bike' | 'cash' | 'other' | 'none' | string;
export type DiscountType = 'percentage' | 'rupee' | string;

export interface IDamageItem {
  id: string;
  description: string;
  amount: number;
  confirmed?: boolean;
}

export interface IBooking {
  _id?: ObjectId | string;
  id: string; // Unique booking ID e.g. 'RRB001'
  vehicleRegNo: string;
  vehicleName: string;
  vehicleManufacturer: string;
  vehicleModel: string;
  vehicleOdometerStart: string;
  vehicleOdometerEnd?: string;
  extraKmPrice: string;
  extraHourPrice: string;

  renterFirstName: string;
  renterSecondName: string;
  renterFatherName: string;
  renterAadhar: string;
  renterDL: string;
  renterPhone: string;
  renterAltPhone?: string;
  renterEmail?: string;
  renterAddress: string;

  guarFirstName: string;
  guarSecondName: string;
  guarFatherName: string;
  guarAadhar?: string;
  guarDL?: string;
  guarPhone: string;
  guarAltPhone?: string;
  guarAddress: string;

  travelFrom: string;
  travelTo: string;
  travelPurpose: string;
  pickupDateTime: string;
  returnDateTime: string;
  durationDays: string;
  durationHours: string;
  totalKmLimit: string;

  depositType: DepositType;
  bikeRegNo?: string;
  bikeManufacturer?: string;
  bikeModel?: string;
  bikeOwner?: string;
  cashAmount?: string;
  otherItemName?: string;
  otherItemValue?: string;

  totalRentalAmount: string;
  discount: string;
  discountType: DiscountType;
  finalRentalAmount: string;
  amountPaid: string;
  pendingAmount: string;
  paymentMode: string;
  amountByUser: string;

  status: BookingStatus;
  createdAt: string;
  endedAt?: string | null;
  activityLogs?: string[];

  // Staff audit tracking (who booked and who ended)
  bookedBy?: string;
  bookedByName?: string;
  bookedByRole?: string;
  endedBy?: string | null;
  endedByName?: string | null;
  endedByRole?: string | null;

  // End booking settlement fields
  returnDateTimeActual?: string;
  cleanlinessFee?: string;
  extraKmsTravelled?: string;
  extraKmFee?: string;
  extraHoursTaken?: string;
  extraHourFee?: string;
  damages?: IDamageItem[];
  damagesTotal?: string;
  challanaAmount?: string;
  tollAmount?: string;
  finesAmount?: string;
  challanaTollFinesTotal?: string;
  nonIntimationFine?: string;
  recalculateSlabMode?: boolean;
  totalAdditionalFees?: string;

  // Customer intimation audit tracking
  intimations?: ICustomerIntimation[];
  lastIntimation?: ICustomerIntimation;

  // Soft delete audit tracking
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deletedByName?: string | null;
  deletedByRole?: string | null;
  deletionReason?: string | null;
  returnAmount?: string | null;
  returnAmountMode?: 'Original method' | 'Cash' | 'UPI Transfer' | 'Bank Transfer' | 'Used for another Booking' | string | null;
}

export interface ICustomerIntimation {
  id: string;
  intimationType: 'delay' | 'extension' | 'route_change' | 'early_return' | 'emergency' | 'other' | string;
  notes: string;
  expectedReturnDateTime?: string;
  recordedBy: string;
  recordedByName?: string;
  recordedByRole?: string;
  recordedAt: string;
}

export interface ILog {
  _id?: ObjectId | string;
  action: string;
  performedBy: string; // Employee ID or 'ADMIN'
  role: string; // 'admin' or 'employee'
  user: string; // alias for performedBy
  time: string; // local ISO or locale string
  timestamp: Date | string;
  details?: string;
}

export interface ILogsResponse {
  logs: ILog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBookingsResponse {
  bookings: IBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRRDashboardStats {
  totalFleet: number;
  maintenance: number;
  activeBookings: number;
  pendingPayments: number;
  available?: number;
  contract?: number;
  reserved?: number;
}

export interface IRRVehicleAvailability {
  regNo: string;
  isAvailable: boolean;
  status: VehicleStatus;
}

export type RRAnnouncementCategory = 'offer' | 'intimation' | 'festival';

export interface IRRScrollingTicker {
  message: string;
  badgeText: string;
  isActive: boolean;
  speed?: 'slow' | 'normal' | 'fast';
  linkText?: string;
  linkUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IRRAnnouncementItem {
  _id?: ObjectId | string;
  title: string;
  description: string;
  category: RRAnnouncementCategory;
  tag?: string;
  promoCode?: string;
  discountText?: string;
  validFrom?: string;
  validUntil?: string;
  ctaText?: string;
  ctaAction?: 'call' | 'whatsapp' | 'link' | 'none';
  ctaLink?: string;
  icon?: string;
  priority?: number;
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

export interface IRRHomeBanner {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  altText?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
}

export interface IRRHomeHeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  banners: IRRHomeBanner[];
  autoRotateBanners: boolean;
  bannerIntervalSeconds: number;
}

export interface IRRHomeServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  hoverText?: string;
  isActive: boolean;
  order: number;
}

export interface IRRHomeServicesSection {
  tagline: string;
  title: string;
  description: string;
  items: IRRHomeServiceItem[];
}

export interface IRRHomeStatItem {
  id: string;
  value: string;
  label: string;
  order: number;
}

export interface IRRHomeAboutSection {
  tagline: string;
  title: string;
  paragraphs: string[];
  stats: IRRHomeStatItem[];
}

export interface IRRHomeFleetSection {
  tagline: string;
  title: string;
  description: string;
}

export interface IRRHomeContactItem {
  id: string;
  type: 'address' | 'phone' | 'email' | 'web';
  title: string;
  values: string[];
  icon: string;
  order: number;
}

export interface IRRHomeContactSection {
  tagline: string;
  title: string;
  description: string;
  items: IRRHomeContactItem[];
  primaryPhone: string;
  primaryPhoneRaw: string;
  secondaryPhone: string;
  secondaryPhoneRaw: string;
  whatsappNumberRaw: string;
}

export interface IRRHomeFooterContent {
  brandName: string;
  copyrightText: string;
}

export interface IRRHomePageContent {
  _id?: ObjectId | string;
  isCustomized: boolean;
  hero: IRRHomeHeroContent;
  services: IRRHomeServicesSection;
  fleet: IRRHomeFleetSection;
  about: IRRHomeAboutSection;
  contact: IRRHomeContactSection;
  footer: IRRHomeFooterContent;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_RR_HOMEPAGE_CONTENT: IRRHomePageContent = {
  isCustomized: false,
  hero: {
    badge: 'PREMIUM CAR RENTALS & FLEET COMMAND',
    title: 'Uncompromising Comfort for Every Journey',
    subtitle:
      "Experience seamless travels with Kakinada's premier car rental fleet. Tailored corporate solutions, local sightseeing, and self-drive luxury with zero hidden charges.",
    primaryCtaText: 'Explore Fleet',
    primaryCtaLink: '#browse',
    secondaryCtaText: 'Book Consultation',
    secondaryCtaLink: '#contact',
    autoRotateBanners: true,
    bannerIntervalSeconds: 6,
    banners: [
      {
        id: 'default-hero-1',
        imageUrl:
          'https://pub-5892202ec1784725a7afbb07173ed9c1.r2.dev/public_assets/porsche.png',
        title: 'Uncompromising Comfort for Every Journey',
        subtitle: 'Experience seamless travels with luxury performance.',
        altText: 'RoadReady Rentals Luxury Fleet',
        isActive: true,
        order: 1,
      },
    ],
  },
  services: {
    tagline: 'Capabilities',
    title: 'Our Premium Services',
    description:
      'Designed to cover all your travel requirements with absolute safety, luxury, and reliability.',
    items: [
      {
        id: 'srv-1',
        title: 'Self Drive Cars',
        description:
          'Flexible self-drive solutions with well-maintained hatchbacks, sedans, and SUVs.',
        icon: 'lucideKey',
        hoverText: 'Drive at your own pace with unlimited control.',
        isActive: true,
        order: 1,
      },
      {
        id: 'srv-2',
        title: 'Local Sight Seeing',
        description:
          'Uncover local treasures with customizable day trips and travel assistance.',
        icon: 'lucideMap',
        hoverText: 'Explore city attractions with professional guides.',
        isActive: true,
        order: 2,
      },
      {
        id: 'srv-3',
        title: 'Outstations Pickups',
        description:
          'Reliable airport drops, terminal connections, and outstation travels.',
        icon: 'lucidePlane',
        hoverText: 'Safe and convenient one-way/roundout journeys.',
        isActive: true,
        order: 3,
      },
      {
        id: 'srv-4',
        title: 'Package Tours',
        description:
          'Enjoy unified hotel pairings, route guides, and custom family tour packages.',
        icon: 'lucideGift',
        hoverText: 'Bespoke travel packages for holidays and events.',
        isActive: true,
        order: 4,
      },
      {
        id: 'srv-5',
        title: 'Corporate Transits',
        description:
          'Elevated employee transit, client commute solutions, and executive leasing.',
        icon: 'lucideBuilding',
        hoverText: 'Long-term corporate contracts and executive transit.',
        isActive: true,
        order: 5,
      },
    ],
  },
  fleet: {
    tagline: 'Our Fleet',
    title: 'Browse by Category',
    description:
      'Select from our wide selection of fully inspected, cleaned, and road-ready vehicles.',
  },
  about: {
    tagline: 'Who We Are',
    title: 'Over a Decade of Travel Excellence',
    paragraphs: [
      "RoadReady Rentals has been Suryanarayana Puram's most trusted travel facilitator for over ten years. We bridge the gap between premium passenger fleet availability and pocket-friendly consumer bookings.",
      'Our commitment remains absolute: well-maintained models, verified professional drivers, punctual pickups, and complete billing transparency. From quick commutes to outstation holidays, we make every trip an experience in comfort.',
    ],
    stats: [
      { id: 'stat-1', value: '10+', label: 'Years Experience', order: 1 },
      { id: 'stat-2', value: '50+', label: 'Fleet Vehicles', order: 2 },
      { id: 'stat-3', value: '15k+', label: 'Happy Bookings', order: 3 },
      { id: 'stat-4', value: '100%', label: 'Safe Rides', order: 4 },
    ],
  },
  contact: {
    tagline: 'Get In Touch',
    title: 'Connect With Our Desk',
    description:
      'Our booking desk is open 24/7. Reach out to schedule a custom trip or lease a vehicle.',
    primaryPhone: '+91 9494873336',
    primaryPhoneRaw: '9494873336',
    secondaryPhone: '+91 9494893336',
    secondaryPhoneRaw: '9494893336',
    whatsappNumberRaw: '9494873336',
    items: [
      {
        id: 'contact-1',
        type: 'address',
        title: 'Office Address',
        values: [
          'RoadReady Rentals Automotives',
          'Cinema road, Suryanarayana puram, Kakinada, AP 533001',
        ],
        icon: 'lucideMapPin',
        order: 1,
      },
      {
        id: 'contact-2',
        type: 'phone',
        title: 'Phone Desk',
        values: ['+91 9494873336', '+91 9494893336'],
        icon: 'lucidePhone',
        order: 2,
      },
      {
        id: 'contact-3',
        type: 'email',
        title: 'Email Enquiries',
        values: ['support@roadready.com', 'info@rams-cars.com'],
        icon: 'lucideMail',
        order: 3,
      },
      {
        id: 'contact-4',
        type: 'web',
        title: 'Web Portal',
        values: ['roadreadyrentals.com'],
        icon: 'lucideGlobe',
        order: 4,
      },
    ],
  },
  footer: {
    brandName: 'RoadReady Rentals',
    copyrightText:
      '© 2026 RoadReady Rentals — Built for Ultimate Comfort and Speed',
  },
};

export type RRFeedbackStatus =
  | 'open'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'closed';

export type RRFeedbackPage =
  | 'home'
  | 'dashboard'
  | 'booking_list'
  | 'booking_advance'
  | 'fleet_registry'
  | 'customer_registry'
  | 'staff_registry'
  | 'history'
  | 'activity_logs'
  | 'announcements'
  | 'home_content'
  | 'feedback'
  | 'other';

export type RRFeedbackIssueType =
  | 'ui'
  | 'functionality'
  | 'performance'
  | 'feature_request'
  | 'data_issue'
  | 'other';

export interface IRRFeedbackUserSnapshot {
  id: string; // Employee ID (e.g. 'RRA001')
  name: string;
  email: string;
  role: RRRole;
}

export interface IRRFeedback {
  _id?: ObjectId | string;
  id: string; // Unique ticket ID (e.g. 'RRFB-1730000000000-4821')
  user: IRRFeedbackUserSnapshot;
  page: RRFeedbackPage;
  issueType: RRFeedbackIssueType;
  description: string; // min 10, max 1000 characters
  imageUrl?: string;
  imageKey?: string;
  imageOriginalName?: string;
  status: RRFeedbackStatus;
  adminNotes?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRRCreateFeedbackPayload {
  page: RRFeedbackPage;
  issueType: RRFeedbackIssueType;
  description: string;
  imageUrl?: string;
  imageKey?: string;
  imageOriginalName?: string;
}

export interface IRRUpdateFeedbackStatusPayload {
  status: RRFeedbackStatus;
  adminNotes?: string;
}

export interface IRRFeedbackStats {
  total: number;
  open: number;
  inProgress: number;
  onHold: number;
  completed: number;
  closed: number;
}

export const RR_FEEDBACK_STATUSES: {
  value: RRFeedbackStatus;
  label: string;
  description: string;
}[] = [
  { value: 'open', label: 'Open', description: 'Pending triage' },
  { value: 'in-progress', label: 'In Progress', description: 'Under active investigation or development' },
  { value: 'on-hold', label: 'On Hold', description: 'Paused pending further information or dependency' },
  { value: 'completed', label: 'Completed', description: 'Resolved and implemented' },
  { value: 'closed', label: 'Closed', description: 'Archived, rejected, or finalized' },
];

export const RR_FEEDBACK_PAGES: { value: RRFeedbackPage; label: string; route?: string }[] = [
  { value: 'home', label: 'Home Page', route: '/user/rr/home' },
  { value: 'dashboard', label: 'Dashboard / Overview', route: '/user/rr/dashboard' },
  { value: 'booking_list', label: 'Active Rentals / Bookings', route: '/user/rr/booking/list' },
  { value: 'booking_advance', label: 'Advance Bookings', route: '/user/rr/booking/advance' },
  { value: 'fleet_registry', label: 'Fleet Registry / Vehicles Inventory', route: '/user/rr/vehicle/list' },
  { value: 'customer_registry', label: 'Regular Customers Directory', route: '/user/rr/customer/list' },
  { value: 'staff_registry', label: 'Staff Registry / Employee Directory', route: '/user/rr/employee/list' },
  { value: 'history', label: 'Rental History & Invoices', route: '/user/rr/history' },
  { value: 'activity_logs', label: 'System Activity Logs', route: '/user/rr/activity-logs' },
  { value: 'announcements', label: 'Announcements & Ticker Desk', route: '/user/rr/announcements' },
  { value: 'home_content', label: 'Homepage CMS & Banners', route: '/user/rr/home-content' },
  { value: 'feedback', label: 'Feedback Desk', route: '/user/rr/feedback' },
  { value: 'other', label: 'Other / General System Issue' },
];

export const RR_FEEDBACK_ISSUE_TYPES: {
  value: RRFeedbackIssueType;
  label: string;
  description: string;
}[] = [
  {
    value: 'ui',
    label: 'UI / Design / Visuals',
    description: 'Layout glitches, misaligned components, theme or font rendering',
  },
  {
    value: 'functionality',
    label: 'Bug / Functionality',
    description: 'Buttons not working, form submission errors, broken flows',
  },
  {
    value: 'performance',
    label: 'Performance / Loading',
    description: 'Slow page loads, unresponsive tables, delayed responses',
  },
  {
    value: 'feature_request',
    label: 'Feature Request / Enhancement',
    description: 'Suggestions for new capabilities or UX improvements',
  },
  {
    value: 'data_issue',
    label: 'Data / Pricing Inconsistency',
    description: 'Incorrect calculation, missing records, data discrepancy',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Any issue not fitting the categories above',
  },
];

