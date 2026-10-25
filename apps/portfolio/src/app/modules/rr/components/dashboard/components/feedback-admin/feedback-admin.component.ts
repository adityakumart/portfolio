import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RRApiService } from '../../../../services/rr-api.service';
import {
  IRRFeedback,
  RRFeedbackStatus,
  RRFeedbackPage,
  RRFeedbackIssueType,
  IRRFeedbackStats,
  RR_FEEDBACK_PAGES,
  RR_FEEDBACK_ISSUE_TYPES,
  RR_FEEDBACK_STATUSES,
  IRRUpdateFeedbackStatusPayload,
} from '@portfolio/shared-types';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMessageSquareCheck,
  lucideSearch,
  lucideRefreshCw,
  lucideFilter,
  lucideCheckCircle2,
  lucideClock,
  lucidePauseCircle,
  lucideCheckCheck,
  lucideAlertCircle,
  lucideImage,
  lucideExternalLink,
  lucideTrash2,
  lucideX,
  lucideCheck,
  lucideInfo,
  lucideSliders,
  lucideUser,
  lucideArrowUpDown,
  lucideShieldCheck,
  lucideEye,
  lucideLayers,
  lucideInbox,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rr-feedback-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmBadgeImports,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideMessageSquareCheck,
      lucideSearch,
      lucideRefreshCw,
      lucideFilter,
      lucideCheckCircle2,
      lucideClock,
      lucidePauseCircle,
      lucideCheckCheck,
      lucideAlertCircle,
      lucideImage,
      lucideExternalLink,
      lucideTrash2,
      lucideX,
      lucideCheck,
      lucideInfo,
      lucideSliders,
      lucideUser,
      lucideArrowUpDown,
      lucideShieldCheck,
      lucideEye,
      lucideLayers,
      lucideInbox,
    }),
  ],
  templateUrl: './feedback-admin.component.html',
  styleUrl: './feedback-admin.component.scss',
})
export class RRFeedbackAdminComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private router = inject(Router);

  // Auth & Permissions
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Taxonomy
  feedbackPages = RR_FEEDBACK_PAGES;
  issueTypes = RR_FEEDBACK_ISSUE_TYPES;
  feedbackStatuses = RR_FEEDBACK_STATUSES;

  // Data State
  feedbacks = signal<IRRFeedback[]>([]);
  stats = signal<IRRFeedbackStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    onHold: 0,
    completed: 0,
    closed: 0,
  });
  isLoading = signal<boolean>(false);
  isUpdating = signal<boolean>(false);

  // Filters
  selectedStatus = signal<string>('all');
  selectedPage = signal<string>('all');
  selectedIssueType = signal<string>('all');
  searchQuery = signal<string>('');

  // Modals
  previewModalImage = signal<{ url: string; title: string } | null>(null);
  activeNotesModal = signal<{
    ticket: IRRFeedback;
    notes: string;
    newStatus: RRFeedbackStatus;
  } | null>(null);

  // Filtered feedbacks
  filteredFeedbacks = computed(() => {
    let list = this.feedbacks();
    const status = this.selectedStatus();
    const page = this.selectedPage();
    const type = this.selectedIssueType();
    const q = this.searchQuery().trim().toLowerCase();

    if (status !== 'all') {
      list = list.filter((f) => f.status === status);
    }
    if (page !== 'all') {
      list = list.filter((f) => f.page === page);
    }
    if (type !== 'all') {
      list = list.filter((f) => f.issueType === type);
    }
    if (q) {
      list = list.filter(
        (f) =>
          f.id.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.user.name.toLowerCase().includes(q) ||
          f.user.id.toLowerCase().includes(q) ||
          f.user.email.toLowerCase().includes(q) ||
          (f.adminNotes && f.adminNotes.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    if (!this.rrApi.currentUser()) {
      this.router.navigate(['/user/rr/login']);
      return;
    }
    if (this.rrApi.currentUser()?.role !== 'admin') {
      toast.error('Access Denied', {
        description: 'Administrator privileges are required to view this management console.',
      });
      this.router.navigate(['/user/rr/dashboard']);
      return;
    }

    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [feedbacksRes, statsRes] = await Promise.all([
        this.rrApi.getAllFeedbacks(),
        this.rrApi.getFeedbackStats(),
      ]);
      this.feedbacks.set(feedbacksRes.data);
      this.stats.set(statsRes);
    } catch (err: any) {
      console.error('Failed to load feedback admin data:', err);
      toast.error('Load Failed', {
        description: err?.error?.message || 'Unable to fetch feedback data.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
  }

  openImageModal(url: string, title: string = 'Screenshot Inspection'): void {
    this.previewModalImage.set({ url, title });
  }

  closeImageModal(): void {
    this.previewModalImage.set(null);
  }

  openNotesModal(ticket: IRRFeedback, newStatus?: RRFeedbackStatus): void {
    this.activeNotesModal.set({
      ticket,
      notes: ticket.adminNotes || '',
      newStatus: newStatus || ticket.status,
    });
  }

  closeNotesModal(): void {
    this.activeNotesModal.set(null);
  }

  async saveStatusWithNotes(): Promise<void> {
    const modal = this.activeNotesModal();
    if (!modal) return;

    this.isUpdating.set(true);
    try {
      const payload: IRRUpdateFeedbackStatusPayload = {
        status: modal.newStatus,
        adminNotes: modal.notes.trim(),
      };

      const res = await this.rrApi.updateFeedbackStatus(modal.ticket.id, payload);

      toast.success('Status Updated', {
        description: `Feedback ${modal.ticket.id} marked as "${modal.newStatus}".`,
      });

      // Update local state directly
      const updatedList = this.feedbacks().map((item) =>
        item.id === modal.ticket.id ? res.data : item
      );
      this.feedbacks.set(updatedList);

      // Refresh stats
      const stats = await this.rrApi.getFeedbackStats();
      this.stats.set(stats);

      this.closeNotesModal();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      toast.error('Update Failed', {
        description: err?.error?.message || 'Could not update feedback status.',
      });
    } finally {
      this.isUpdating.set(false);
    }
  }

  async quickUpdateStatus(ticket: IRRFeedback, status: RRFeedbackStatus): Promise<void> {
    if (ticket.status === status) return;

    this.isUpdating.set(true);
    try {
      const res = await this.rrApi.updateFeedbackStatus(ticket.id, {
        status,
        adminNotes: ticket.adminNotes,
      });

      toast.success('Status Updated', {
        description: `Ticket ${ticket.id} transitioned to "${status}".`,
      });

      const updatedList = this.feedbacks().map((item) =>
        item.id === ticket.id ? res.data : item
      );
      this.feedbacks.set(updatedList);

      const stats = await this.rrApi.getFeedbackStats();
      this.stats.set(stats);
    } catch (err: any) {
      console.error('Quick status update failed:', err);
      toast.error('Update Failed', {
        description: err?.error?.message || 'Failed to update status.',
      });
    } finally {
      this.isUpdating.set(false);
    }
  }

  async deleteFeedback(ticket: IRRFeedback): Promise<void> {
    if (!confirm(`Are you sure you want to permanently delete feedback ticket ${ticket.id}?`)) {
      return;
    }

    this.isUpdating.set(true);
    try {
      await this.rrApi.deleteFeedback(ticket.id);
      toast.success('Feedback Deleted', {
        description: `Ticket ${ticket.id} has been removed.`,
      });

      this.feedbacks.set(this.feedbacks().filter((f) => f.id !== ticket.id));
      const stats = await this.rrApi.getFeedbackStats();
      this.stats.set(stats);
    } catch (err: any) {
      console.error('Delete feedback failed:', err);
      toast.error('Delete Failed', {
        description: err?.error?.message || 'Could not delete feedback.',
      });
    } finally {
      this.isUpdating.set(false);
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
