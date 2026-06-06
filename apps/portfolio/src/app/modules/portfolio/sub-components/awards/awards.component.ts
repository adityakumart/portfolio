import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-awards',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './awards.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './awards.component.scss',
})
export class AwardsComponent {
  awards = input.required<any[]>();
}
