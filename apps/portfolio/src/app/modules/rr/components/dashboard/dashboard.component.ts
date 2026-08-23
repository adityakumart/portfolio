import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { RRApiService } from '../../services/rr-api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class RRDashboardComponent implements OnInit {
  rrApi = inject(RRApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @ViewChild('profileInfoDialog') profileInfoDialog!: TemplateRef<any>;

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Shell UI State
  profileDropdownOpen = signal<boolean>(false);

  ngOnInit() {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/rr/login']);
    }
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen.set(!this.profileDropdownOpen());
  }

  showProfilePopup() {
    this.profileDropdownOpen.set(false);
    this.dialog.open(this.profileInfoDialog, {
      width: '500px',
      maxWidth: '90vw'
    });
  }

  closeProfilePopup() {
    this.dialog.closeAll();
  }

  logout() {
    this.dialog.closeAll();
    this.rrApi.logout();
  }
}
