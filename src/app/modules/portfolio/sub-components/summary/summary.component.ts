import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ResumeObject } from 'src/shared/Interface/Resume';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  resume = input.required<ResumeObject>();
}