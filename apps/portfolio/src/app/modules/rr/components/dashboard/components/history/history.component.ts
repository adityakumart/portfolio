import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RRApiService } from '../../../../services/rr-api.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHistory } from '@ng-icons/lucide';
import { IBooking } from '@portfolio/shared-types';

@Component({
  selector: 'app-rr-history',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ lucideHistory })],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class RRHistoryComponent implements OnInit {
  private rrApi = inject(RRApiService);
  bookings = signal<IBooking[]>([]);

  historyBookings = computed(() =>
    this.bookings().filter((b) => b.status === 'completed' || b.status === 'cancelled')
  );

  ngOnInit() {
    this.loadBookings();
  }

  async loadBookings() {
    try {
      const data = await this.rrApi.getBookings();
      this.bookings.set(data);
    } catch (e) {
      console.error(e);
    }
  }
}
