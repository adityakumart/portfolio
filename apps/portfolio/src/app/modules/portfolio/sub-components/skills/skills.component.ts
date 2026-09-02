import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { HlmBadge } from '@spartan-ng/hel/badge';
import { HlmTooltip } from '@spartan-ng/hel/tooltip';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    HlmCard,
    HlmCardHeader,
    HlmCardTitle,
    HlmCardContent,
    HlmBadge,
    HlmTooltip,
  ],
  templateUrl: './skills.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  resume = input.required<ResumeObject>();
  gridColumns = input.required<number>();

  openInNewTab(url: string) {
    if (url) {
      window.open(url);
    }
  }
}
