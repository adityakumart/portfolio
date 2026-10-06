import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RRHomepageComponent } from './components/homepage/homepage.component';
import { RRLoginComponent } from './components/login/rr-login.component';
import { RRDashboardComponent } from './components/dashboard/dashboard.component';

// Child components
import { RRStatsViewComponent } from './components/dashboard/components/stats-view/stats-view.component';
import { RRBookingListComponent } from './components/dashboard/components/booking-list/booking-list.component';
import { RRAdvanceBookingListComponent } from './components/dashboard/components/advance-booking-list/advance-booking-list.component';
import { RRVehicleListComponent } from './components/dashboard/components/vehicle-list/vehicle-list.component';
import { RREmployeeListComponent } from './components/dashboard/components/employee-list/employee-list.component';
import { RRHistoryComponent } from './components/dashboard/components/history/history.component';
import { RRActivityLogsComponent } from './components/dashboard/components/activity-logs/activity-logs.component';
import { RRCustomerListComponent } from './components/dashboard/components/customer-list/customer-list.component';

export const RR_ROUTES: Routes = [
  {
    path: '',
    component: RRHomepageComponent,
    data: {
      seo: {
        title: 'Royal Rentals | Luxury & Fleet Car Rental Platform',
        description:
          'Explore premium car rentals, fleet management, and seamless vehicle bookings with instant reservation support.',
        keywords: [
          'Royal Rentals',
          'Car Rental',
          'Luxury Car Hire',
          'Vehicle Fleet',
          'Automobile Rental',
        ],
        robots: 'index, follow',
        ogType: 'website',
      },
    },
  },
  {
    path: 'home',
    component: RRHomepageComponent,
    data: {
      seo: {
        title: 'Royal Rentals | Luxury & Fleet Car Rental Platform',
        description:
          'Explore premium car rentals, fleet management, and seamless vehicle bookings with instant reservation support.',
        keywords: [
          'Royal Rentals',
          'Car Rental',
          'Luxury Car Hire',
          'Vehicle Fleet',
          'Automobile Rental',
        ],
        robots: 'index, follow',
        ogType: 'website',
      },
    },
  },
  {
    path: 'login',
    component: RRLoginComponent,
    data: {
      seo: {
        title: 'Royal Rentals Portal Login | Fleet Management',
        description:
          'Sign in to access your Royal Rentals account, manage vehicle bookings, and review rental agreements.',
        keywords: ['Rental Login', 'Royal Rentals Sign In', 'Fleet Portal'],
        robots: 'index, follow',
        ogType: 'website',
      },
    },
  },
  {
    path: '',
    component: RRDashboardComponent,
    children: [
      {
        path: 'dashboard',
        component: RRStatsViewComponent,
        data: {
          seo: {
            title: 'Fleet Dashboard | Royal Rentals',
            description: 'Fleet analytics and booking metrics.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'booking/list',
        component: RRBookingListComponent,
        data: {
          seo: {
            title: 'Bookings Management | Royal Rentals',
            description: 'Manage current and upcoming rental reservations.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'booking/advance',
        component: RRAdvanceBookingListComponent,
        data: {
          seo: {
            title: 'Advance Bookings Desk | Royal Rentals',
            description: 'Manage advance vehicle reservations and deposits.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'vehicle/list',
        component: RRVehicleListComponent,
        data: {
          seo: {
            title: 'Vehicle Fleet Management | Royal Rentals',
            description:
              'Manage vehicle inventory, maintenance status, and pricing.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'customer/list',
        component: RRCustomerListComponent,
        data: {
          seo: {
            title: 'Customer Directory | Royal Rentals',
            description: 'Manage registered rental customers and loyalty tiers.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'employee/list',
        component: RREmployeeListComponent,
        data: {
          seo: {
            title: 'Staff Management | Royal Rentals',
            description: 'Employee roles and rental agent directory.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'history',
        component: RRHistoryComponent,
        data: {
          seo: {
            title: 'Rental History & Invoices | Royal Rentals',
            description:
              'Completed rentals, transaction history, and invoice records.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'activity-logs',
        component: RRActivityLogsComponent,
        data: {
          seo: {
            title: 'System Activity Logs | Royal Rentals',
            description: 'Audit log of rental system operations.',
            robots: 'noindex, nofollow',
          },
        },
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(RR_ROUTES)],
  exports: [RouterModule]
})
export class RRRoutingModule { }
