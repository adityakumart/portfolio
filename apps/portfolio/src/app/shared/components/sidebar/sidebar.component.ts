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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
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
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    FormsModule,
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

  // Core state Signals
  isCollapsed = signal<boolean>(false);
  searchValue = signal<string>('');
  expandedItems = signal<Set<string>>(new Set());

  // User and Theme state
  currentUser = computed(() => this.authService.currentUser());
  isDarkMode = computed(() => this.themeService.theme() === 'dark');

  // Track the current URL using toSignal
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Menu items list mapping the whole app
  menuItems = computed<SidebarItem[]>(() => {
    const user = this.currentUser();
    const rrUser = this.rrApiService.currentUser();

    const items: SidebarItem[] = [
      { label: 'Home', icon: 'home', link: '/' },
      {
        label: 'Dev Tools',
        icon: 'code',
        children: devToolsRoutingList.map((group) => ({
          label: group.header,
          icon: this.getDevToolIcon(group.header),
          children: group.tools.map((tool) => ({
            label: tool.name,
            link: tool.link,
          })),
        })),
      },
    ];

    if (user) {
      items.push({
        label: 'User Hub',
        icon: 'account_circle',
        children: [
          { label: 'Profile', link: '/user', icon: 'person' },
          { label: 'AI Assistant', link: '/user/ai', icon: 'chat' },
          { label: 'File Manager', link: '/user/files', icon: 'folder_shared' },
        ],
      });
    } else {
      items.push({
        label: 'User Login',
        link: '/user/login',
        icon: 'login',
      });
    }

    if (rrUser) {
      items.push({
        label: 'Car Rentals',
        icon: 'directions_car',
        children: [
          { label: 'Homepage', link: '/rr/home', icon: 'home' },
          { label: 'Dashboard Summary', link: '/rr/dashboard', icon: 'analytics' },
          { label: 'Active Rentals', link: '/rr/booking/list', icon: 'assignment' },
          { label: 'Vehicles List', link: '/rr/vehicle/list', icon: 'directions_car' },
          { label: 'Employee List', link: '/rr/employee/list', icon: 'people' },
          { label: 'History Logs', link: '/rr/history', icon: 'history' },
        ],
      });
    } else {
      items.push({
        label: 'Car Rental Login',
        link: '/rr/login',
        icon: 'login',
      });
    }

    return items;
  });

  // Mappings helper for dev tool category icons
  private getDevToolIcon(header: string): string {
    switch (header) {
      case 'Calculator': return 'calculate';
      case 'Formatters': return 'format_align_left';
      case 'Encode/Decode': return 'vpn_key';
      case 'Converters': return 'swap_horiz';
      case 'Generator': return 'build';
      default: return 'code';
    }
  }

  // Filter sections by search text reactively (handles nested array structures)
  filteredMenuItems = computed(() => {
    const items = this.menuItems();
    const query = this.searchValue().trim().toLowerCase();

    if (!query) return items;

    const filterItem = (item: SidebarItem): SidebarItem | null => {
      const labelMatches = item.label.toLowerCase().includes(query);

      if (item.children) {
        const filteredChildren = item.children
          .map((child) => filterItem(child))
          .filter((c): c is SidebarItem => c !== null);

        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
      }

      if (labelMatches) {
        return { ...item };
      }

      return null;
    };

    return items
      .map((item) => filterItem(item))
      .filter((item): item is SidebarItem => item !== null);
  });

  // Accordion checks and triggers
  isExpanded(item: SidebarItem): boolean {
    return this.expandedItems().has(item.label);
  }

  toggleExpanded(item: SidebarItem): void {
    const set = new Set(this.expandedItems());
    if (set.has(item.label)) {
      set.delete(item.label);
    } else {
      set.add(item.label);
    }
    this.expandedItems.set(set);
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
    if (item.children && item.children.length > 0) {
      if (this.isCollapsed()) {
        // Smart behavior: If collapsed, expand the sidebar and open the accordion category
        this.isCollapsed.set(false);
        const set = new Set(this.expandedItems());
        set.add(item.label);
        this.expandedItems.set(set);
      } else {
        // Otherwise, toggle the accordion state normally
        this.toggleExpanded(item);
      }
    } else if (item.link) {
      // If it is a direct menu item, navigate directly without expanding the sidebar
      this.router.navigateByUrl(item.link);
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => !v);
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
    return (first + last) || 'US';
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
