import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@portfolio/feature-rr').then((m) => m.RR_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
