import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { UserComponent } from './user';
import { LoginComponent } from './components/login/login';
import { AuthService } from './services/auth';
import { environment } from '../../../environments/environment';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();
  if (user !== undefined) {
    return user ? true : router.createUrlTree(['/user', 'login']);
  }

  return toObservable(authService.currentUser).pipe(
    filter((u) => u !== undefined),
    take(1),
    map((u) => (u ? true : router.createUrlTree(['/user', 'login']))),
  );
};

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      { path: 'login', component: LoginComponent },
      {
        path: '',
        pathMatch: 'full',
        // Block access if the user is unauthenticated
        canActivate: [authGuard],
        children: [],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: SupabaseClient,
      useFactory: () =>
        createClient(environment.supabase.url, environment.supabase.key),
    },
    AuthService,
  ],
})
export class UserRoutingModule {}
