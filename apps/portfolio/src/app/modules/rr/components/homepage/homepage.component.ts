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
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmToggleGroupImports } from '@spartan-ng/hel/toggle-group';
import { HlmEmptyImports } from '@spartan-ng/hel/empty';
import { toast } from '@spartan-ng/hel/sonner';
import { IPublicVehicle } from '@portfolio/shared-types';
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
    }),
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class RRHomepageComponent implements OnInit, OnDestroy {
  private rrApi = inject(RRApiService);
  private rrPublicApi = inject(RRPublicApiService);
  private router = inject(Router);

  // Desk Phone Info
  readonly primaryPhone = '+91 9494873336';
  readonly primaryPhoneRaw = '9494873336';
  readonly secondaryPhone = '+91 9494893336';
  readonly secondaryPhoneRaw = '9494893336';

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

  ngOnInit() {
    this.checkDeviceType();
    this.startCarLoaderSequence();
    this.loadVehicles();
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
    const url = `https://wa.me/91${this.primaryPhoneRaw}?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  makeDirectCall(phoneRaw: string = this.primaryPhoneRaw) {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:+91${phoneRaw}`;
    }
  }

  handleCardPhoneClick(vehicle: IPublicVehicle) {
    if (this.isMobileDevice()) {
      this.makeDirectCall(this.primaryPhoneRaw);
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
