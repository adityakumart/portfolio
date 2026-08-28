import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRApiService } from '../../../../services/rr-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rr-stats-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './stats-view.component.html',
  styleUrl: './stats-view.component.scss'
})
export class RRStatsViewComponent implements OnInit {
  private rrApi = inject(RRApiService);
  vehicles = signal<any[]>([]);

  ngOnInit() {
    this.loadVehicles();
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error loading vehicles in stats view:', e);
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
}
