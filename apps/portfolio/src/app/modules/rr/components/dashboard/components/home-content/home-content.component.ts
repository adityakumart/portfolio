import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import {
  IRRHomePageContent,
  IRRHomeBanner,
  IRRHomeServiceItem,
  IRRHomeStatItem,
  IRRHomeContactItem,
  DEFAULT_RR_HOMEPAGE_CONTENT,
} from '@portfolio/shared-types';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSliders,
  lucidePalette,
  lucideImage,
  lucidePlus,
  lucideTrash2,
  lucideSave,
  lucideRefreshCw,
  lucideRotateCcw,
  lucideCheck,
  lucideX,
  lucideEye,
  lucideExternalLink,
  lucideLayers,
  lucideSparkles,
  lucideCar,
  lucidePhone,
  lucideMail,
  lucideMapPin,
  lucideGlobe,
  lucideArrowRight,
  lucideShieldCheck,
  lucideInfo,
  lucideMoveUp,
  lucideMoveDown,
  lucideLayoutDashboard,
} from '@ng-icons/lucide';

export type CmsTab = 'hero' | 'services' | 'about' | 'contact' | 'footer';

@Component({
  selector: 'app-rr-home-content',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmInputImports,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideSliders,
      lucidePalette,
      lucideImage,
      lucidePlus,
      lucideTrash2,
      lucideSave,
      lucideRefreshCw,
      lucideRotateCcw,
      lucideCheck,
      lucideX,
      lucideEye,
      lucideExternalLink,
      lucideLayers,
      lucideSparkles,
      lucideCar,
      lucidePhone,
      lucideMail,
      lucideMapPin,
      lucideGlobe,
      lucideArrowRight,
      lucideShieldCheck,
      lucideInfo,
      lucideMoveUp,
      lucideMoveDown,
      lucideLayoutDashboard,
    }),
  ],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.scss',
})
export class RRHomeContentAdminComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(HlmDialogService);

  @ViewChild('resetConfirmDialog') resetConfirmDialog!: TemplateRef<any>;

  // State Signals
  activeTab = signal<CmsTab>('hero');
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  isResetting = signal<boolean>(false);
  isCustomized = signal<boolean>(false);
  lastUpdatedAt = signal<string | null>(null);

  // Active banner preview index
  activePreviewBannerIndex = signal<number>(0);

  // Main Form Group
  cmsForm!: FormGroup;

  ngOnInit(): void {
    this.initForm(DEFAULT_RR_HOMEPAGE_CONTENT);
    this.loadContent();
  }

  // Navigation Tabs
  setTab(tab: CmsTab): void {
    this.activeTab.set(tab);
  }

  // --- Form Initialization ---
  private initForm(data: IRRHomePageContent): void {
    this.cmsForm = this.fb.group({
      hero: this.fb.group({
        badge: [data.hero?.badge || '', [Validators.required]],
        title: [data.hero?.title || '', [Validators.required]],
        subtitle: [data.hero?.subtitle || '', [Validators.required]],
        primaryCtaText: [data.hero?.primaryCtaText || '', [Validators.required]],
        primaryCtaLink: [data.hero?.primaryCtaLink || '', [Validators.required]],
        secondaryCtaText: [data.hero?.secondaryCtaText || ''],
        secondaryCtaLink: [data.hero?.secondaryCtaLink || ''],
        autoRotateBanners: [data.hero?.autoRotateBanners !== false],
        bannerIntervalSeconds: [
          data.hero?.bannerIntervalSeconds || 6,
          [Validators.required, Validators.min(2), Validators.max(30)],
        ],
        banners: this.fb.array([]),
      }),
      services: this.fb.group({
        tagline: [data.services?.tagline || '', [Validators.required]],
        title: [data.services?.title || '', [Validators.required]],
        description: [data.services?.description || '', [Validators.required]],
        items: this.fb.array([]),
      }),
      fleet: this.fb.group({
        tagline: [data.fleet?.tagline || 'Our Fleet', [Validators.required]],
        title: [data.fleet?.title || 'Browse by Category', [Validators.required]],
        description: [data.fleet?.description || '', [Validators.required]],
      }),
      about: this.fb.group({
        tagline: [data.about?.tagline || '', [Validators.required]],
        title: [data.about?.title || '', [Validators.required]],
        paragraphs: this.fb.array([]),
        stats: this.fb.array([]),
      }),
      contact: this.fb.group({
        tagline: [data.contact?.tagline || '', [Validators.required]],
        title: [data.contact?.title || '', [Validators.required]],
        description: [data.contact?.description || '', [Validators.required]],
        primaryPhone: [data.contact?.primaryPhone || '', [Validators.required]],
        primaryPhoneRaw: [data.contact?.primaryPhoneRaw || '', [Validators.required]],
        secondaryPhone: [data.contact?.secondaryPhone || ''],
        secondaryPhoneRaw: [data.contact?.secondaryPhoneRaw || ''],
        whatsappNumberRaw: [data.contact?.whatsappNumberRaw || '', [Validators.required]],
        items: this.fb.array([]),
      }),
      footer: this.fb.group({
        brandName: [data.footer?.brandName || 'RoadReady Rentals', [Validators.required]],
        copyrightText: [data.footer?.copyrightText || '', [Validators.required]],
      }),
    });

    // Populate Banners
    const bannersArray = this.heroBannersArray;
    bannersArray.clear();
    const banners = data.hero?.banners || DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners;
    banners.forEach((b, index) => {
      bannersArray.push(this.createBannerGroup(b, index + 1));
    });

    // Populate Services
    const servicesArray = this.serviceItemsArray;
    servicesArray.clear();
    const services = data.services?.items || DEFAULT_RR_HOMEPAGE_CONTENT.services.items;
    services.forEach((s, index) => {
      servicesArray.push(this.createServiceGroup(s, index + 1));
    });

    // Populate About Paragraphs
    const paragraphsArray = this.aboutParagraphsArray;
    paragraphsArray.clear();
    const paragraphs = data.about?.paragraphs || DEFAULT_RR_HOMEPAGE_CONTENT.about.paragraphs;
    paragraphs.forEach((p) => {
      paragraphsArray.push(this.fb.control(p, [Validators.required]));
    });

    // Populate About Stats
    const statsArray = this.aboutStatsArray;
    statsArray.clear();
    const stats = data.about?.stats || DEFAULT_RR_HOMEPAGE_CONTENT.about.stats;
    stats.forEach((st, index) => {
      statsArray.push(this.createStatGroup(st, index + 1));
    });

    // Populate Contact Items
    const contactItemsArray = this.contactItemsArray;
    contactItemsArray.clear();
    const contactItems = data.contact?.items || DEFAULT_RR_HOMEPAGE_CONTENT.contact.items;
    contactItems.forEach((c, index) => {
      contactItemsArray.push(this.createContactItemGroup(c, index + 1));
    });
  }

  // --- FormArray Getters ---
  get heroBannersArray(): FormArray {
    return this.cmsForm.get('hero.banners') as FormArray;
  }

  get serviceItemsArray(): FormArray {
    return this.cmsForm.get('services.items') as FormArray;
  }

  get aboutParagraphsArray(): FormArray {
    return this.cmsForm.get('about.paragraphs') as FormArray;
  }

  get aboutStatsArray(): FormArray {
    return this.cmsForm.get('about.stats') as FormArray;
  }

  get contactItemsArray(): FormArray {
    return this.cmsForm.get('contact.items') as FormArray;
  }

  // --- Form Group Factory Helpers ---
  private createBannerGroup(b?: Partial<IRRHomeBanner>, order: number = 1): FormGroup {
    return this.fb.group({
      id: [b?.id || `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`],
      imageUrl: [b?.imageUrl || '', [Validators.required]],
      title: [b?.title || ''],
      subtitle: [b?.subtitle || ''],
      altText: [b?.altText || 'RoadReady Rentals Banner'],
      isActive: [b?.isActive !== false],
      order: [b?.order ?? order],
    });
  }

  private createServiceGroup(s?: Partial<IRRHomeServiceItem>, order: number = 1): FormGroup {
    return this.fb.group({
      id: [s?.id || `srv-${Date.now()}`],
      title: [s?.title || '', [Validators.required]],
      description: [s?.description || '', [Validators.required]],
      icon: [s?.icon || 'lucideCar', [Validators.required]],
      hoverText: [s?.hoverText || ''],
      isActive: [s?.isActive !== false],
      order: [s?.order ?? order],
    });
  }

  private createStatGroup(st?: Partial<IRRHomeStatItem>, order: number = 1): FormGroup {
    return this.fb.group({
      id: [st?.id || `stat-${Date.now()}`],
      value: [st?.value || '', [Validators.required]],
      label: [st?.label || '', [Validators.required]],
      order: [st?.order ?? order],
    });
  }

  private createContactItemGroup(c?: Partial<IRRHomeContactItem>, order: number = 1): FormGroup {
    return this.fb.group({
      id: [c?.id || `contact-${Date.now()}`],
      type: [c?.type || 'address', [Validators.required]],
      title: [c?.title || '', [Validators.required]],
      valuesText: [(c?.values || []).join('\n'), [Validators.required]],
      icon: [c?.icon || 'lucideMapPin', [Validators.required]],
      order: [c?.order ?? order],
    });
  }

  // --- Array Manipulation Helpers ---
  addBanner(): void {
    const banners = this.heroBannersArray;
    banners.push(
      this.createBannerGroup(
        {
          imageUrl:
            'https://pub-5892202ec1784725a7afbb07173ed9c1.r2.dev/public_assets/porsche.png',
          title: 'Premium Fleet in Motion',
          subtitle: 'Effortless reservations and luxury travel comfort.',
          isActive: true,
        },
        banners.length + 1
      )
    );
    toast.success('Added new banner image slide');
  }

  removeBanner(index: number): void {
    const banners = this.heroBannersArray;
    if (banners.length <= 1) {
      toast.warning('At least one hero banner is required');
      return;
    }
    banners.removeAt(index);
    if (this.activePreviewBannerIndex() >= banners.length) {
      this.activePreviewBannerIndex.set(0);
    }
    toast.info('Removed banner slide');
  }

  moveBanner(index: number, direction: 'up' | 'down'): void {
    const banners = this.heroBannersArray;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const current = banners.at(index);
    banners.removeAt(index);
    banners.insert(targetIndex, current);
    this.activePreviewBannerIndex.set(targetIndex);
  }

  addService(): void {
    const services = this.serviceItemsArray;
    services.push(
      this.createServiceGroup(
        {
          title: 'New Rental Service',
          description: 'Custom travel solution tailored to your personal or business transit.',
          icon: 'lucideCar',
          hoverText: 'Available 24/7 with reservation desk.',
          isActive: true,
        },
        services.length + 1
      )
    );
    toast.success('Added new service card');
  }

  removeService(index: number): void {
    const services = this.serviceItemsArray;
    if (services.length <= 1) {
      toast.warning('At least one service is required');
      return;
    }
    services.removeAt(index);
  }

  addParagraph(): void {
    this.aboutParagraphsArray.push(this.fb.control('', [Validators.required]));
  }

  removeParagraph(index: number): void {
    if (this.aboutParagraphsArray.length <= 1) {
      toast.warning('At least one paragraph is required');
      return;
    }
    this.aboutParagraphsArray.removeAt(index);
  }

  // --- API Actions ---
  async loadContent(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await this.rrApi.getHomeContent();
      this.isCustomized.set(data.isCustomized ?? false);
      this.lastUpdatedAt.set(data.updatedAt || null);
      this.initForm(data);
    } catch (err: any) {
      console.error('Failed to load homepage CMS content:', err);
      toast.error('Could not load homepage content from server. Showing defaults.');
      this.initForm(DEFAULT_RR_HOMEPAGE_CONTENT);
    } finally {
      this.isLoading.set(false);
    }
  }

  async saveContent(): Promise<void> {
    if (this.cmsForm.invalid) {
      this.cmsForm.markAllAsTouched();
      toast.error('Please complete all required fields before saving.');
      return;
    }

    this.isSaving.set(true);
    try {
      const formVal = this.cmsForm.value;

      // Map contact items to parse multi-line valuesText back into values array
      const mappedContactItems: IRRHomeContactItem[] = (formVal.contact.items || []).map(
        (item: any, idx: number) => ({
          id: item.id || `contact-${idx + 1}`,
          type: item.type,
          title: item.title,
          icon: item.icon,
          order: item.order ?? idx + 1,
          values: String(item.valuesText || '')
            .split('\n')
            .map((v) => v.trim())
            .filter((v) => v.length > 0),
        })
      );

      const payload: Partial<IRRHomePageContent> = {
        isCustomized: true,
        hero: formVal.hero,
        services: formVal.services,
        fleet: formVal.fleet,
        about: formVal.about,
        contact: {
          ...formVal.contact,
          items: mappedContactItems,
        },
        footer: formVal.footer,
      };

      const res = await this.rrApi.updateHomeContent(payload);
      this.isCustomized.set(true);
      this.lastUpdatedAt.set(res.content?.updatedAt || new Date().toISOString());
      toast.success('RoadReady homepage content published successfully!');
    } catch (err: any) {
      console.error('Failed to save homepage content:', err);
      toast.error(err?.error?.message || 'Failed to save homepage content.');
    } finally {
      this.isSaving.set(false);
    }
  }

  promptResetToDefaults(): void {
    if (this.resetConfirmDialog) {
      this.dialog.open(this.resetConfirmDialog, {
        contentClass: 'max-w-md w-full p-6',
      });
    }
  }

  async confirmReset(): Promise<void> {
    this.isResetting.set(true);
    try {
      const res = await this.rrApi.resetHomeContent();
      this.isCustomized.set(false);
      this.lastUpdatedAt.set(res.content?.updatedAt || null);
      this.initForm(DEFAULT_RR_HOMEPAGE_CONTENT);
      toast.success('Homepage restored to factory defaults!');
    } catch (err: any) {
      console.error('Failed to reset content:', err);
      toast.error(err?.error?.message || 'Failed to reset homepage content.');
    } finally {
      this.isResetting.set(false);
    }
  }

  // --- Live Preview Helpers ---
  getActivePreviewBanner(): any {
    const banners = this.heroBannersArray.controls;
    const index = this.activePreviewBannerIndex();
    if (banners.length > index && banners[index]) {
      return banners[index].value;
    }
    return banners[0]?.value || DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners[0];
  }
}
