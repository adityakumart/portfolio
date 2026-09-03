import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/hel/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMessageSquare, lucideZap, lucideFolderArchive } from '@ng-icons/lucide';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmButton,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucideMessageSquare, lucideZap, lucideFolderArchive }),
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  currentUser = computed(() => this.authService.currentUser());
}
