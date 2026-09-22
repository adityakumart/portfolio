import {
  Component,
  Input,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideImage,
} from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';

@Component({
  selector: 'app-rr-vehicle-image-carousel',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    HlmBadgeImports,
  ],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideImage,
    }),
  ],
  templateUrl: './vehicle-image-carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RRVehicleImageCarouselComponent {
  readonly fallbackImage =
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80';

  private _images = signal<string[]>([]);

  @Input()
  set images(val: string[] | undefined | null) {
    const list =
      val && Array.isArray(val) && val.length > 0
        ? val.filter((img) => typeof img === 'string' && img.trim().length > 0)
        : [];
    const finalImages = list.length > 0 ? list : [this.fallbackImage];

    // Only update and reset index if the image list actually changed
    const currentList = this._images();
    const isSame =
      currentList.length === finalImages.length &&
      currentList.every((img, i) => img === finalImages[i]);

    if (!isSame) {
      this._images.set(finalImages);
      this.currentIndex.set(0);
    }
  }

  @Input() alt = 'Vehicle Image';
  @Input() containerClass = 'h-56 sm:h-64';
  @Input() showThumbnails = true;

  readonly currentIndex = signal<number>(0);

  readonly resolvedImages = computed(() => this._images());

  readonly totalImages = computed(() => this.resolvedImages().length);

  readonly hasMultiple = computed(() => this.totalImages() > 1);

  readonly currentImage = computed(() => {
    const list = this.resolvedImages();
    const idx = this.currentIndex();
    return list[idx] || this.fallbackImage;
  });

  selectImage(index: number, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (index >= 0 && index < this.totalImages()) {
      this.currentIndex.set(index);
    }
  }

  next(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const total = this.totalImages();
    if (total <= 1) return;
    this.currentIndex.update((idx) => (idx + 1) % total);
  }

  prev(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const total = this.totalImages();
    if (total <= 1) return;
    this.currentIndex.update((idx) => (idx - 1 + total) % total);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackImage) {
      target.src = this.fallbackImage;
    }
  }

  @HostListener('keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (!this.hasMultiple()) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }
}
