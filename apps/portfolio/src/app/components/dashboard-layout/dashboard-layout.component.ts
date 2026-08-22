import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ThemeService } from '../../theme.service';

export interface DashboardMenuItem {
  label: string;
  icon: string; // Material icon name
  link?: string | any[];
  exact?: boolean;
  badge?: {
    value: string | number;
    type: 'primary' | 'success' | 'warn' | 'info';
  };
  children?: DashboardMenuItem[];
  roles?: string[]; // Roles authorized to see this item
}

export interface UserProfileInfo {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {
  themeService = inject(ThemeService);

  // Component Inputs
  @Input() sidebarTitle: string = 'Corporate Admin';
  @Input() sidebarLogo: string = ''; // SVG or image URL
  @Input() userProfile: UserProfileInfo | null = null;
  @Input() menuItems: DashboardMenuItem[] = [];

  // Component Outputs
  @Output() logout = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<DashboardMenuItem>();

  // Structural View States (Angular Signals)
  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  isProfileOpen = signal<boolean>(false);
  isNotificationsOpen = signal<boolean>(false);

  // Computed Properties
  isDarkMode = computed(() => this.themeService.theme() === 'dark');

  // Filtered Menu Items based on user role
  filteredMenuItems = computed(() => {
    const role = this.userProfile?.role?.toLowerCase();
    if (!role) return this.menuItems;

    return this.menuItems.filter(item => {
      if (!item.roles) return true;
      return item.roles.map(r => r.toLowerCase()).includes(role);
    });
  });

  // Track active submenus by mapping label to collapsed boolean state
  private expandedMenus = signal<Record<string, boolean>>({});

  toggleSidebar(): void {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.set(!this.isMobileSidebarOpen());
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  toggleProfileDropdown(): void {
    this.isProfileOpen.set(!this.isProfileOpen());
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.set(!this.isNotificationsOpen());
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  isSubmenuExpanded(label: string): boolean {
    return !!this.expandedMenus()[label];
  }

  toggleSubmenu(label: string, event: Event): void {
    event.stopPropagation();
    this.expandedMenus.update(state => ({
      ...state,
      [label]: !state[label]
    }));
  }

  onMenuItemClicked(item: DashboardMenuItem): void {
    this.menuItemClick.emit(item);
    // On mobile, click close the sidebar
    this.isMobileSidebarOpen.set(false);
  }

  onLogout(): void {
    this.logout.emit();
    this.isProfileOpen.set(false);
  }

  // Close dropdowns on clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Close profile dropdown if clicked outside
    if (!target.closest('.user-profile-menu') && this.isProfileOpen()) {
      this.isProfileOpen.set(false);
    }

    // Close notifications panel if clicked outside
    if (!target.closest('.notifications-menu') && this.isNotificationsOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }
}
