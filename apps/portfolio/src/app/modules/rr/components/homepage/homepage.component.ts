import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RRApiService } from '../../services/rr-api.service';
import { MatIconModule } from '@angular/material/icon';
import { IVehicle } from '@portfolio/shared-types';

@Component({
  selector: 'app-rr-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatIconModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss',
})
export class RRHomepageComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private router = inject(Router);

  // State Signals
  vehicles = signal<IVehicle[]>([]);
  mobileMenuOpen = signal<boolean>(false);
  selectedCategory = signal<string>('all');
  searchQuery = signal<string>('');
  selectedVehicleForModal = signal<IVehicle | null>(null);
  inquirySubmitted = signal<boolean>(false);

  // Inquiry form fields
  inquiryName = '';
  inquiryPhone = '';
  inquiryPickupDate = '';
  inquiryDuration = '23';

  // Computed lists
  filteredVehicles = computed(() => {
    const list = this.vehicles();
    const cat = this.selectedCategory().toLowerCase();
    const query = this.searchQuery().toLowerCase().trim();

    return list.filter((v) => {
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

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  getVehicleImage(v: IVehicle): string {
    if (v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80';
  }

  openVehicleModal(v: IVehicle) {
    this.selectedVehicleForModal.set(v);
    this.inquirySubmitted.set(false);
  }

  closeVehicleModal() {
    this.selectedVehicleForModal.set(null);
  }

  onBookNow(v: IVehicle) {
    if (this.currentUser()) {
      this.router.navigate(['/user/rr/booking/list'], {
        queryParams: { vehicleRegNo: v.regNo },
      });
    } else {
      this.openVehicleModal(v);
    }
  }

  submitInquiry() {
    if (!this.inquiryName || !this.inquiryPhone) return;
    this.inquirySubmitted.set(true);
    setTimeout(() => {
      this.closeVehicleModal();
      this.inquiryName = '';
      this.inquiryPhone = '';
      this.inquirySubmitted.set(false);
    }, 2500);
  }
}
