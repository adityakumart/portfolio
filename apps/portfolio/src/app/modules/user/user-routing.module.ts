import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes, CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { User, UserModules } from '@portfolio/shared-types';
import { UserComponent } from './user';
import { LoginComponent } from './components/login/login';
import { ProfileComponent } from './components/profile/profile';
import { ProfileAiChatComponent } from './components/profile/profile-ai-chat.component';
import { AiChatComponent } from './components/ai-chat/ai-chat.component';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { AuthService } from './services/auth';
import { resolveUserDestination } from './services/user-modules.config';

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

export const userHubGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const resolve = (user: User | null | undefined) => {
    if (!user) return router.createUrlTree(['/user', 'login']);
    const destination = resolveUserDestination(user);
    if (destination.mode === 'single') {
      return router.createUrlTree([destination.targetRoute]);
    }
    if (destination.mode === 'none') {
      return router.createUrlTree(['/user', 'no-modules']);
    }
    return true;
  };

  const user = authService.currentUser();
  if (user !== undefined) {
    return resolve(user);
  }

  return toObservable(authService.currentUser).pipe(
    filter((u) => u !== undefined),
    take(1),
    map((u) => resolve(u)),
  );
};

export const noModulesGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const resolve = (user: User | null | undefined) => {
    if (!user) return router.createUrlTree(['/user', 'login']);
    const destination = resolveUserDestination(user);
    if (destination.mode !== 'none') {
      return router.createUrlTree([destination.targetRoute]);
    }
    return true;
  };

  const user = authService.currentUser();
  if (user !== undefined) {
    return resolve(user);
  }

  return toObservable(authService.currentUser).pipe(
    filter((u) => u !== undefined),
    take(1),
    map((u) => resolve(u)),
  );
};

export const createModuleGuard = (
  moduleKey: keyof UserModules,
): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const checkAccess = (user: User | null | undefined) => {
      if (!user) return router.createUrlTree(['/user', 'login']);
      if (user.modules && user.modules[moduleKey] === true) {
        return true;
      }
      const destination = resolveUserDestination(user);
      return router.createUrlTree(
        destination.mode === 'multiple'
          ? ['/user']
          : [destination.targetRoute],
      );
    };

    const user = authService.currentUser();
    if (user !== undefined) {
      return checkAccess(user);
    }

    return toObservable(authService.currentUser).pipe(
      filter((u) => u !== undefined),
      take(1),
      map((u) => checkAccess(u)),
    );
  };
};

const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          seo: {
            title: 'Sign In | Aditya Kumar T Platform',
            description:
              'Sign in to access your platform dashboard, personalized developer tools, and workspace.',
            keywords: ['Sign In', 'Login', 'Aditya Kumar T'],
            robots: 'index, follow',
            ogType: 'website',
          },
        },
      },
      {
        path: 'no-modules',
        loadComponent: () =>
          import(
            './components/no-modules/no-modules.component'
          ).then((m) => m.NoModulesComponent),
        canActivate: [authGuard, noModulesGuard],
        data: {
          seo: {
            title: 'Platform Modules | Aditya Kumar T',
            description: 'Module management and activation.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: '',
        component: ProfileComponent,
        pathMatch: 'full',
        canActivate: [authGuard, userHubGuard],
        data: {
          seo: {
            title: 'User Profile & Workspace | Aditya Kumar T',
            description:
              'Personalized user profile, module overview, and workspace shortcuts.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'ai',
        component: ProfileAiChatComponent,
        canActivate: [authGuard, createModuleGuard('aiAssistant')],
        data: {
          seo: {
            title: 'AI Portfolio Assistant | Aditya Kumar T',
            description:
              "Interactive AI Assistant trained on Aditya Kumar T's portfolio and technical experience.",
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'chat',
        component: AiChatComponent,
        canActivate: [authGuard, createModuleGuard('aiSpace')],
        data: {
          seo: {
            title: 'AI Workspace Chat | Aditya Kumar T',
            description:
              'Interactive AI Chat workspace for productivity and coding tasks.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'files',
        component: FileManagerComponent,
        canActivate: [authGuard, createModuleGuard('fileManager')],
        data: {
          seo: {
            title: 'Cloud File Manager | Aditya Kumar T Platform',
            description:
              'Secure personal cloud storage, file explorer, and media manager.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'diet-hydration',
        loadComponent: () =>
          import(
            './components/diet-hydration/diet-hydration.component'
          ).then((m) => m.DietHydrationComponent),
        canActivate: [authGuard, createModuleGuard('dietHydration')],
        data: {
          seo: {
            title: 'Diet & Hydration Tracker | Health & Wellness',
            description:
              'Track daily calorie intake, macronutrients, and hydration goals.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'planner',
        loadComponent: () =>
          import('./components/planner/planner.component').then(
            (m) => m.PlannerComponent,
          ),
        canActivate: [authGuard, createModuleGuard('planner')],
        data: {
          seo: {
            title: 'Task Planner & Kanban Board | Productivity Suite',
            description:
              'Organize tasks, manage reminders, and track sprint goals with interactive Kanban boards and markdown notes.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'movies',
        loadComponent: () =>
          import(
            '../movie-importer/movie-importer.component'
          ).then((m) => m.MovieImporterComponent),
        data: {
          seo: {
            title: 'Movie JSON Importer | Aditya Kumar T Platform',
            description:
              'Upload and manage Telugu movies with English translations dataset.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'game',
        loadComponent: () =>
          import('./components/game/game.component').then(
            (m) => m.GameComponent,
          ),
        data: {
          seo: {
            title: 'Telugu Movie Guesser Arena | Aditya Kumar T Platform',
            description:
              'Time-based multiplayer game guessing Telugu movies from English translations with text-to-speech audio clues.',
            robots: 'noindex, nofollow',
          },
        },
      },
      {
        path: 'dev-tools',
        loadChildren: () =>
          import('../dev-tools/dev-tools-routing.module').then(
            (m) => m.DevToolsRoutingModule,
          ),
      },
      {
        path: 'formbuilder',
        loadChildren: () =>
          import('../formbuilder/formbuilder.module').then(
            (comp) => comp.FormbuilderModule,
          ),
      },
      {
        path: 'rr',
        loadChildren: () =>
          import('../rr/rr.module').then((m) => m.RRModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}

