import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth';

import { User } from '@portfolio/shared-types';

/**
 * Guard that permits navigation strictly if the current user has `masterAdmin === true`.
 */
export const masterAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const checkMasterAdmin = (user: User | null | undefined) => {
    if (!user) {
      return router.createUrlTree(['/user', 'login']);
    }
    if (user.masterAdmin === true) {
      return true;
    }
    // Unauthorized access: redirect to profile/dashboard
    return router.createUrlTree(['/user']);
  };

  const user = authService.currentUser();
  if (user !== undefined) {
    return checkMasterAdmin(user);
  }

  return toObservable(authService.currentUser).pipe(
    filter((u) => u !== undefined),
    take(1),
    map((u) => checkMasterAdmin(u)),
  );
};
