import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RRApiService } from '../../services/rr-api.service';

@Component({
  selector: 'app-rr-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class RRHomepageComponent implements OnInit {
  private rrApi = inject(RRApiService);

  // State Signals
  vehicles = signal<any[]>([]);
  mobileMenuOpen = signal<boolean>(false);

  // Computed lists
  fiveSeaters = computed(() =>
    this.vehicles().filter((v) => v.seating === '5')
  );

  sevenSeaters = computed(() =>
    this.vehicles().filter((v) => v.seating === '7')
  );

  ngOnInit() {
    this.loadVehicles();
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error('Error fetching vehicles for homepage:', e);
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  getVehicleImage(v: any): string {
    if (v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }
}
