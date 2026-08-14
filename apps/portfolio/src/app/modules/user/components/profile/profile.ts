import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth';
import { ProfileAiChatComponent } from './profile-ai-chat.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ProfileAiChatComponent,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  currentUser = computed(() => this.authService.currentUser());

  // Format first name and last name
  fullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user['first_name'] || ''} ${user['last_name'] || ''}`.trim() || 'User';
  });

  // Initials for avatar
  initials = computed(() => {
    const user = this.currentUser();
    if (!user) return '?';
    const first = (user['first_name'] || '').charAt(0).toUpperCase();
    const last = (user['last_name'] || '').charAt(0).toUpperCase();
    return `${first}${last}` || user.email?.charAt(0).toUpperCase() || '?';
  });

  async onLogout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/user/login']);
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if API logout fails, route them to login since session is cleared
      this.router.navigate(['/user/login']);
    }
  }
}
