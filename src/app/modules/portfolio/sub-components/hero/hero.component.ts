import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { ResumeObject } from 'src/shared/Interface/Resume';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  resume = input.required<ResumeObject>();
}