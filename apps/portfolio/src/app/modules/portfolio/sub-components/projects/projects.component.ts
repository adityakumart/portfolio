import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { WorkProject } from '@portfolio/shared-types';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  projects = input.required<WorkProject[]>();
}
