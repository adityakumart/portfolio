import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./create/create.component').then((comp) => comp.CreateComponent),
    data: {
      seo: {
        title: 'Dynamic Form Builder & Schema Exporter | Angular Dev Suite',
        description:
          'Interactive drag-and-drop reactive form builder with live JSON schema export, dynamic validation rules, and Angular preview.',
        keywords: [
          'Form Builder',
          'Angular Reactive Forms',
          'JSON Schema Generator',
          'Drag and Drop Form Builder',
          'Angular Dev Tools',
        ],
        robots: 'index, follow',
        ogType: 'website',
        applicationCategory: 'DeveloperApplication',
      },
    },
  },
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormbuilderRoutingModule {}
