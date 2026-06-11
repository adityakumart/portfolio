import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user';

// Firebase core and auth providers
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { LoginComponent } from './components/login/login';
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AuthService } from './services/auth';
import { environment } from '../../../environments/environment';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['user', 'login']);

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: UserComponent,
    // Block access if the user is unauthenticated
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    AuthService
  ]
})
export class UserRoutingModule { }

