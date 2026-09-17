import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
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
    }),
  ],
  templateUrl: './vehicle-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RRVehicleCardComponent {
  @Input({ required: true }) vehicle!: IVehicle | IPublicVehicle | any;
  @Input() variant: VehicleCardVariant = 'fleet';
  @Input() isAdmin = false;

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

  get vehicleImage(): string {
    if (this.vehicle?.images && this.vehicle.images.length > 0) {
      return this.vehicle.images[0];
    }
    return 'https://via.placeholder.com/150';
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
