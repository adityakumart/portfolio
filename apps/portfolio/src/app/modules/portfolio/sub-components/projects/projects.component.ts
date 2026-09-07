import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { HlmBadge } from '@spartan-ng/hel/badge';
import { HlmAccordionImports } from '@spartan-ng/hel/accordion';
import { WorkProject } from '@portfolio/shared-types';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [HlmBadge, HlmAccordionImports],
  templateUrl: './projects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  projects = input.required<WorkProject[]>();
}
