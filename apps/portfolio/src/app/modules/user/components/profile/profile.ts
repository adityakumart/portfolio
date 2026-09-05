import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmSpinnerImports } from '@spartan-ng/hel/spinner';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMessageSquare,
  lucideZap,
  lucideFolderArchive,
  lucideArrowRight,
  lucideUser,
  lucideSparkles,
} from '@ng-icons/lucide';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
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
      lucideMessageSquare,
      lucideZap,
      lucideFolderArchive,
      lucideArrowRight,
      lucideUser,
      lucideSparkles,
    }),
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
  currentUser = computed(() => this.authService.currentUser());
}
