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
    path: 'movies',
    loadComponent: () =>
      import('./modules/movie-importer/movie-importer.component').then(
        (m) => m.MovieImporterComponent,
      ),
    data: {
      seo: {
        title: 'Movie JSON Importer | Telugu Movie Translations',
        description:
          'Upload and manage Telugu movies with English translations dataset.',
        robots: 'noindex, nofollow',
      },
    },
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
    data: {
      seo: {
        title:
          'Aditya Kumar T | Product Group Lead Frontend & Senior Web Developer',
        description:
          'Portfolio of Aditya Kumar T - Product Group Lead Frontend with 8+ years of experience specializing in Angular, React, TypeScript, UI Architecture, and high-performance web applications.',
        keywords: [
          'Aditya Kumar T',
          'Product Group Lead Frontend',
          'Senior Web Developer',
          'Angular Developer',
          'React Developer',
          'TypeScript',
          'UI Architecture',
          'Design Systems',
          'Hyderabad',
        ],
        robots: 'index, follow',
        ogType: 'profile',
      },
    },
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
