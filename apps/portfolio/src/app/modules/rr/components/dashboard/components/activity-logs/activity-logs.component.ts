import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideEraser, lucideAlertCircle } from '@ng-icons/lucide';
import { ILog } from '@portfolio/shared-types';

@Component({
  selector: 'app-rr-activity-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, NgIconComponent],
  providers: [provideIcons({ lucideSearch, lucideEraser, lucideAlertCircle })],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss'
})
export class RRActivityLogsComponent implements OnInit {
  private rrApi = inject(RRApiService);
  logs = signal<ILog[]>([]);
  logFilterFrom = '';
  logFilterTo = '';

  ngOnInit() {
    this.loadActivityLogs();
  }

  async loadActivityLogs() {
    try {
      const data = await this.rrApi.getLogs(this.logFilterFrom, this.logFilterTo);
      this.logs.set(data);
    } catch (e) {
      console.error('Error loading activity logs:', e);
    }
  }

  clearLogFilters() {
    this.logFilterFrom = '';
    this.logFilterTo = '';
    this.loadActivityLogs();
  }
}
