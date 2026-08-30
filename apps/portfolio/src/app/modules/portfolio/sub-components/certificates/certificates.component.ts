import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Certificate } from '@portfolio/shared-types';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './certificates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './certificates.component.scss',
})
export class CertificatesComponent {
  // Input signal to receive the certificates array from the parent
  certificates = input.required<Certificate[]>();
}
