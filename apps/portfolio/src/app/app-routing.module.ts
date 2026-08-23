import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const AppRoutes: Routes = [
  {
    path: 'calculator',
    loadComponent: () =>
      import('./modules/calculator/calculator.component').then(
        (comp) => comp.CalculatorComponent,
      ),
  },
  {
    path: 'dev-tools',
    loadChildren: () =>
      import('./modules/dev-tools/dev-tools-routing.module').then(
        (m) => m.DevToolsRoutingModule,
      ),
  },
  {
    path: 'formbuilder',
    loadChildren: () =>
      import('./modules/formbuilder/formbuilder.module').then(
        (comp) => comp.FormbuilderModule,
      ),
  },

  {
    path: 'user',
    loadChildren: () =>
      import('./modules/user/user-routing.module').then(
        (m) => m.UserRoutingModule,
      ),
  },
  {
    path: 'rr',
    loadChildren: () =>
      import('./modules/rr/rr.module').then(
        (m) => m.RRModule,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./modules/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
