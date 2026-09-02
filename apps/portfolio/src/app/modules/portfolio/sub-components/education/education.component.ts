import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { HlmBadge } from '@spartan-ng/hel/badge';
import { Education } from '@portfolio/shared-types';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent, HlmBadge],
  templateUrl: './education.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  education = input.required<Education[]>();
}
