import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import {
  IRRAnnouncementItem,
  IRRScrollingTicker,
  RRAnnouncementCategory,
} from '@portfolio/shared-types';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMegaphone,
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideCheck,
  lucideX,
  lucideEye,
  lucideEyeOff,
  lucideGift,
  lucideSparkles,
  lucideShield,
  lucideBell,
  lucideCalendar,
  lucideTag,
  lucideSave,
  lucideRefreshCw,
  lucideExternalLink,
  lucidePhone,
  lucideSliders,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rr-announcements',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideMegaphone,
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideCheck,
      lucideX,
      lucideEye,
      lucideEyeOff,
      lucideGift,
      lucideSparkles,
      lucideShield,
      lucideBell,
      lucideCalendar,
      lucideTag,
      lucideSave,
      lucideRefreshCw,
      lucideExternalLink,
      lucidePhone,
      lucideSliders,
    }),
  ],
  templateUrl: './announcements.component.html',
  styleUrl: './announcements.component.scss',
})
export class RRAnnouncementsComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(HlmDialogService);

  @ViewChild('announcementFormDialog') announcementFormDialog!: TemplateRef<any>;
  @ViewChild('deleteConfirmDialog') deleteConfirmDialog!: TemplateRef<any>;

  // State
  isLoading = signal<boolean>(false);
  isSavingTicker = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  ticker = signal<IRRScrollingTicker>({
    message: '',
    badgeText: 'ANNOUNCEMENT',
    isActive: true,
    speed: 'normal',
    linkText: 'Explore Offers',
    linkUrl: '#announcements',
  });

  items = signal<IRRAnnouncementItem[]>([]);
  activeCategoryFilter = signal<string>('all');
  activeStatusFilter = signal<string>('all');
  searchQuery = signal<string>('');

  // Editing state
  editingItem = signal<IRRAnnouncementItem | null>(null);
  itemToDelete = signal<IRRAnnouncementItem | null>(null);

  // Forms
  tickerForm!: FormGroup;
  itemForm!: FormGroup;

  // Filtered computed list
  filteredItems = computed(() => {
    let list = this.items();
    const cat = this.activeCategoryFilter();
    const status = this.activeStatusFilter();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== 'all') {
      list = list.filter((i) => i.category === cat);
    }

    if (status === 'active') {
      list = list.filter((i) => i.isActive === true);
    } else if (status === 'inactive') {
      list = list.filter((i) => i.isActive === false);
    }

    if (query) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          (i.tag && i.tag.toLowerCase().includes(query)) ||
          (i.promoCode && i.promoCode.toLowerCase().includes(query))
      );
    }

    return list;
  });

  // Summary counts
  counts = computed(() => {
    const all = this.items();
    return {
      total: all.length,
      active: all.filter((i) => i.isActive).length,
      offers: all.filter((i) => i.category === 'offer').length,
      intimations: all.filter((i) => i.category === 'intimation').length,
      festivals: all.filter((i) => i.category === 'festival').length,
    };
  });

  ngOnInit() {
    this.initForms();
    this.loadData();
  }

  private initForms() {
    this.tickerForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]],
      badgeText: ['ANNOUNCEMENT', [Validators.required, Validators.maxLength(30)]],
      speed: ['normal', Validators.required],
      linkText: [''],
      linkUrl: [''],
      isActive: [true],
    });

    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      category: ['offer', Validators.required],
      tag: [''],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      promoCode: [''],
      discountText: [''],
      validUntil: [''],
      ctaText: [''],
      ctaAction: ['call'],
      ctaLink: [''],
      priority: [0, [Validators.min(0), Validators.max(100)]],
      isActive: [true],
    });
  }

  async loadData() {
    this.isLoading.set(true);
    try {
      const res = await this.rrApi.getAnnouncements();
      if (res.ticker) {
        this.ticker.set(res.ticker);
        this.tickerForm.patchValue({
          message: res.ticker.message || '',
          badgeText: res.ticker.badgeText || 'ANNOUNCEMENT',
          speed: res.ticker.speed || 'normal',
          linkText: res.ticker.linkText || '',
          linkUrl: res.ticker.linkUrl || '',
          isActive: res.ticker.isActive !== false,
        });
      }
      this.items.set(res.items || []);
    } catch (err: any) {
      console.error('Failed to load announcements data:', err);
      toast.error('Failed to load announcements');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Save Ticker
  async onSaveTicker() {
    if (this.tickerForm.invalid) {
      this.tickerForm.markAllAsTouched();
      toast.error('Please fix invalid ticker fields');
      return;
    }

    this.isSavingTicker.set(true);
    try {
      const formVal = this.tickerForm.value;
      const res = await this.rrApi.updateTicker(formVal);
      this.ticker.set(res.ticker);
      toast.success('Homepage scrolling ticker updated successfully');
    } catch (err: any) {
      console.error('Error saving ticker:', err);
      toast.error(err?.error?.message || 'Failed to update ticker');
    } finally {
      this.isSavingTicker.set(false);
    }
  }

  // Open Add Modal
  openAddModal() {
    this.editingItem.set(null);
    this.itemForm.reset({
      title: '',
      category: 'offer',
      tag: '',
      description: '',
      promoCode: '',
      discountText: '',
      validUntil: '',
      ctaText: 'Claim Offer',
      ctaAction: 'call',
      ctaLink: '+91 9494873336',
      priority: 0,
      isActive: true,
    });
    this.dialog.open(this.announcementFormDialog, {
      contentClass: 'max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-y-auto',
    });
  }

  // Open Edit Modal
  openEditModal(item: IRRAnnouncementItem) {
    this.editingItem.set(item);
    this.itemForm.reset({
      title: item.title,
      category: item.category,
      tag: item.tag || '',
      description: item.description,
      promoCode: item.promoCode || '',
      discountText: item.discountText || '',
      validUntil: item.validUntil ? item.validUntil.substring(0, 10) : '',
      ctaText: item.ctaText || '',
      ctaAction: item.ctaAction || 'call',
      ctaLink: item.ctaLink || '',
      priority: item.priority || 0,
      isActive: item.isActive !== false,
    });
    this.dialog.open(this.announcementFormDialog, {
      contentClass: 'max-w-2xl w-full p-6 max-h-[90vh] flex flex-col overflow-y-auto',
    });
  }

  // Save Item (Create or Update)
  async onSaveItem(dialogRef: any) {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      toast.error('Please fill in all required fields');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.itemForm.value;
    const editing = this.editingItem();

    try {
      if (editing && editing._id) {
        await this.rrApi.updateAnnouncement(String(editing._id), formVal);
        toast.success('Announcement updated successfully');
      } else {
        await this.rrApi.createAnnouncement(formVal);
        toast.success('Announcement created successfully');
      }
      dialogRef.close();
      await this.loadData();
    } catch (err: any) {
      console.error('Error saving announcement:', err);
      toast.error(err?.error?.message || 'Failed to save announcement');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Inline Status Toggle
  async toggleItemStatus(item: IRRAnnouncementItem) {
    if (!item._id) return;
    const currentStatus = item.isActive;
    const newStatus = !currentStatus;

    // Optimistic update
    this.items.update((list) =>
      list.map((i) => (i._id === item._id ? { ...i, isActive: newStatus } : i))
    );

    try {
      await this.rrApi.toggleAnnouncement(String(item._id), newStatus);
      toast.success(
        `Announcement ${newStatus ? 'activated' : 'deactivated'} for homepage`
      );
    } catch (err) {
      // Revert on error
      this.items.update((list) =>
        list.map((i) => (i._id === item._id ? { ...i, isActive: currentStatus } : i))
      );
      toast.error('Failed to update status');
    }
  }

  // Confirm Delete
  confirmDelete(item: IRRAnnouncementItem) {
    this.itemToDelete.set(item);
    this.dialog.open(this.deleteConfirmDialog, {
      contentClass: 'max-w-md w-full p-6',
    });
  }

  // Delete Action
  async onDeleteItem(dialogRef: any) {
    const item = this.itemToDelete();
    if (!item || !item._id) return;

    this.isSubmitting.set(true);
    try {
      await this.rrApi.deleteAnnouncement(String(item._id));
      toast.success(`Deleted announcement "${item.title}"`);
      dialogRef.close();
      this.itemToDelete.set(null);
      await this.loadData();
    } catch (err: any) {
      console.error('Error deleting announcement:', err);
      toast.error(err?.error?.message || 'Failed to delete announcement');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getCategoryBadgeClass(category: RRAnnouncementCategory): string {
    switch (category) {
      case 'offer':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'festival':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'intimation':
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  }
}
