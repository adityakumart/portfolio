import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  resume = input.required<ResumeObject>();
}
