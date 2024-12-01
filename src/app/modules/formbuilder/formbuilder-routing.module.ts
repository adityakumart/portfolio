import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'create',
    loadComponent: () => import('./create/create.component').then(comp => comp.CreateComponent)
  },
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormbuilderRoutingModule { }
