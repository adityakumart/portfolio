import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes
} from '@angular/router';
import { CalculatorComponent } from './modules/calculator/calculator.component';
import { ExperienceComponent } from './modules/experience/experience.component';

export const AppRoutes: Routes = [{
  path: 'calculator',
  component: CalculatorComponent
}, {
  path: 'experience',
  component: ExperienceComponent
}, {
  path: '',
  loadChildren: () => import('./modules/portfolio/portfolio.module').then(m => m.PortfolioModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(AppRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
