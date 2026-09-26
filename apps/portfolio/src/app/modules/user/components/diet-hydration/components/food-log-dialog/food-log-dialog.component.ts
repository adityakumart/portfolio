import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCamera,
  lucideTrash2,
  lucideX,
  lucidePlus,
  lucideCheck,
  lucideLoader2,
} from '@ng-icons/lucide';
import { HlmDialogImports } from '@spartan-ng/hel/dialog';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { DietStateService } from '../../services/diet-state.service';
import { DietHydrationApiService } from '../../services/diet-hydration-api.service';
import { compressImage } from '../../utils/image-compressor';
import { MealType, ICreateMealDto } from '@portfolio/shared-types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-food-log-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  providers: [
    provideIcons({
      lucideCamera,
      lucideTrash2,
      lucideX,
      lucidePlus,
      lucideCheck,
      lucideLoader2,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './food-log-dialog.component.html',
  styleUrls: ['./food-log-dialog.component.scss'],
})
export class FoodLogDialogComponent {
  state = inject(DietStateService);
  private api = inject(DietHydrationApiService);

  foodName = signal<string>('');
  portionSize = signal<string>('');
  estimatedCalories = signal<number | undefined>(undefined);
  mealTime = signal<string>('');
  notes = signal<string>('');
  imageUrl = signal<string>('');
  imageStorageKey = signal<string>('');

  isUploadingPhoto = signal<boolean>(false);
  uploadError = signal<string | null>(null);

  constructor() {
    // Populate form if editing
    const editing = this.state.editingMeal();
    if (editing) {
      this.foodName.set(editing.foodName);
      this.portionSize.set(editing.portionSize || '');
      this.estimatedCalories.set(editing.estimatedCalories);
      this.mealTime.set(editing.mealTime || '');
      this.notes.set(editing.notes || '');
      this.imageUrl.set(editing.imageUrl || '');
      this.imageStorageKey.set(editing.imageStorageKey || '');
    } else {
      const now = new Date();
      this.mealTime.set(
        `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes(),
        ).padStart(2, '0')}`,
      );
    }
  }

  get mealTypeTitle(): string {
    const type = this.state.selectedMealType();
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const originalFile = input.files[0];
    this.isUploadingPhoto.set(true);
    this.uploadError.set(null);

    try {
      // 1. Client-side Canvas Image Compression
      const { blob, mimeType } = await compressImage(originalFile, 1280, 0.82);

      // 2. Request S3 / R2 presigned upload URL from portfolio-core API
      const presigned = await firstValueFrom(
        this.api.getMealPhotoUploadUrl(originalFile.name, mimeType),
      );

      // 3. Upload directly to Cloudflare R2 / AWS S3
      await firstValueFrom(
        this.api.uploadPhotoToPresignedUrl(presigned.uploadUrl, blob, mimeType),
      );

      // 4. Save clean public file URL & storage key in form
      this.imageUrl.set(presigned.fileUrl);
      this.imageStorageKey.set(presigned.storageKey);
    } catch (err: any) {
      console.error('[FoodLogDialog] Upload failed:', err);
      this.uploadError.set(
        err.message || 'Failed to upload photo. Please try again.',
      );
    } finally {
      this.isUploadingPhoto.set(false);
    }
  }

  removePhoto(): void {
    this.imageUrl.set('');
    this.imageStorageKey.set('');
  }

  async onSubmit(): Promise<void> {
    if (!this.foodName().trim()) return;

    const dto: ICreateMealDto = {
      date: this.state.selectedDate(),
      mealType: this.state.selectedMealType(),
      foodName: this.foodName().trim(),
      portionSize: this.portionSize().trim() || undefined,
      estimatedCalories: this.estimatedCalories() || undefined,
      mealTime: this.mealTime() || undefined,
      notes: this.notes().trim() || undefined,
      imageUrl: this.imageUrl() || undefined,
      imageStorageKey: this.imageStorageKey() || undefined,
    };

    await this.state.saveMeal(dto);
  }

  close(): void {
    this.state.closeMealDialog();
  }
}
