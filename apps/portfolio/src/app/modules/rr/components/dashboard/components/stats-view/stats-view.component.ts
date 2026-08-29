import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRApiService } from '../../../../services/rr-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rr-stats-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './stats-view.component.html',
  styleUrl: './stats-view.component.scss'
})
export class RRStatsViewComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  @ViewChild('detailsDialog') detailsDialog!: TemplateRef<any>;

  vehicles = signal<any[]>([]);
  bookings = signal<any[]>([]);
  stats = signal<any>({
    totalFleet: 0,
    activeBookings: 0,
    maintenance: 0,
    pendingPayments: 0
  });

  // Modal Dialog states
  modalTitle = signal<string>('');
  modalData = signal<any[]>([]);
  modalType = signal<'fleet' | 'bookings' | 'maintenance' | 'payments'>('fleet');

  ngOnInit() {
    this.loadVehicles();
    this.loadBookings();
    this.loadStats();
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles in stats view:', e);
    }
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error('Error loading bookings in stats view:', e);
    }
  }

  async loadStats() {
    try {
      const data = await this.rrApi.getDashboardStats();
      this.stats.set(data);
    } catch (e) {
      console.error('Error loading stats in stats view:', e);
    }
  }

  getVehicleCount(status: string): number {
    return this.vehicles().filter((v) => v.status === status).length;
  }

  getVehicleImage(v: any): string {
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  async openDetailsModal(type: 'fleet' | 'bookings' | 'maintenance' | 'payments') {
    // Refresh data to ensure correctness in modal popup
    await Promise.all([this.loadVehicles(), this.loadBookings(), this.loadStats()]);

    if (type === 'fleet') {
      this.modalTitle.set('Total Fleet Details');
      this.modalType.set('fleet');
      this.modalData.set(this.vehicles());
    } else if (type === 'bookings') {
      this.modalTitle.set('Active Bookings Details');
      this.modalType.set('bookings');
      this.modalData.set(this.bookings().filter((b) => b.status === 'active'));
    } else if (type === 'maintenance') {
      this.modalTitle.set('Fleet Under Maintenance');
      this.modalType.set('maintenance');
      this.modalData.set(this.vehicles().filter((v) => v.status === 'maintenance'));
    } else if (type === 'payments') {
      this.modalTitle.set('Pending Payments Details');
      this.modalType.set('payments');
      this.modalData.set(this.bookings().filter((b) => b.status === 'active' && Number(b.pendingAmount) > 0));
    }

    this.dialog.open(this.detailsDialog, {
      width: '850px',
      maxWidth: '95vw',
      maxHeight: '85vh',
      panelClass: 'modern-dialog-panel'
    });
  }

  bookVehicle(vehicle: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/user/rr/booking/list'], {
      queryParams: { vehicleRegNo: vehicle.regNo }
    });
  }
}

