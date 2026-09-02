import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { HlmBadge } from '@spartan-ng/hel/badge';
import { ResumeObject } from '@portfolio/shared-types';
import { ProjectsComponent } from '../projects/projects.component';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmBadge,
    ProjectsComponent,
  ],
  templateUrl: './experience.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  worksData = input.required<ResumeObject['work']>();
}
