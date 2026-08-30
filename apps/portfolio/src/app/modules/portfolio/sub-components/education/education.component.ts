import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Education } from '@portfolio/shared-types';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './education.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  education = input.required<Education[]>();
}
