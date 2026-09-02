import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHistory, lucideHome, lucideLogOut } from '@ng-icons/lucide';
import { AuthService } from '../../../modules/user/services/auth';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-profile-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIconComponent,
    InitialsPipe,
  ],
  providers: [
    provideIcons({ lucideHistory, lucideHome, lucideLogOut }),
  ],
  templateUrl: './profile-menu.component.html',
  styleUrl: './profile-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileMenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  currentUser = computed(() => this.authService.currentUser());
  isOpen = signal(false);

  fullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  });

  toggleDropdown() {
    this.isOpen.update((v) => !v);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKeydown() {
    this.closeDropdown();
  }

  async onLogout() {
    this.closeDropdown();
    try {
      await this.authService.logout();
      this.router.navigate(['/user/login']);
    } catch (err) {
      console.error('Logout failed:', err);
      this.router.navigate(['/user/login']);
    }
  }
}
