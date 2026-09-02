import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent],
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  resume = input.required<ResumeObject>();
}
