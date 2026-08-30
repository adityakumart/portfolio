import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ResumeObject } from '@portfolio/shared-types';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './summary.component.scss',
})
export class SummaryComponent {
  resume = input.required<ResumeObject>();
}
