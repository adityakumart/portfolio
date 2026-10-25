import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { RRApiService } from '../../../../services/rr-api.service';
import {
  IRRFeedback,
  RR_FEEDBACK_PAGES,
  RR_FEEDBACK_ISSUE_TYPES,
  RRFeedbackPage,
  RRFeedbackIssueType,
  IRRCreateFeedbackPayload,
} from '@portfolio/shared-types';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMessageSquarePlus,
  lucideSend,
  lucideImage,
  lucideUploadCloud,
  lucideTrash2,
  lucideCheckCircle2,
  lucideClock,
  lucidePauseCircle,
  lucideCheckCheck,
  lucideAlertCircle,
  lucideRefreshCw,
  lucideFileText,
  lucideSparkles,
  lucideX,
  lucideInfo,
  lucideExternalLink,
  lucideChevronRight,
  lucideHelpCircle,
  lucideHistory,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rr-feedback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmBadgeImports,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideMessageSquarePlus,
      lucideSend,
      lucideImage,
      lucideUploadCloud,
      lucideTrash2,
      lucideCheckCircle2,
      lucideClock,
      lucidePauseCircle,
      lucideCheckCheck,
      lucideAlertCircle,
      lucideRefreshCw,
      lucideFileText,
      lucideSparkles,
      lucideX,
      lucideInfo,
      lucideExternalLink,
      lucideChevronRight,
      lucideHelpCircle,
      lucideHistory,
    }),
  ],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss',
})
export class RRFeedbackSubmissionComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private router = inject(Router);

  // User state
  currentUser = computed(() => this.rrApi.currentUser());

  // Page and Issue Taxonomy
  feedbackPages = RR_FEEDBACK_PAGES;
  issueTypes = RR_FEEDBACK_ISSUE_TYPES;

  // Form State
  isSubmitting = signal<boolean>(false);
  isUploadingImage = signal<boolean>(false);
  selectedImageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  uploadedImageUrl = signal<string | null>(null);
  uploadedImageKey = signal<string | null>(null);
  uploadedImageName = signal<string | null>(null);

  // My Feedbacks History
  myFeedbacks = signal<IRRFeedback[]>([]);
  isLoadingHistory = signal<boolean>(false);
  activeTab = signal<'form' | 'history'>('form');

  // Preview Modal
  previewModalImage = signal<{ url: string; title: string } | null>(null);

  feedbackForm = new FormGroup({
    page: new FormControl<RRFeedbackPage>('dashboard', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    issueType: new FormControl<RRFeedbackIssueType>('functionality', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(1000),
      ],
    }),
  });

  // Real-time character counter
  charCount = computed(() => {
    return this.feedbackForm.controls.description.value?.length || 0;
  });

  isDescriptionInvalid = computed(() => {
    const ctrl = this.feedbackForm.controls.description;
    return ctrl.touched && ctrl.invalid;
  });

  ngOnInit(): void {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/user/rr/login']);
      return;
    }
    this.loadMyFeedbacks();
  }

  async loadMyFeedbacks(): Promise<void> {
    this.isLoadingHistory.set(true);
    try {
      const list = await this.rrApi.getMyFeedbacks();
      this.myFeedbacks.set(list);
    } catch (err: any) {
      console.error('Failed to load submitted feedbacks:', err);
    } finally {
      this.isLoadingHistory.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private processFile(file: File): void {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Invalid file format', {
        description: 'Please upload a PNG, JPEG, or WebP screenshot.',
      });
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Image file size cannot exceed 5MB.',
      });
      return;
    }

    this.selectedImageFile.set(file);

    // Create local object URL for preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage(): void {
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.uploadedImageUrl.set(null);
    this.uploadedImageKey.set(null);
    this.uploadedImageName.set(null);
  }

  openImageModal(url: string, title: string = 'Screenshot Preview'): void {
    this.previewModalImage.set({ url, title });
  }

  closeImageModal(): void {
    this.previewModalImage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      toast.error('Validation error', {
        description: 'Please complete all required fields (description must be 10-1000 characters).',
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      let finalImageUrl: string | undefined = undefined;
      let finalImageKey: string | undefined = undefined;
      let finalImageName: string | undefined = undefined;

      // Upload image first if user picked a file
      const file = this.selectedImageFile();
      if (file) {
        this.isUploadingImage.set(true);
        try {
          const uploadRes = await this.rrApi.uploadFeedbackScreenshot(file);
          finalImageUrl = uploadRes.url;
          finalImageKey = uploadRes.key;
          finalImageName = uploadRes.originalName;
        } catch (uploadErr: any) {
          console.error('Screenshot upload error:', uploadErr);
          toast.error('Upload Failed', {
            description: 'Could not upload screenshot. Submitting without screenshot.',
          });
        } finally {
          this.isUploadingImage.set(false);
        }
      }

      const formValues = this.feedbackForm.getRawValue();
      const payload: IRRCreateFeedbackPayload = {
        page: formValues.page,
        issueType: formValues.issueType,
        description: formValues.description.trim(),
        imageUrl: finalImageUrl,
        imageKey: finalImageKey,
        imageOriginalName: finalImageName,
      };

      const res = await this.rrApi.submitFeedback(payload);

      toast.success('Feedback Submitted', {
        description: 'Your ticket has been recorded. Our development team will review it shortly!',
      });

      // Reset form
      this.feedbackForm.reset({
        page: 'dashboard',
        issueType: 'functionality',
        description: '',
      });
      this.removeSelectedImage();

      // Refresh history & switch tab to history to show submission
      await this.loadMyFeedbacks();
      this.activeTab.set('history');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      const msg = err?.error?.message || err?.message || 'Failed to submit feedback.';
      toast.error('Submission Failed', { description: msg });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getPageLabel(pageVal: string): string {
    const found = this.feedbackPages.find((p) => p.value === pageVal);
    return found ? found.label : pageVal;
  }

  getIssueTypeLabel(typeVal: string): string {
    const found = this.issueTypes.find((t) => t.value === typeVal);
    return found ? found.label : typeVal;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
