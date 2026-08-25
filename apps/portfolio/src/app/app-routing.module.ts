import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const AppRoutes: Routes = [
  {
    path: 'user',
    loadChildren: () =>
      import('./modules/user/user-routing.module').then(
        (m) => m.UserRoutingModule,
      ),
  },
  {
    path: 'dev-tools',
    redirectTo: 'user/dev-tools',
    pathMatch: 'prefix',
  },
  {
    path: 'formbuilder',
    redirectTo: 'user/formbuilder',
    pathMatch: 'prefix',
  },
  {
    path: 'rr',
    redirectTo: 'user/rr',
    pathMatch: 'prefix',
  },
  {
    path: 'portfolio',
    redirectTo: '',
    pathMatch: 'prefix',
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
