import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHistory, lucideHome, lucideLogOut, lucideUser } from '@ng-icons/lucide';
import { AuthService } from '../../../modules/user/services/auth';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmDropdownMenuImports,
    HlmButtonImports,
    NgIconComponent,
    InitialsPipe,
  ],
  providers: [
    provideIcons({ lucideHistory, lucideHome, lucideLogOut, lucideUser }),
  ],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());

  fullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  });

  async onLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/user/login']);
    } catch (err) {
      console.error('Logout failed:', err);
      this.router.navigate(['/user/login']);
    }
  }
}
