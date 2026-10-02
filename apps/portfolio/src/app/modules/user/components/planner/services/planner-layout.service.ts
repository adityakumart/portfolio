import { Injectable, inject, signal, computed } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { PlatformAdapterService } from './platform-adapter.service';

export type PlannerViewMode = 'full' | 'mobile' | 'compact';

@Injectable({
  providedIn: 'root',
})
export class PlannerLayoutService {
  private breakpointObserver = inject(BreakpointObserver);
  private platform = inject(PlatformAdapterService);

  // Observable breakpoints mapped to signals
  readonly isHandset = signal<boolean>(false);
  readonly isTablet = signal<boolean>(false);
  readonly isDesktop = signal<boolean>(true);
  readonly forceCompact = signal<boolean>(false);

  // Unified viewMode: 'full' (desktop split), 'mobile' (handset tabs + FAB), 'compact' (extension / sidepanel)
  readonly viewMode = computed<PlannerViewMode>(() => {
    if (this.forceCompact() || this.platform.isChromeExtension) {
      return 'compact';
    }
    if (this.isHandset()) {
      return 'mobile';
    }
    return 'full';
  });

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web])
      .subscribe((result) => {
        const isHandsetMatch = this.breakpointObserver.isMatched(Breakpoints.Handset);
        const isTabletMatch = this.breakpointObserver.isMatched(Breakpoints.Tablet);
        const isWebMatch = this.breakpointObserver.isMatched(Breakpoints.Web);

        this.isHandset.set(isHandsetMatch);
        this.isTablet.set(isTabletMatch);
        this.isDesktop.set(!isHandsetMatch && (isWebMatch || !isTabletMatch));
      });

    // Detect if inside an iframe or compact popup window (e.g. extension <= 480px width)
    if (this.platform.isBrowser) {
      const checkWindowSize = () => {
        if (window.innerWidth <= 480) {
          this.forceCompact.set(true);
        }
      };
      checkWindowSize();
      window.addEventListener('resize', checkWindowSize);
    }
  }
}
