import { Component, OnInit, inject, signal, computed, effect, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RRApiService } from '../../services/rr-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCar,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronUp,
  lucideUser,
  lucideHistory,
  lucideLogOut,
  lucideShieldAlert,
  lucideShieldCheck,
  lucideLayoutDashboard,
  lucideCalendarDays,
  lucideBadgeCheck,
  lucideX,
  lucideActivity,
  lucideMenu,
  lucideCrown,
  lucideCalendarClock,
  lucideLock,
  lucideKeyRound,
  lucideEye,
  lucideEyeOff,
  lucideAlertTriangle,
  lucideCheck,
  lucideMegaphone,
  lucidePalette,
} from '@ng-icons/lucide';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { HlmAvatarImports } from '@spartan-ng/hel/avatar';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { toast } from '@spartan-ng/hel/sonner';
import { RRInactivityService } from '../../services/rr-inactivity.service';
import { RRLockScreenComponent } from '../lock-screen/rr-lock-screen.component';

@Component({
  selector: 'app-rr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIconComponent,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmDropdownMenuImports,
    HlmAvatarImports,
    HlmTooltipImports,
    RRLockScreenComponent,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronUp,
      lucideUser,
      lucideHistory,
      lucideLogOut,
      lucideShieldAlert,
      lucideShieldCheck,
      lucideLayoutDashboard,
      lucideCalendarDays,
      lucideBadgeCheck,
      lucideX,
      lucideActivity,
      lucideMenu,
      lucideCrown,
      lucideCalendarClock,
      lucideLock,
      lucideKeyRound,
      lucideEye,
      lucideEyeOff,
      lucideAlertTriangle,
      lucideCheck,
      lucideMegaphone,
      lucidePalette,
    }),
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class RRDashboardComponent implements OnInit {
  rrApi = inject(RRApiService);
  inactivityService = inject(RRInactivityService);
  private router = inject(Router);
  private dialog = inject(HlmDialogService);
  private activeDialogRef: any = null;
  private policyDialogRef: any = null;

  @ViewChild('profileInfoDialog') profileInfoDialog!: TemplateRef<any>;
  @ViewChild('passwordPolicyDialog') passwordPolicyDialog!: TemplateRef<any>;

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  policyState = computed(() => this.rrApi.passwordPolicyState());

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return 'RR';
    const f = user.firstName ? user.firstName.substring(0, 1) : '';
    const l = user.lastName ? user.lastName.substring(0, 1) : '';
    return (f + l).toUpperCase() || 'RR';
  }

  // Shell UI State
  profileDropdownOpen = signal<boolean>(false);
  isSidebarCollapsed = signal<boolean>(true);
  mobileSidebarOpen = signal<boolean>(false);

  // Profile password form state
  showProfileChangePassword = signal<boolean>(false);
  changePasswordSubmitting = signal<boolean>(false);
  showCurrentPass = signal<boolean>(false);
  showNewPass = signal<boolean>(false);

  profilePasswordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  // Password policy dialog form state
  showPolicyCurrentPass = signal<boolean>(false);
  showPolicyNewPass = signal<boolean>(false);

  policyForm = new FormGroup({
    currentPassword: new FormControl(''),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  constructor() {
    // Monitor password policy and trigger prompt on login or policy expiration
    effect(() => {
      const policy = this.policyState();
      if (policy && (policy.mustChangePassword || policy.isExpired || policy.isBufferPeriod)) {
        setTimeout(() => {
          if (!this.policyDialogRef && this.passwordPolicyDialog) {
            const isMandatory = policy.mustChangePassword || policy.isExpired;
            this.policyDialogRef = this.dialog.open(this.passwordPolicyDialog, {
              contentClass: 'max-w-md w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
            });
          }
        }, 400);
      }
    });
  }

  ngOnInit() {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/user/rr/login']);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('rr_sidebar_collapsed');
      if (saved !== null) {
        this.isSidebarCollapsed.set(saved === 'true');
      } else {
        this.isSidebarCollapsed.set(true);
      }
    }
  }

  toggleSidebar() {
    const next = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(next);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('rr_sidebar_collapsed', String(next));
    }
  }

  toggleMobileSidebar() {
    this.mobileSidebarOpen.update((v) => !v);
  }

  closeMobileSidebar() {
    this.mobileSidebarOpen.set(false);
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen.set(!this.profileDropdownOpen());
  }

  showProfilePopup() {
    this.profileDropdownOpen.set(false);
    this.showProfileChangePassword.set(false);
    this.profilePasswordForm.reset();
    this.activeDialogRef = this.dialog.open(this.profileInfoDialog, {
      contentClass: 'max-w-md w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  closeProfilePopup() {
    this.activeDialogRef?.close();
    this.dialog.closeAll();
  }

  toggleProfileChangePassword() {
    this.showProfileChangePassword.set(!this.showProfileChangePassword());
    this.profilePasswordForm.reset();
  }

  async changePasswordFromProfile(e: Event) {
    e.preventDefault();
    if (this.profilePasswordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.profilePasswordForm.value;
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    this.changePasswordSubmitting.set(true);
    try {
      await this.rrApi.changePassword({
        currentPassword: currentPassword || '',
        newPassword: newPassword || '',
      });
      toast.success('Your password has been changed successfully.');
      this.showProfileChangePassword.set(false);
      this.profilePasswordForm.reset();
      this.rrApi.passwordPolicyState.set(null);
    } catch (err: any) {
      toast.error(err.error?.message || err.message || 'Failed to update password.');
    } finally {
      this.changePasswordSubmitting.set(false);
    }
  }

  async submitPolicyPasswordChange(e: Event) {
    e.preventDefault();
    if (this.policyForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.policyForm.value;
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    this.changePasswordSubmitting.set(true);
    try {
      await this.rrApi.changePassword({
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || '',
      });
      toast.success('Password configured successfully. Welcome!');
      this.policyDialogRef?.close();
      this.policyDialogRef = null;
      this.policyForm.reset();
      this.rrApi.passwordPolicyState.set(null);
    } catch (err: any) {
      toast.error(err.error?.message || err.message || 'Failed to set password.');
    } finally {
      this.changePasswordSubmitting.set(false);
    }
  }

  skipPolicyWarning() {
    this.policyDialogRef?.close();
    this.policyDialogRef = null;
    this.rrApi.passwordPolicyState.set(null);
  }

  logout() {
    this.closeProfilePopup();
    this.policyDialogRef?.close();
    this.policyDialogRef = null;
    this.inactivityService.clearStorageState();
    this.rrApi.logout();
  }
}
