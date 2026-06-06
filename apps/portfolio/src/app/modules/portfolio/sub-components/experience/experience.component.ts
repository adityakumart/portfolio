import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ResumeObject } from '../../../../../shared/Interface/Resume';
import { ProjectsComponent } from '../projects/projects.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [MatCardModule, ProjectsComponent],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  worksData = input.required<ResumeObject['work']>();
}
