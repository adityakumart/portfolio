import { Page } from '@playwright/test';
import {
  IRRUser,
  IVehicle,
  IBooking,
  IEmployee,
  IRRDashboardStats,
  IPublicVehicle,
  ILogsResponse,
  IVehicleAutocompleteItem,
  IRegularCustomerMasked,
} from '@portfolio/shared-types';

export const MOCK_ADMIN_USER: IRRUser = {
  id: 'RRA001',
  firstName: 'Admin',
  lastName: 'Operator',
  email: 'admin@rams-cars.com',
  role: 'admin',
};

export const MOCK_EMPLOYEE_USER: IRRUser = {
  id: 'RRA002',
  firstName: 'Desk',
  lastName: 'Agent',
  email: 'agent@rams-cars.com',
  role: 'employee',
};

export const MOCK_PUBLIC_VEHICLES: IPublicVehicle[] = [
  {
    _id: 'veh-pub-1',
    name: 'Swift Dzire',
    manufacturer: 'Maruti Suzuki',
    model: '2023-04',
    seating: '5',
    type: 'Sedan',
    color: 'Pearl White',
    fuelType: 'Petrol',
    status: 'available',
    allowBooking: true,
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'],
  },
  {
    _id: 'veh-pub-2',
    name: 'Innova Crysta',
    manufacturer: 'Toyota',
    model: '2024-01',
    seating: '7',
    type: 'SUV',
    color: 'Silver Metallic',
    fuelType: 'Diesel',
    status: 'available',
    allowBooking: true,
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=80'],
  },
  {
    _id: 'veh-pub-3',
    name: 'Baleno',
    manufacturer: 'Maruti Suzuki',
    model: '2023-08',
    seating: '5',
    type: 'Hatchback',
    color: 'Nexa Blue',
    fuelType: 'Petrol',
    status: 'available',
    allowBooking: true,
    images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&auto=format&fit=crop&q=80'],
  },
  {
    _id: 'veh-pub-4',
    name: 'Fortuner',
    manufacturer: 'Toyota',
    model: '2024-03',
    seating: '7',
    type: 'SUV',
    color: 'Super White',
    fuelType: 'Diesel',
    status: 'available',
    allowBooking: true,
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'],
  },
];

export const MOCK_ADMIN_VEHICLES: IVehicle[] = [
  {
    _id: 'veh-1',
    regNo: 'AP-05-AA-1234',
    name: 'Swift Dzire',
    manufacturer: 'Maruti Suzuki',
    model: '2023-04',
    seating: '5',
    odometer: '35400',
    type: 'Sedan',
    color: 'Pearl White',
    fuelType: 'Petrol',
    engineNo: 'ENG-12345',
    chassisNo: 'CHS-98765',
    insuranceExpiry: '2026-12-31',
    pollutionExpiry: '2026-11-30',
    status: 'available',
    allowBooking: true,
    extraKmPrice: '12',
    extraHourPrice: '150',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'],
    pricing: {
      h23: { price: '2500', km: '300' },
      h11: { price: '1600', km: '150' },
      h3: { price: '900', km: '60' },
      h1: { price: '400', km: '20' },
    },
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: 'veh-2',
    regNo: 'AP-05-BB-5678',
    name: 'Innova Crysta',
    manufacturer: 'Toyota',
    model: '2024-01',
    seating: '7',
    odometer: '18200',
    type: 'SUV',
    color: 'Silver Metallic',
    fuelType: 'Diesel',
    engineNo: 'ENG-54321',
    chassisNo: 'CHS-67890',
    insuranceExpiry: '2027-01-15',
    pollutionExpiry: '2026-12-15',
    status: 'available',
    allowBooking: true,
    extraKmPrice: '16',
    extraHourPrice: '200',
    images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&auto=format&fit=crop&q=80'],
    pricing: {
      h23: { price: '4500', km: '300' },
      h11: { price: '3000', km: '150' },
      h3: { price: '1600', km: '60' },
      h1: { price: '700', km: '20' },
    },
    createdAt: '2024-02-12T10:00:00.000Z',
  },
  {
    _id: 'veh-3',
    regNo: 'AP-05-CC-9012',
    name: 'Scorpio N',
    manufacturer: 'Mahindra',
    model: '2023-11',
    seating: '7',
    odometer: '28600',
    type: 'SUV',
    color: 'Deep Forest',
    fuelType: 'Diesel',
    engineNo: 'ENG-99887',
    chassisNo: 'CHS-11223',
    insuranceExpiry: '2026-10-20',
    pollutionExpiry: '2026-09-10',
    status: 'maintenance',
    allowBooking: false,
    extraKmPrice: '15',
    extraHourPrice: '180',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'],
    pricing: {
      h23: { price: '4200', km: '300' },
      h11: { price: '2800', km: '150' },
      h3: { price: '1500', km: '60' },
      h1: { price: '650', km: '20' },
    },
    createdAt: '2024-03-01T10:00:00.000Z',
  },
  {
    _id: 'veh-4',
    regNo: 'AP-05-DD-3456',
    name: 'Honda City',
    manufacturer: 'Honda',
    model: '2022-09',
    seating: '5',
    odometer: '45100',
    type: 'Sedan',
    color: 'Golden Brown',
    fuelType: 'Petrol',
    engineNo: 'ENG-66778',
    chassisNo: 'CHS-33445',
    insuranceExpiry: '2026-08-14',
    pollutionExpiry: '2026-08-10',
    status: 'contract',
    allowBooking: false,
    extraKmPrice: '13',
    extraHourPrice: '160',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'],
    pricing: {
      h23: { price: '2800', km: '300' },
      h11: { price: '1900', km: '150' },
      h3: { price: '1000', km: '60' },
      h1: { price: '450', km: '20' },
    },
    createdAt: '2024-03-15T10:00:00.000Z',
  },
];

export const MOCK_BOOKINGS: IBooking[] = [
  {
    _id: 'book-1',
    id: 'RRB101',
    vehicleRegNo: 'AP-05-AA-1234',
    vehicleName: 'Swift Dzire',
    vehicleManufacturer: 'Maruti Suzuki',
    vehicleModel: '2023-04',
    vehicleOdometerStart: '35000',
    extraKmPrice: '12',
    extraHourPrice: '150',

    renterFirstName: 'Suresh',
    renterSecondName: 'Varma',
    renterFatherName: 'Raju Varma',
    renterAadhar: '234567890123',
    renterDL: 'AP0520210001234',
    renterPhone: '9876543210',
    renterAddress: 'Main Road, Kakinada',

    guarFirstName: 'Ramesh',
    guarSecondName: 'Kumar',
    guarFatherName: 'Somaraju',
    guarAadhar: '987654321098',
    guarPhone: '9876543211',
    guarAddress: 'Bhanugudi, Kakinada',

    travelFrom: 'Kakinada',
    travelTo: 'Visakhapatnam',
    travelPurpose: 'Family Vacation',
    pickupDateTime: '2026-10-01T08:00:00.000Z',
    returnDateTime: '2026-10-03T20:00:00.000Z',
    durationDays: '2',
    durationHours: '12',
    totalKmLimit: '600',

    depositType: 'cash',
    cashAmount: '5000',

    totalRentalAmount: '6000',
    discount: '500',
    discountType: 'rupee',
    finalRentalAmount: '5500',
    amountPaid: '3000',
    pendingAmount: '2500',
    paymentMode: 'UPI',
    amountByUser: '3000',

    status: 'active',
    bookedBy: 'RRA002',
    bookedByName: 'Desk Agent',
    bookedByRole: 'employee',
    createdAt: '2026-10-01T07:30:00.000Z',
  },
  {
    _id: 'book-2',
    id: 'RRB102',
    vehicleRegNo: 'AP-05-BB-5678',
    vehicleName: 'Innova Crysta',
    vehicleManufacturer: 'Toyota',
    vehicleModel: '2024-01',
    vehicleOdometerStart: '18000',
    extraKmPrice: '16',
    extraHourPrice: '200',

    renterFirstName: 'Venkat',
    renterSecondName: 'Rao',
    renterFatherName: 'Narayana',
    renterAadhar: '554433221100',
    renterDL: 'AP0520200005678',
    renterPhone: '9440123456',
    renterAddress: 'Sarpavaram, Kakinada',

    guarFirstName: 'Prakash',
    guarSecondName: 'Reddy',
    guarFatherName: 'Satyam',
    guarPhone: '9440654321',
    guarAddress: 'Cinema Road, Kakinada',

    travelFrom: 'Kakinada',
    travelTo: 'Vijayawada',
    travelPurpose: 'Business Travel',
    pickupDateTime: '2026-10-01T06:00:00.000Z',
    returnDateTime: '2026-10-02T22:00:00.000Z',
    durationDays: '1',
    durationHours: '16',
    totalKmLimit: '450',

    depositType: 'bike',
    bikeRegNo: 'AP-05-BK-9999',
    bikeManufacturer: 'Hero',
    bikeModel: 'Splendor Plus',
    bikeOwner: 'Venkat Rao',

    totalRentalAmount: '7500',
    discount: '0',
    discountType: 'percentage',
    finalRentalAmount: '7500',
    amountPaid: '7500',
    pendingAmount: '0',
    paymentMode: 'Cash',
    amountByUser: '7500',

    status: 'active',
    bookedBy: 'RRA001',
    bookedByName: 'Admin Operator',
    bookedByRole: 'admin',
    createdAt: '2026-10-01T05:45:00.000Z',
  },
];

export const MOCK_STATS: IRRDashboardStats = {
  totalFleet: 4,
  available: 2,
  contract: 1,
  activeBookings: 2,
  maintenance: 1,
  pendingPayments: 1,
};

export const MOCK_EMPLOYEES: IEmployee[] = [
  {
    _id: 'emp-1',
    id: 'RRA001',
    firstName: 'Admin',
    lastName: 'Operator',
    dob: '1988-06-20',
    phone: '9494873336',
    email: 'admin@rams-cars.com',
    aadhar: '112233445566',
    dl: 'DL-ADMIN-001',
    address: 'HQ Office, Kakinada',
    allowLogin: true,
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    _id: 'emp-2',
    id: 'RRA002',
    firstName: 'Desk',
    lastName: 'Agent',
    dob: '1990-05-15',
    phone: '9494893336',
    email: 'agent@rams-cars.com',
    aadhar: '998877665544',
    dl: 'DL-AGENT-002',
    address: 'Rental Desk 1, Kakinada',
    allowLogin: true,
    role: 'employee',
    createdAt: '2023-02-15T00:00:00.000Z',
  },
];

export const MOCK_LOGS: ILogsResponse = {
  total: 4,
  page: 1,
  limit: 10,
  totalPages: 1,
  logs: [
    {
      _id: 'log-1',
      action: 'started booking',
      performedBy: 'Desk Agent (RRA002)',
      role: 'employee',
      user: 'Desk Agent (RRA002)',
      time: '2026-10-01T07:30:00.000Z',
      timestamp: '2026-10-01T07:30:00.000Z',
      details: 'Started rental booking for Swift Dzire (AP-05-AA-1234)',
    },
    {
      _id: 'log-2',
      action: 'logged in',
      performedBy: 'Desk Agent (RRA002)',
      role: 'employee',
      user: 'Desk Agent (RRA002)',
      time: '2026-10-01T07:00:00.000Z',
      timestamp: '2026-10-01T07:00:00.000Z',
      details: 'Employee logged in to rental desk',
    },
    {
      _id: 'log-3',
      action: 'logged in',
      performedBy: 'Admin Operator (RRA001)',
      role: 'admin',
      user: 'Admin Operator (RRA001)',
      time: '2026-10-01T05:30:00.000Z',
      timestamp: '2026-10-01T05:30:00.000Z',
      details: 'Administrator logged in to command desk',
    },
    {
      _id: 'log-4',
      action: 'started booking',
      performedBy: 'Admin Operator (RRA001)',
      role: 'admin',
      user: 'Admin Operator (RRA001)',
      time: '2026-10-01T05:45:00.000Z',
      timestamp: '2026-10-01T05:45:00.000Z',
      details: 'Created rental booking for Innova Crysta (AP-05-BB-5678)',
    },
  ],
};

export const MOCK_REGULAR_CUSTOMERS: IRegularCustomerMasked[] = [
  {
    _id: 'cust-1',
    membershipId: 'RR-MEM-001',
    firstName: 'Suresh',
    lastName: 'Varma',
    fatherName: 'Raju Varma',
    phone: '9876543210',
    email: 'suresh.varma@example.com',
    aadhar: 'XXXX-XXXX-0123',
    dl: 'XXXXXXXXXXXX-1234',
    address: 'Main Road, Kakinada',
    membershipTier: 'gold',
    discountRate: 15,
    totalBookings: 8,
    isActive: true,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2027-01-01T00:00:00.000Z',
    createdAt: '2025-01-01T10:00:00.000Z',
  },
];

/**
 * Injects authenticated RR session into the browser page context before navigation.
 */
export async function injectRRSession(
  page: Page,
  options?: {
    user?: IRRUser;
    token?: string;
    isLocked?: boolean;
    appUserSession?: boolean;
  }
) {
  const user = options?.user || MOCK_EMPLOYEE_USER;
  const token = options?.token || 'mock-rr-jwt-token-xyz';
  const isLocked = !!options?.isLocked;

  // Primary user hub session (enables seamless /user/rr routing)
  const appSession = {
    access_token: 'mock-app-token',
    user: {
      id: 'mock-user-id',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: 'user',
      modules: {
        rr: true,
        aiSpace: true,
        aiAssistant: true,
        fileManager: true,
        dietHydration: true,
        devTools: true,
        formBuilder: true,
      },
    },
  };

  await page.addInitScript(
    ({ u, t, locked, appSess, injectApp }) => {
      if (injectApp) {
        localStorage.setItem('portfolio_auth_session', JSON.stringify(appSess));
      }
      sessionStorage.setItem('rr_user', JSON.stringify(u));
      sessionStorage.setItem('rr_token', t);
      sessionStorage.setItem('loggedInUser', JSON.stringify({ role: u.role, id: u.id }));
      localStorage.setItem('rr_user', JSON.stringify(u));
      localStorage.setItem('rr_token', t);
      localStorage.setItem('loggedInUser', JSON.stringify({ role: u.role, id: u.id }));

      if (locked) {
        localStorage.setItem('rr_session_is_locked', 'true');
      } else {
        localStorage.removeItem('rr_session_is_locked');
      }
      localStorage.setItem('rr_session_last_active', String(Date.now()));
    },
    {
      u: user,
      t: token,
      locked: isLocked,
      appSess: appSession,
      injectApp: options?.appUserSession !== false,
    }
  );
}

/**
 * Clears all RR and User session data from storage.
 */
export async function clearRRSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.removeItem('rr_user');
    sessionStorage.removeItem('rr_token');
    sessionStorage.removeItem('loggedInUser');
    localStorage.removeItem('rr_user');
    localStorage.removeItem('rr_token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('rr_session_is_locked');
    localStorage.removeItem('portfolio_auth_session');
  });
}

/**
 * Intercepts all backend HTTP requests targeting the RR APIs
 * and responds immediately with mock data.
 */
export async function setupRRRouteMocks(
  page: Page,
  customData?: {
    vehicles?: IVehicle[];
    publicVehicles?: IPublicVehicle[];
    bookings?: IBooking[];
    stats?: IRRDashboardStats;
    employees?: IEmployee[];
    logs?: ILogsResponse;
    customers?: IRegularCustomerMasked[];
  }
) {
  const publicVehicles = customData?.publicVehicles || MOCK_PUBLIC_VEHICLES;
  const adminVehicles = customData?.vehicles || MOCK_ADMIN_VEHICLES;
  const bookings = customData?.bookings || MOCK_BOOKINGS;
  const stats = customData?.stats || MOCK_STATS;
  const employees = customData?.employees || MOCK_EMPLOYEES;
  const logs = customData?.logs || MOCK_LOGS;
  const customers = customData?.customers || MOCK_REGULAR_CUSTOMERS;

  // Public vehicles endpoint
  await page.route('**/api/rr/public/vehicles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(publicVehicles),
    });
  });

  // Autocomplete endpoint
  await page.route('**/api/rr/bookings/vehicles/autocomplete*', async (route) => {
    const list: IVehicleAutocompleteItem[] = adminVehicles.map((v) => ({
      regNo: v.regNo,
      name: v.name,
      manufacturer: v.manufacturer,
      type: v.type,
    }));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(list),
    });
  });

  // Vehicle single availability
  await page.route('**/api/rr/vehicles/*/availability*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ available: true, message: 'Vehicle is ready for dispatch.' }),
    });
  });

  // Vehicles endpoints (GET, POST, PUT, DELETE)
  await page.route('**/api/rr/vehicles*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(adminVehicles),
      });
    } else if (method === 'POST') {
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ ...data, _id: 'new-veh-id' }),
      });
    } else if (method === 'PUT') {
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...data }),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Vehicle deleted successfully.' }),
      });
    } else {
      await route.continue();
    }
  });

  // Bookings endpoints
  await page.route('**/api/rr/bookings*', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(bookings),
      });
    } else if (method === 'POST') {
      const url = route.request().url();
      if (url.includes('/customer-intimation')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Customer intimation logged.',
            intimation: { id: 'int-1', intimationType: 'delay', notes: 'Running late' },
            booking: bookings[0],
          }),
        });
      } else {
        const data = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ ...data, _id: 'new-booking-id', id: 'RRB999' }),
        });
      }
    } else if (method === 'PUT') {
      const data = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...data }),
      });
    } else {
      await route.continue();
    }
  });

  // Dashboard Stats
  await page.route('**/api/rr/dashboard/stats*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(stats),
    });
  });

  // Employees
  await page.route('**/api/rr/employees*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(employees),
    });
  });

  // Logs
  await page.route('**/api/rr/logs*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(logs),
    });
  });

  // Regular Customers
  await page.route('**/api/rr/customers*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(customers),
    });
  });

  // Auth Login endpoint
  await page.route('**/api/rr/auth/login*', async (route) => {
    const postData = route.request().postDataJSON() || {};
    let resolvedUser: IRRUser = MOCK_EMPLOYEE_USER;
    if (postData.username || postData.adminUsername || postData.role === 'admin') {
      resolvedUser = MOCK_ADMIN_USER;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-jwt-token-login-flow',
        user: resolvedUser,
      }),
    });
  });

  // Auth Logout endpoint
  await page.route('**/api/rr/auth/logout*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Logged out successfully.' }),
    });
  });
}
