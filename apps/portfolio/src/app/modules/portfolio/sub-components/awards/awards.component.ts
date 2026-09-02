import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  HlmCard,
  HlmCardHeader,
  HlmCardTitle,
  HlmCardContent,
} from '@spartan-ng/hel/card';
import { Award } from '@portfolio/shared-types';

@Component({
  selector: 'app-awards',
  standalone: true,
  imports: [HlmCard, HlmCardHeader, HlmCardTitle, HlmCardContent],
  templateUrl: './awards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './awards.component.scss',
})
export class AwardsComponent {
  awards = input.required<Award[]>();
}
