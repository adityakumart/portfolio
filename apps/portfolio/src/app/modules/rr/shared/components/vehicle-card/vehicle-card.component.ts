import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
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
} from '@ng-icons/lucide';
import { IVehicle } from '@portfolio/shared-types';

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
    }),
  ],
  templateUrl: './vehicle-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RRVehicleCardComponent {
  @Input({ required: true }) vehicle!: IVehicle;
  @Input() variant: VehicleCardVariant = 'fleet';
  @Input() isAdmin = false;

  @Output() cardClick = new EventEmitter<IVehicle>();
  @Output() bookNow = new EventEmitter<IVehicle>();
  @Output() editClick = new EventEmitter<IVehicle>();
  @Output() deleteClick = new EventEmitter<string>();
  @Output() reserveClick = new EventEmitter<IVehicle>();
  @Output() whatsappClick = new EventEmitter<IVehicle>();
  @Output() phoneClick = new EventEmitter<IVehicle>();

  get showBookNowOverlay(): boolean {
    return this.variant === 'stats' && this.vehicle?.status === 'available';
  }

  get statusBadgeVariant(): 'secondary' | 'destructive' | 'outline' {
    if (this.vehicle?.status === 'available') {
      return 'secondary';
    }
    if (this.vehicle?.status === 'maintenance') {
      return 'destructive';
    }
    return 'outline';
  }

  get statusBadgeLabel(): string {
    if (!this.vehicle) return '';
    if (this.variant === 'homepage' && this.vehicle.status === 'available') {
      return 'Available';
    }
    if (this.vehicle.status === 'in_booking') {
      return 'RENTED';
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
