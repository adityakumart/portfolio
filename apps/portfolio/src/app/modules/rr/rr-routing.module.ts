import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RRHomepageComponent } from './components/homepage/homepage.component';
import { RRLoginComponent } from './components/login/rr-login.component';
import { RRDashboardComponent } from './components/dashboard/dashboard.component';

// Child components
import { RRStatsViewComponent } from './components/dashboard/components/stats-view/stats-view.component';
import { RRBookingListComponent } from './components/dashboard/components/booking-list/booking-list.component';
import { RRVehicleListComponent } from './components/dashboard/components/vehicle-list/vehicle-list.component';
import { RREmployeeListComponent } from './components/dashboard/components/employee-list/employee-list.component';
import { RRHistoryComponent } from './components/dashboard/components/history/history.component';
import { RRActivityLogsComponent } from './components/dashboard/components/activity-logs/activity-logs.component';

const routes: Routes = [
  { path: '', component: RRHomepageComponent },
  { path: 'home', component: RRHomepageComponent },
  { path: 'login', component: RRLoginComponent },
  {
    path: '',
    component: RRDashboardComponent,
    children: [
      { path: 'dashboard', component: RRStatsViewComponent },
      { path: 'booking/list', component: RRBookingListComponent },
      { path: 'vehicle/list', component: RRVehicleListComponent },
      { path: 'employee/list', component: RREmployeeListComponent },
      { path: 'history', component: RRHistoryComponent },
      { path: 'activity-logs', component: RRActivityLogsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RRRoutingModule { }
