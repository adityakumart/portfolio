import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rr-car-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-loader.component.html',
  styleUrl: './car-loader.component.scss',
})
export class RRCarLoaderComponent {
  @Input() progress: number = 0;
  @Input() statusText: string = 'Starting engines...';
  @Input() isExiting: boolean = false;
  @Output() skip = new EventEmitter<void>();

  onSkip() {
    this.skip.emit();
  }
}
