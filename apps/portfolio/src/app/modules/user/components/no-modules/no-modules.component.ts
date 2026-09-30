import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmSpinnerImports } from '@spartan-ng/hel/spinner';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideRefreshCw,
  lucideLogOut,
  lucideHome,
  lucideSparkles,
} from '@ng-icons/lucide';
import { AuthService } from '../../services/auth';
import { resolveUserDestination } from '../../services/user-modules.config';

@Component({
  selector: 'app-no-modules',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmCardImports,
    HlmButtonImports,
    HlmSpinnerImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideRefreshCw,
      lucideLogOut,
      lucideHome,
      lucideSparkles,
    }),
  ],
  templateUrl: './no-modules.component.html',
  styleUrls: ['./no-modules.component.scss'],
})
export class NoModulesComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());
  isRefreshing = signal(false);

  async refreshPermissions() {
    this.isRefreshing.set(true);
    try {
      // Re-initialize session to get fresh user profile
      const sessionStr = localStorage.getItem('portfolio_auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session?.refresh_token) {
          await this.authService['refreshSession'](session.refresh_token);
        }
      }

      const updatedUser = this.authService.currentUser();
      const destination = resolveUserDestination(updatedUser);

      if (destination.mode !== 'none') {
        toast.success('Permissions updated! Redirecting...');
        await this.router.navigateByUrl(destination.targetRoute);
      } else {
        toast.info('No new modules have been assigned yet.');
      }
    } catch {
      toast.error('Unable to refresh permissions. Please try again.');
    } finally {
      this.isRefreshing.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/user/login']);
  }
}
