import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './certificates.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './certificates.component.scss',
})
export class CertificatesComponent {
  // Input signal to receive the certificates array from the parent
  certificates = input.required<any[]>();
}
