import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../../modules/user/services/auth';
import { ThemeService } from '../../../theme.service';
import { devToolsRoutingList } from '../../data/routes';
import { RRApiService } from '../../../modules/rr/services/rr-api.service';

export interface SidebarItem {
  label: string;
  link?: string;
  icon?: string;
  children?: SidebarItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private rrApiService = inject(RRApiService);

  // Active hover tracking signals for fly-out panel visibility control
  activeLevel0Item = signal<SidebarItem | null>(null);
  activeLevel1Item = signal<SidebarItem | null>(null);

  // User and Theme state
  currentUser = computed(() => this.authService.currentUser());
  isDarkMode = computed(() => this.themeService.darkMode());

  // Track the current URL using toSignal
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  // Menu items list mapping the whole app
  menuItems = computed<SidebarItem[]>(() => {
    const user = this.currentUser();
    const rrUser = this.rrApiService.currentUser();

    const items: SidebarItem[] = [
      { label: 'Portfolio', icon: 'bolt', link: '/' },
      {
        label: 'Dev Tools',
        icon: 'code',
        children: devToolsRoutingList.map((group) => ({
          label: group.header,
          icon: this.getDevToolIcon(group.header),
          children: group.tools.map((tool) => ({
            label: tool.name,
            link: tool.link,
            icon: 'chevron_right',
          })),
        })),
      },
    ];

    if (user) {
      items.push({
        label: 'User',
        icon: 'account_circle',
        children: [
          { label: 'Profile', link: '/user', icon: 'person' },
          { label: 'AI Assistant', link: '/user/ai', icon: 'chat' },
          { label: 'File Manager', link: '/user/files', icon: 'folder_shared' },
        ],
      });
    } else if (rrUser) {
      items.push({
        label: 'Car Rentals',
        icon: 'directions_car',
        children: [
          { label: 'Homepage', link: '/user/rr/home', icon: 'home' },
          {
            label: 'Dashboard Summary',
            link: '/user/rr/dashboard',
            icon: 'analytics',
          },
          {
            label: 'Active Rentals',
            link: '/user/rr/booking/list',
            icon: 'assignment',
          },
          {
            label: 'Vehicles List',
            link: '/user/rr/vehicle/list',
            icon: 'directions_car',
          },
          {
            label: 'Employee List',
            link: '/user/rr/employee/list',
            icon: 'people',
          },
          { label: 'History Logs', link: '/user/rr/history', icon: 'history' },
        ],
      });
    } else {
      items.push({
        label: 'User Login',
        link: '/user/login',
        icon: 'account_circle',
      });
      items.push({
        label: 'Car Rental Login',
        link: '/user/rr/login',
        icon: 'directions_car',
      });
    }

    return items;
  });

  // Mappings helper for dev tool category icons
  private getDevToolIcon(header: string): string {
    switch (header) {
      case 'Calculator':
        return 'calculate';
      case 'Formatters':
        return 'format_align_left';
      case 'Encode/Decode':
        return 'vpn_key';
      case 'Converters':
        return 'swap_horiz';
      case 'Generator':
        return 'build';
      default:
        return 'code';
    }
  }

  // Check if item is active based on url
  isItemActive(item: SidebarItem): boolean {
    const url = this.currentUrl().split('?')[0];

    if (item.link) {
      return url === item.link;
    }

    if (item.children) {
      const checkChildren = (children: SidebarItem[]): boolean => {
        return children.some((child) => {
          if (child.link) {
            return url === child.link;
          }
          if (child.children) {
            return checkChildren(child.children);
          }
          return false;
        });
      };
      return checkChildren(item.children);
    }

    return false;
  }

  // Handle clicking items
  onItemClick(item: SidebarItem): void {
    if (item.link) {
      this.router.navigateByUrl(item.link);
      // Close all submenus immediately on click
      this.activeLevel0Item.set(null);
      this.activeLevel1Item.set(null);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Computed values for active user profile display
  userName = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Guest Account';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  });

  userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return 'Visitor';
    return user.admin ? 'ADMIN' : 'USER';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return 'GS';
    const first = (user.first_name || '').charAt(0).toUpperCase();
    const last = (user.last_name || '').charAt(0).toUpperCase();
    return first + last || 'US';
  });

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/user/login']);
    } catch (err) {
      console.error('Sidebar logout error:', err);
      this.router.navigate(['/user/login']);
    }
  }
}
