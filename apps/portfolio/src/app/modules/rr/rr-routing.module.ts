import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RRHomepageComponent } from './components/homepage/homepage.component';
import { RRLoginComponent } from './components/login/rr-login.component';
import { RRDashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: RRHomepageComponent },
  { path: 'home', component: RRHomepageComponent },
  { path: 'login', component: RRLoginComponent },
  { path: 'dashboard', component: RRDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RRRoutingModule { }
