import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmDropdownMenuImports } from '@spartan-ng/hel/dropdown-menu';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucideFuel,
  lucideGauge,
  lucideKey,
  lucidePencil,
  lucideTrash2,
  lucidePalette,
  lucideArrowRight,
  lucidePhone,
  lucideMoreVertical,
  lucideImage,
} from '@ng-icons/lucide';
import { IVehicle, IPublicVehicle } from '@portfolio/shared-types';

export type VehicleCardVariant = 'fleet' | 'stats' | 'homepage';

@Component({
  selector: 'app-rr-vehicle-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmTooltipImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmDropdownMenuImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucideFuel,
      lucideGauge,
      lucideKey,
      lucidePencil,
      lucideTrash2,
      lucidePalette,
      lucideArrowRight,
      lucidePhone,
      lucideMoreVertical,
      lucideImage,
    }),
  ],
  templateUrl: './vehicle-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RRVehicleCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) vehicle!: IVehicle | IPublicVehicle | any;
  @Input() variant: VehicleCardVariant = 'fleet';
  @Input() isAdmin = false;

  readonly currentImageIndex = signal<number>(0);
  private autoScrollInterval: any = null;

  @Output() cardClick = new EventEmitter<any>();
  @Output() bookNow = new EventEmitter<IVehicle>();
  @Output() editClick = new EventEmitter<IVehicle>();
  @Output() deleteClick = new EventEmitter<string>();
  @Output() reserveClick = new EventEmitter<any>();
  @Output() whatsappClick = new EventEmitter<any>();
  @Output() phoneClick = new EventEmitter<any>();

  get showBookNowOverlay(): boolean {
    return this.variant === 'stats' && this.vehicle?.status === 'available';
  }

  get statusBadgeVariant(): 'secondary' | 'destructive' | 'outline' {
    return 'outline';
  }

  get statusBadgeLabel(): string {
    if (!this.vehicle) return '';
    if (this.variant === 'homepage' && this.vehicle.status === 'available') {
      return 'Available';
    }
    if (this.vehicle.status === 'available') {
      return 'AVAILABLE';
    }
    if (this.vehicle.status === 'in_booking' || this.vehicle.status === 'rented') {
      return 'ACTIVE BOOKING';
    }
    if (this.vehicle.status === 'maintenance') {
      return 'IN SERVICE';
    }
    if (this.vehicle.status === 'contract' || this.vehicle.status === 'in_contract') {
      return 'IN CONTRACT';
    }
    return (this.vehicle.status || '').toUpperCase();
  }

  get vehicleImages(): string[] {
    if (this.vehicle?.images && Array.isArray(this.vehicle.images)) {
      return this.vehicle.images.filter((img: string) => typeof img === 'string' && img.trim().length > 0);
    }
    return [];
  }

  get imageCount(): number {
    return this.vehicleImages.length;
  }

  get hasMultipleImages(): boolean {
    return this.imageCount > 1;
  }

  get vehicleImage(): string {
    const list = this.vehicleImages;
    if (list.length > 0) {
      const idx = this.currentImageIndex() % list.length;
      return list[idx] || list[0];
    }
    return 'https://via.placeholder.com/150';
  }

  ngOnInit() {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll();
    if (!this.hasMultipleImages) return;

    this.autoScrollInterval = setInterval(() => {
      if (this.hasMultipleImages) {
        this.currentImageIndex.update((idx) => (idx + 1) % this.imageCount);
      }
    }, 3200);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/150';
    }
  }

  onCardClick(event: Event) {
    this.cardClick.emit(this.vehicle);
    if (this.variant === 'stats' && this.vehicle?.status === 'available') {
      this.bookNow.emit(this.vehicle);
    }
  }

  onBookNowClick(event: Event) {
    event.stopPropagation();
    this.bookNow.emit(this.vehicle);
  }

  onEditClick(event: Event) {
    event.stopPropagation();
    this.editClick.emit(this.vehicle);
  }

  onDeleteClick(event: Event) {
    event.stopPropagation();
    this.deleteClick.emit(this.vehicle.regNo);
  }

  onReserveClick(event: Event) {
    event.stopPropagation();
    this.reserveClick.emit(this.vehicle);
  }

  onWhatsAppClick(event: Event) {
    event.stopPropagation();
    this.whatsappClick.emit(this.vehicle);
  }

  onPhoneClick(event: Event) {
    event.stopPropagation();
    this.phoneClick.emit(this.vehicle);
  }
}
