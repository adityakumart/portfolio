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
    path: 'formbuilder',
    loadChildren: () =>
      import('./modules/formbuilder/formbuilder.module').then(
        (comp) => comp.FormbuilderModule,
      ),
  },
  {
    path: 'json-to-typescript',
    loadComponent: () =>
      import('./modules/json-to-typescript/json-to-typescript.component').then(
        (comp) => comp.JsonToTypeScriptComponent,
      ),
  },
  {
    path: 'user',
    loadChildren: () => import('./modules/user/user-routing.module').then(m => m.UserRoutingModule)
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
export class AppRoutingModule { }
