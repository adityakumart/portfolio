import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes
} from '@angular/router';

export const AppRoutes: Routes = [{
  path: 'percentage-calculator',
  loadComponent: () => import('./modules/calculator/calculator.component').then(comp => comp.CalculatorComponent)
}, {
  path: 'experience-calculator',
  loadComponent: () => import('./modules/experience/experience.component').then(comp => comp.ExperienceComponent)
}, {
  path: 'time-zone-converter',
  loadComponent: () => import('./modules/timezone-converter/timezone-converter.component').then(comp => comp.TimezoneConverterComponent)
}, {
  path: 'formbuilder',
  loadChildren: () => import('./modules/formbuilder/formbuilder.module').then(comp => comp.FormbuilderModule)
}, {
  path: '',
  loadComponent: () => import('./modules/portfolio/portfolio.component').then(m => m.PortfolioComponent)
}];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
