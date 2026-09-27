import {
  Component,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutDashboard,
  lucideCode,
  lucideUser,
  lucideCar,
  lucideChevronRight,
  lucideCalculator,
  lucideAlignLeft,
  lucideKey,
  lucideRefreshCw,
  lucideHammer,
  lucideMessageSquare,
  lucideFolder,
  lucideHome,
  lucideBarChart2,
  lucideFileText,
  lucideUsers,
  lucideHistory,
  lucideSun,
  lucideMoon,
  lucideLogOut,
  lucideZap,
  lucideMenu,
  lucideX,
  lucideActivity,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { HlmAvatarImports } from '@spartan-ng/hel/avatar';
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
    NgIconComponent,
    HlmButtonImports,
    HlmTooltipImports,
    HlmDropdownMenuImports,
    HlmAvatarImports,
  ],
  providers: [
    provideIcons({
      lucideLayoutDashboard,
      lucideCode,
      lucideUser,
      lucideCar,
      lucideChevronRight,
      lucideCalculator,
      lucideAlignLeft,
      lucideKey,
      lucideRefreshCw,
      lucideHammer,
      lucideMessageSquare,
      lucideFolder,
      lucideHome,
      lucideBarChart2,
      lucideFileText,
      lucideUsers,
      lucideHistory,
      lucideSun,
      lucideMoon,
      lucideLogOut,
      lucideZap,
      lucideMenu,
      lucideX,
      lucideActivity,
    }),
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private rrApiService = inject(RRApiService);
  private elementRef = inject(ElementRef);

  // Active hover tracking signals for fly-out panel visibility control
  activeLevel0Item = signal<SidebarItem | null>(null);
  activeLevel1Item = signal<SidebarItem | null>(null);

  // Mobile drawer and accordion signals
  isMobileDrawerOpen = signal<boolean>(false);
  expandedMobileItems = signal<Set<string>>(new Set());

  toggleMobileDrawer(): void {
    this.isMobileDrawerOpen.update((v) => !v);
  }

  closeMobileDrawer(): void {
    this.isMobileDrawerOpen.set(false);
    this.activeLevel0Item.set(null);
    this.activeLevel1Item.set(null);
  }

  toggleMobileAccordion(label: string): void {
    this.expandedMobileItems.update((current) => {
      const updated = new Set(current);
      if (updated.has(label)) {
        updated.delete(label);
      } else {
        updated.add(label);
      }
      return updated;
    });
  }

  isMobileAccordionExpanded(label: string): boolean {
    return this.expandedMobileItems().has(label);
  }

  // Timers to provide a smooth grace period when moving cursor between icon and fly-out panels
  private closeLevel0Timer: ReturnType<typeof setTimeout> | null = null;
  private closeLevel1Timer: ReturnType<typeof setTimeout> | null = null;

  private clearTimers(): void {
    if (this.closeLevel0Timer) {
      clearTimeout(this.closeLevel0Timer);
      this.closeLevel0Timer = null;
    }
    if (this.closeLevel1Timer) {
      clearTimeout(this.closeLevel1Timer);
      this.closeLevel1Timer = null;
    }
  }

  onLevel0Enter(item: SidebarItem): void {
    this.clearTimers();
    if (this.activeLevel0Item() !== item) {
      this.activeLevel0Item.set(item);
      this.activeLevel1Item.set(null);
    }
  }

  onLevel0Leave(): void {
    if (this.closeLevel0Timer) {
      clearTimeout(this.closeLevel0Timer);
    }
    this.closeLevel0Timer = setTimeout(() => {
      this.activeLevel0Item.set(null);
      this.activeLevel1Item.set(null);
      this.closeLevel0Timer = null;
    }, 300);
  }

  onLevel1Enter(subItem: SidebarItem): void {
    this.clearTimers();
    this.activeLevel1Item.set(subItem);
  }

  onLevel1Leave(): void {
    if (this.closeLevel1Timer) {
      clearTimeout(this.closeLevel1Timer);
    }
    this.closeLevel1Timer = setTimeout(() => {
      this.activeLevel1Item.set(null);
      this.closeLevel1Timer = null;
    }, 300);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.clearTimers();
      this.activeLevel0Item.set(null);
      this.activeLevel1Item.set(null);
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  // User and Theme state
  currentUser = computed(() => this.authService.currentUser());
  rrUser = computed(() => this.rrApiService.currentUser());
  isLoggedIn = computed(() => !!this.currentUser() || !!this.rrUser());
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
      { label: 'Portfolio', icon: 'lucideZap', link: '/' },
      {
        label: 'Dev Tools',
        icon: 'lucideCode',
        children: devToolsRoutingList.map((group) => ({
          label: group.header,
          icon: this.getDevToolIcon(group.header),
          children: group.tools.map((tool) => ({
            label: tool.name,
            link: tool.link,
            icon: 'lucideChevronRight',
          })),
        })),
      },
    ];

    if (user) {
      items.push({
        label: 'User',
        icon: 'lucideUser',
        children: [
          { label: 'Profile', link: '/user', icon: 'lucideUser' },
          {
            label: 'AI Assistant',
            link: '/user/ai',
            icon: 'lucideMessageSquare',
          },
          { label: 'File Manager', link: '/user/files', icon: 'lucideFolder' },
          {
            label: 'Diet & Hydration',
            link: '/user/diet-hydration',
            icon: 'lucideActivity',
          },
        ],
      });
    } else if (rrUser) {
      items.push({
        label: 'Car Rentals',
        icon: 'lucideCar',
        children: [
          { label: 'Homepage', link: '/user/rr/home', icon: 'lucideHome' },
          {
            label: 'Dashboard Summary',
            link: '/user/rr/dashboard',
            icon: 'lucideBarChart2',
          },
          {
            label: 'Active Rentals',
            link: '/user/rr/booking/list',
            icon: 'lucideFileText',
          },
          {
            label: 'Vehicles List',
            link: '/user/rr/vehicle/list',
            icon: 'lucideCar',
          },
          {
            label: 'Employee List',
            link: '/user/rr/employee/list',
            icon: 'lucideUsers',
          },
          {
            label: 'History Logs',
            link: '/user/rr/history',
            icon: 'lucideHistory',
          },
        ],
      });
    } else {
      items.push({
        label: 'User Login',
        link: '/user/login',
        icon: 'lucideUser',
      });
      items.push({
        label: 'Car Rental Login',
        link: '/user/rr/login',
        icon: 'lucideCar',
      });
    }

    return items;
  });

  private getDevToolIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'text tools':
        return 'lucideAlignLeft';
      case 'crypto':
        return 'lucideKey';
      case 'converters':
        return 'lucideRefreshCw';
      case 'generators':
        return 'lucideHammer';
      case 'calculators':
        return 'lucideCalculator';
      default:
        return 'lucideFolder';
    }
  }

  // Active item checking for selection highlighting
  isItemActive(item: SidebarItem): boolean {
    const url = this.currentUrl() || '';

    if (item.link) {
      if (item.link === '/' && url === '/') {
        return true;
      }
      if (item.link !== '/' && url.startsWith(item.link)) {
        return true;
      }
    }

    if (item.children && item.children.length > 0) {
      const checkChildren = (children: SidebarItem[]): boolean => {
        return children.some((child) => {
          if (child.link && url.startsWith(child.link)) {
            return true;
          }
          if (child.children && child.children.length > 0) {
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
      this.closeMobileDrawer();
      this.router.navigateByUrl(item.link);
      // Close all submenus immediately on click
      if (this.closeLevel0Timer) {
        clearTimeout(this.closeLevel0Timer);
        this.closeLevel0Timer = null;
      }
      if (this.closeLevel1Timer) {
        clearTimeout(this.closeLevel1Timer);
        this.closeLevel1Timer = null;
      }
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
    if (user) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    }
    const rr = this.rrUser();
    if (rr) {
      return `${rr.firstName || ''} ${rr.lastName || ''}`.trim() || 'User';
    }
    return '';
  });

  userRole = computed(() => {
    const user = this.currentUser();
    if (user) {
      return user.admin ? 'ADMIN' : 'USER';
    }
    const rr = this.rrUser();
    if (rr) {
      return (rr.role || 'USER').toUpperCase();
    }
    return '';
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (user) {
      const first = (user.first_name || '').charAt(0).toUpperCase();
      const last = (user.last_name || '').charAt(0).toUpperCase();
      return (first + last).trim() || 'U';
    }
    const rr = this.rrUser();
    if (rr) {
      const first = (rr.firstName || '').charAt(0).toUpperCase();
      const last = (rr.lastName || '').charAt(0).toUpperCase();
      return (first + last).trim() || 'U';
    }
    return '';
  });

  async onLogout(): Promise<void> {
    const isRR = !!this.rrApiService.currentUser();
    try {
      if (isRR) {
        this.rrApiService.logout();
      }
      if (this.authService.currentUser()) {
        await this.authService.logout();
      }
      this.router.navigate([isRR ? '/user/rr/login' : '/user/login']);
    } catch (err) {
      console.error('Sidebar logout error:', err);
      this.router.navigate([isRR ? '/user/rr/login' : '/user/login']);
    }
  }
}
