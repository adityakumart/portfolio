import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { HlmCard, HlmCardHeader, HlmCardTitle } from '@spartan-ng/hel/card';
import { Certificate } from '@portfolio/shared-types';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [HlmCard, HlmCardHeader, HlmCardTitle],
  templateUrl: './certificates.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './certificates.component.scss',
})
export class CertificatesComponent {
  // Input signal to receive the certificates array from the parent
  certificates = input.required<Certificate[]>();
}
