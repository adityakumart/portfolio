import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RRApiService } from '../../services/rr-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCar,
  lucideChevronDown,
  lucideUser,
  lucideHistory,
  lucideLogOut,
  lucideShieldAlert,
  lucideLayoutDashboard,
  lucideCalendarDays,
  lucideBadgeCheck,
  lucideX,
} from '@ng-icons/lucide';
import { HlmDialogService } from '@spartan-ng/hel-luma/dialog';
import { HlmButtonImports } from '@spartan-ng/hel-luma/button';
import { HlmInputImports } from '@spartan-ng/hel-luma/input';

@Component({
  selector: 'app-rr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    HlmButtonImports,
    HlmInputImports,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucideChevronDown,
      lucideUser,
      lucideHistory,
      lucideLogOut,
      lucideShieldAlert,
      lucideLayoutDashboard,
      lucideCalendarDays,
      lucideBadgeCheck,
      lucideX,
    }),
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class RRDashboardComponent implements OnInit {
  rrApi = inject(RRApiService);
  private router = inject(Router);
  private dialog = inject(HlmDialogService);
  private activeDialogRef: any = null;

  @ViewChild('profileInfoDialog') profileInfoDialog!: TemplateRef<any>;

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'RR';
    const f = user.firstName ? user.firstName.substring(0, 1) : '';
    const l = user.lastName ? user.lastName.substring(0, 1) : '';
    return (f + l).toUpperCase() || 'RR';
  }

  // Shell UI State
  profileDropdownOpen = signal<boolean>(false);

  ngOnInit() {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/user/rr/login']);
    }
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen.set(!this.profileDropdownOpen());
  }

  showProfilePopup() {
    this.profileDropdownOpen.set(false);
    this.activeDialogRef = this.dialog.open(this.profileInfoDialog, {
      contentClass: 'max-w-md w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  closeProfilePopup() {
    this.activeDialogRef?.close();
    this.dialog.closeAll();
  }

  logout() {
    this.closeProfilePopup();
    this.rrApi.logout();
  }
}
