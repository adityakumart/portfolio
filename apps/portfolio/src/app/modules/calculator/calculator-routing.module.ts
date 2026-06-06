import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const CalculatorRoutes: Routes = [
  {
    path: 'basic',
    loadComponent: () =>
      import('./basic-calculator/basic-calculator.component').then(
        (comp) => comp.BasicCalculatorComponent,
      ),
  },
  {
    path: 'experience',
    loadComponent: () =>
      import('./experience/experience.component').then(
        (comp) => comp.ExperienceComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./basic-calculator/basic-calculator.component').then(
        (comp) => comp.BasicCalculatorComponent,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(CalculatorRoutes)],
  exports: [RouterModule],
})
export class CalculatorRoutingModule {}
