import { Component, OnInit, OnDestroy, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RRApiService } from '../../services/rr-api.service';
import { RRPublicApiService } from '../../services/rr-public-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCar,
  lucideLayoutDashboard,
  lucideArrowRight,
  lucideKey,
  lucideMap,
  lucidePlane,
  lucideGift,
  lucideBuilding,
  lucidePalette,
  lucideFuel,
  lucideUsers,
  lucideSearchX,
  lucideMapPin,
  lucidePhone,
  lucideMail,
  lucideGlobe,
  lucideX,
  lucideCheckCircle,
  lucideCopy,
  lucideCheck,
  lucideExternalLink,
  lucideSparkles,
  lucideShield,
  lucideMegaphone,
  lucideTag,
  lucideCalendar,
  lucideChevronLeft,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmToggleGroupImports } from '@spartan-ng/hel/toggle-group';
import { HlmEmptyImports } from '@spartan-ng/hel/empty';
import { toast } from '@spartan-ng/hel/sonner';
import {
  IPublicVehicle,
  IRRAnnouncementItem,
  IRRScrollingTicker,
  RRAnnouncementCategory,
  IRRHomePageContent,
  DEFAULT_RR_HOMEPAGE_CONTENT,
} from '@portfolio/shared-types';
import { RRVehicleCardComponent, RRCarLoaderComponent, RRVehicleImageCarouselComponent } from '../../shared';

@Component({
  selector: 'app-rr-homepage',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    HlmButtonImports,
    HlmBadgeImports,
    HlmCardImports,
    HlmInputImports,
    HlmTooltipImports,
    HlmToggleGroupImports,
    HlmEmptyImports,
    NgIconComponent,
    RRVehicleCardComponent,
    RRCarLoaderComponent,
    RRVehicleImageCarouselComponent,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucideLayoutDashboard,
      lucideArrowRight,
      lucideKey,
      lucideMap,
      lucidePlane,
      lucideGift,
      lucideBuilding,
      lucidePalette,
      lucideFuel,
      lucideUsers,
      lucideSearchX,
      lucideMapPin,
      lucidePhone,
      lucideMail,
      lucideGlobe,
      lucideX,
      lucideCheckCircle,
      lucideCopy,
      lucideCheck,
      lucideExternalLink,
      lucideSparkles,
      lucideShield,
      lucideMegaphone,
      lucideTag,
      lucideCalendar,
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class RRHomepageComponent implements OnInit, OnDestroy {
  private rrApi = inject(RRApiService);
  private rrPublicApi = inject(RRPublicApiService);
  private router = inject(Router);

  // Dynamic Homepage Content Signal with Defaults
  homeContent = signal<IRRHomePageContent>(DEFAULT_RR_HOMEPAGE_CONTENT);

  // Dynamic Desk Phone Info derived from content
  primaryPhone = computed(() => this.homeContent().contact.primaryPhone || '+91 9494873336');
  primaryPhoneRaw = computed(() => this.homeContent().contact.primaryPhoneRaw || '9494873336');
  secondaryPhone = computed(() => this.homeContent().contact.secondaryPhone || '+91 9494893336');
  secondaryPhoneRaw = computed(() => this.homeContent().contact.secondaryPhoneRaw || '9494893336');
  whatsappNumberRaw = computed(() => this.homeContent().contact.whatsappNumberRaw || '9494873336');

  // Hero Banners Carousel State
  activeHeroBannerIndex = signal<number>(0);
  private heroBannerTimer?: ReturnType<typeof setInterval>;

  activeHeroBanner = computed(() => {
    const banners = this.homeContent().hero.banners || [];
    const idx = this.activeHeroBannerIndex();
    if (banners.length > idx && banners[idx]) {
      return banners[idx];
    }
    return banners[0] || DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners[0];
  });

  // State Signals
  vehicles = signal<IPublicVehicle[]>([]);
  mobileMenuOpen = signal<boolean>(false);
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  selectedVehicleForModal = signal<IPublicVehicle | null>(null);
  copiedPhone = signal<string | null>(null);
  isMobileDevice = signal<boolean>(false);

  // Car Loading State Signals
  isPageLoading = signal<boolean>(true);
  isLoaderExiting = signal<boolean>(false);
  loadingProgress = signal<number>(14);
  loadingStatus = signal<string>('Igniting engines...');
  private loaderTimers: ReturnType<typeof setTimeout>[] = [];

  // Announcements & Scrolling Ticker Signals
  ticker = signal<IRRScrollingTicker | null>(null);
  announcements = signal<IRRAnnouncementItem[]>([]);
  selectedAnnouncementCategory = signal<string>('all');
  copiedPromoCode = signal<string | null>(null);

  // Computed lists
  filteredVehicles = computed(() => {
    const list = this.vehicles();
    const cat = this.selectedCategory().toLowerCase();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter((v) => {
      // Exclude vehicles not allowed for booking or in maintenance/contract
      if (v.allowBooking === false) return false;
      if (v.status === 'maintenance' || v.status === 'contract' || v.status === 'in_contract') return false;

      // Category filter
      let matchCat = true;
      if (cat === '5') matchCat = v.seating === '5';
      else if (cat === '7') matchCat = v.seating === '7';
      else if (cat === 'suv') matchCat = (v.type || '').toLowerCase().includes('suv');
      else if (cat === 'sedan') matchCat = (v.type || '').toLowerCase().includes('sedan');
      else if (cat === 'hatchback') matchCat = (v.type || '').toLowerCase().includes('hatchback');

      // Search query filter
      let matchQuery = true;
      if (query) {
        const full = `${v.manufacturer} ${v.name} ${v.type} ${v.fuelType} ${v.color}`.toLowerCase();
        matchQuery = full.includes(query);
      }

      return matchCat && matchQuery;
    });
  });

  fiveSeaters = computed(() =>
    this.vehicles().filter((v) => v.seating === '5')
  );

  sevenSeaters = computed(() =>
    this.vehicles().filter((v) => v.seating === '7')
  );

  currentUser = computed(() => this.rrApi.currentUser());

  // Filtered announcements list
  filteredAnnouncements = computed(() => {
    const list = this.announcements();
    const cat = this.selectedAnnouncementCategory();

    if (cat === 'all') return list;
    return list.filter((a) => a.category === cat);
  });

  announcementCounts = computed(() => {
    const list = this.announcements();
    return {
      all: list.length,
      offer: list.filter((a) => a.category === 'offer').length,
      intimation: list.filter((a) => a.category === 'intimation').length,
      festival: list.filter((a) => a.category === 'festival').length,
    };
  });

  ngOnInit() {
    this.checkDeviceType();
    this.startCarLoaderSequence();
    this.loadVehicles();
    this.loadAnnouncements();
    this.loadHomeContent();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkDeviceType();
  }

  checkDeviceType() {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        window.innerWidth < 768;
      this.isMobileDevice.set(isMobile);
    }
  }

  ngOnDestroy() {
    this.clearLoaderTimers();
    if (this.heroBannerTimer) {
      clearInterval(this.heroBannerTimer);
    }
  }

  private clearLoaderTimers() {
    this.loaderTimers.forEach((t) => clearTimeout(t));
    this.loaderTimers = [];
  }

  private startCarLoaderSequence() {
    this.loaderTimers.push(
      setTimeout(() => {
        this.loadingProgress.set(38);
        this.loadingStatus.set('Calibrating fleet telemetry...');
      }, 350)
    );

    this.loaderTimers.push(
      setTimeout(() => {
        this.loadingProgress.set(74);
        this.loadingStatus.set('Syncing RoadReady fleet...');
      }, 800)
    );

    this.loaderTimers.push(
      setTimeout(() => {
        this.loadingProgress.set(100);
        this.loadingStatus.set('Engines ready! Welcome aboard.');
      }, 1250)
    );

    // Trigger smooth fade-out
    this.loaderTimers.push(
      setTimeout(() => {
        this.isLoaderExiting.set(true);
      }, 1550)
    );

    // Cleanly unmount from DOM after transition finishes
    this.loaderTimers.push(
      setTimeout(() => {
        this.isPageLoading.set(false);
      }, 2150)
    );
  }

  skipLoading() {
    this.clearLoaderTimers();
    this.loadingProgress.set(100);
    this.loadingStatus.set('Welcome!');
    this.isLoaderExiting.set(true);
    setTimeout(() => {
      this.isPageLoading.set(false);
    }, 400);
  }

  async loadVehicles() {
    try {
      const data = await this.rrPublicApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error fetching vehicles for homepage:', e);
    }
  }

  async loadHomeContent() {
    try {
      const data = await this.rrPublicApi.getHomeContent();
      if (data) {
        this.homeContent.set(data);
        this.setupHeroBannerRotator();
      }
    } catch (e) {
      console.error('Error fetching home content for homepage:', e);
    }
  }

  private setupHeroBannerRotator() {
    if (this.heroBannerTimer) {
      clearInterval(this.heroBannerTimer);
      this.heroBannerTimer = undefined;
    }
    const hero = this.homeContent().hero;
    if (hero?.autoRotateBanners && hero?.banners && hero.banners.length > 1) {
      const intervalMs = Math.max(2, hero.bannerIntervalSeconds || 6) * 1000;
      this.heroBannerTimer = setInterval(() => {
        const next = (this.activeHeroBannerIndex() + 1) % hero.banners.length;
        this.activeHeroBannerIndex.set(next);
      }, intervalMs);
    }
  }

  nextBanner() {
    const banners = this.homeContent().hero.banners || [];
    if (banners.length > 1) {
      this.activeHeroBannerIndex.update((i) => (i + 1) % banners.length);
    }
  }

  prevBanner() {
    const banners = this.homeContent().hero.banners || [];
    if (banners.length > 1) {
      this.activeHeroBannerIndex.update((i) => (i - 1 + banners.length) % banners.length);
    }
  }

  setBannerIndex(idx: number) {
    this.activeHeroBannerIndex.set(idx);
  }

  async loadAnnouncements() {
    try {
      const data = await this.rrPublicApi.getAnnouncements();
      if (data) {
        if (data.ticker) {
          this.ticker.set(data.ticker);
        }
        if (data.items) {
          this.announcements.set(data.items);
        }
      }
    } catch (e) {
      console.error('Error fetching announcements for homepage:', e);
    }
  }

  setAnnouncementCategory(cat: string) {
    this.selectedAnnouncementCategory.set(cat);
  }

  copyPromoCode(code: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        this.copiedPromoCode.set(code);
        toast.success(`Copied coupon code ${code}!`);
        setTimeout(() => {
          if (this.copiedPromoCode() === code) {
            this.copiedPromoCode.set(null);
          }
        }, 3000);
      }).catch(() => {
        toast.info(`Promo Code: ${code}`);
      });
    } else {
      toast.info(`Promo Code: ${code}`);
    }
  }

  handleAnnouncementAction(item: IRRAnnouncementItem) {
    if (item.ctaAction === 'call') {
      const phoneToCall = item.ctaLink || this.primaryPhoneRaw();
      this.makeDirectCall(phoneToCall.replace(/[^0-9]/g, ''));
    } else if (item.ctaAction === 'whatsapp') {
      const text = `Hello RoadReady Rentals, I would like to inquire about "${item.title}". ${item.promoCode ? 'Promo code: ' + item.promoCode : ''} Please share details.`;
      const url = `https://wa.me/91${this.whatsappNumberRaw()}?text=${encodeURIComponent(text)}`;
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    } else if (item.ctaAction === 'link' && item.ctaLink) {
      if (item.ctaLink.startsWith('#')) {
        const el = document.querySelector(item.ctaLink);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (typeof window !== 'undefined') {
        window.open(item.ctaLink, '_blank');
      }
    }
  }

  setCategory(cat: string | string[] | null | undefined) {
    if (typeof cat === 'string') {
      this.selectedCategory.set(cat);
    } else if (Array.isArray(cat) && cat.length > 0) {
      this.selectedCategory.set(cat[0]);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  getVehicleImage(v: IPublicVehicle): string {
    if (v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
  }

  openVehicleModal(v: IPublicVehicle) {
    this.selectedVehicleForModal.set(v);
  }

  closeVehicleModal() {
    this.selectedVehicleForModal.set(null);
  }

  onBookNow(v: IPublicVehicle) {
    if (this.currentUser()) {
      this.router.navigate(['/user/rr/booking/list']);
    } else {
      this.openVehicleModal(v);
    }
  }

  // Reserve Actions
  redirectToWhatsApp(vehicle: IPublicVehicle) {
    const text = `Hello RoadReady Rentals, I would like to reserve ${vehicle.manufacturer} ${vehicle.name}. Please share availability and booking details.`;
    const url = `https://wa.me/91${this.whatsappNumberRaw()}?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  makeDirectCall(phoneRaw?: string) {
    const targetPhone = phoneRaw || this.primaryPhoneRaw();
    if (typeof window !== 'undefined') {
      window.location.href = `tel:+91${targetPhone}`;
    }
  }

  handleCardPhoneClick(vehicle: IPublicVehicle) {
    if (this.isMobileDevice()) {
      this.makeDirectCall(this.primaryPhoneRaw());
    } else {
      this.openVehicleModal(vehicle);
    }
  }

  copyPhoneNumber(phone: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(phone).then(() => {
        this.copiedPhone.set(phone);
        toast.success(`Copied ${phone} to clipboard`);
        setTimeout(() => {
          if (this.copiedPhone() === phone) {
            this.copiedPhone.set(null);
          }
        }, 3000);
      }).catch(() => {
        toast.info(`Phone: ${phone}`);
      });
    } else {
      toast.info(`Phone: ${phone}`);
    }
  }
}
