import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatTooltipModule],
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
