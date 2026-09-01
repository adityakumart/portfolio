import { ObjectId } from 'mongodb';

export type RRRole = 'admin' | 'employee';

export interface IRRUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RRRole;
}

export interface IRRLoginRequest {
  username?: string;
  password?: string;
  empId?: string;
  dob?: string;
}

export interface IRRLoginResponse {
  access_token: string;
  user: IRRUser;
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
  passwordHash?: string; // Only for admin
  createdAt: string;
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
  createdAt: string;
  updatedAt?: string | null;
}

export type BookingStatus = 'active' | 'completed' | 'cancelled';
export type DepositType = 'bike' | 'cash' | 'other' | 'none' | string;
export type DiscountType = 'percentage' | 'rupee' | string;

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

export interface IRRDashboardStats {
  totalFleet: number;
  maintenance: number;
  activeBookings: number;
  pendingPayments: number;
}

export interface IRRVehicleAvailability {
  regNo: string;
  isAvailable: boolean;
  status: VehicleStatus;
}
