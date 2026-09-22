export type CustomerMembershipTier = 'regular' | 'silver' | 'gold' | 'platinum';

export interface IRegularCustomer {
  _id?: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  altPhone?: string;
  email: string;
  aadhar: string; // Encrypted in DB / Plain 12-digits upon creation
  aadharBlindIndex?: string;
  dl: string; // Encrypted in DB / Plain 15-16 alphanumeric chars upon creation
  dlBlindIndex?: string;
  address: string;
  membershipTier: CustomerMembershipTier;
  discountRate: number; // Percentage, e.g. 10 for 10%
  totalBookings: number;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IRegularCustomerMasked {
  _id?: string;
  membershipId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  altPhone?: string;
  email: string;
  aadhar: string; // Masked representation: e.g. 'XXXX-XXXX-1234'
  dl: string; // Masked representation: e.g. 'XXXXXXXXXXXX-5678'
  address: string;
  membershipTier: CustomerMembershipTier;
  discountRate: number;
  totalBookings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ICreateCustomerDTO {
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  altPhone?: string;
  email: string;
  aadhar: string;
  dl: string;
  address: string;
  membershipTier?: CustomerMembershipTier;
  discountRate?: number;
}

export interface IUpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  phone?: string;
  altPhone?: string;
  email?: string;
  aadhar?: string;
  dl?: string;
  address?: string;
  membershipTier?: CustomerMembershipTier;
  discountRate?: number;
  isActive?: boolean;
}

export interface ICustomerMembershipDiscount {
  isRegularCustomer: boolean;
  customerId?: string;
  membershipId?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  membershipTier?: CustomerMembershipTier;
  discountRate: number; // Percentage e.g. 10
  discountAmount: number; // Computed discount value in INR
  originalAmount: number; // Base rental amount
  finalRentalAmount: number; // Base minus discount
  message?: string;
}

export interface ICustomerListResponse {
  customers: IRegularCustomerMasked[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICustomerAutocompleteItem {
  _id: string;
  membershipId: string;
  name: string;
}

