import { Component, input } from '@angular/core';
import { ResumeObject } from 'src/shared/Interface/Resume';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  resume = input.required<ResumeObject>();
}