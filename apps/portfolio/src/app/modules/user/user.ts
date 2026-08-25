import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './user.html',
})
export class UserComponent {}

