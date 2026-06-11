import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { appRoutingList } from '../../shared/data/routes';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-user',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatTooltipModule,
  ],
  templateUrl: './user.html',
  styleUrls: ['./../../app.component.scss', './user.scss'],
})
export class UserComponent {
  private themeService = inject(ThemeService);
  routingList = appRoutingList;

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
