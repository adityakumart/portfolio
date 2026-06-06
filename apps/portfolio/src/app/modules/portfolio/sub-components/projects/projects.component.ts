import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  projects = input.required<any[]>();
}
