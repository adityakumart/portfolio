import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes
} from '@angular/router';
import { CalculatorComponent } from './modules/calculator/calculator.component';
import { ExperienceComponent } from './modules/experience/experience.component';

export const AppRoutes: Routes = [{
  path: 'calculator',
  loadComponent: () => import('./modules/calculator/calculator.component').then(comp => comp.CalculatorComponent)
}, {
  path: 'experience',
  loadComponent: () => import('./modules/experience/experience.component').then(comp => comp.ExperienceComponent)
},  {
  path: 'timezoneconverter',
  loadComponent: () => import('./modules//timezone-converter/timezone-converter.component').then(comp => comp.TimezoneConverterComponent)
}, {
  path: '',
  loadChildren: () => import('./modules/portfolio/portfolio.module').then(m => m.PortfolioModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
