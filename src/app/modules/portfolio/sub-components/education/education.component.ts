import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './education.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './education.component.scss'
})
export class EducationComponent {
  education = input.required<any[]>();
}