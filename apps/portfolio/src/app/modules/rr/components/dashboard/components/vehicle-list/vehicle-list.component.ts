import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { RRApiService } from '../../../../services/rr-api.service';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmDatePickerImports } from '@spartan-ng/hel/date-picker';
import { toast } from '@spartan-ng/hel/sonner';
import { IVehicle } from '@portfolio/shared-types';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { IndianDatePipe, toISODateString, IndianDateInput } from '../../../../../../shared/pipes/indian-date.pipe';
import {
  lucideCar,
  lucidePlus,
  lucideUsers,
  lucideFuel,
  lucideGauge,
  lucidePencil,
  lucideTrash2,
  lucideInfo,
  lucideFingerprint,
  lucideShieldCheck,
  lucideShield,
  lucideLeaf,
  lucideCreditCard,
  lucideMilestone,
  lucideClock,
  lucideMoreHorizontal,
  lucideUploadCloud,
  lucideCheckCircle,
  lucideAlertCircle,
  lucideCheck,
  lucideSearchX,
  lucideX,
  lucideGripVertical,
  lucideStar,
  lucideImage,
} from '@ng-icons/lucide';
import { RRVehicleCardComponent, RRVehicleImageCarouselComponent } from '../../../../shared';

export type SeatingFilter = 'all' | '5' | '7';

export interface VehicleImageItem {
  id: string;
  url: string;
  isPrimary: boolean;
  fileName?: string;
  isUploading?: boolean;
}

@Component({
  selector: 'app-rr-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmBadgeImports,
    HlmDatePickerImports,
    IndianDatePipe,
    NgIconComponent,
    RRVehicleCardComponent,
    RRVehicleImageCarouselComponent,
  ],
  providers: [
    provideIcons({
      lucideCar,
      lucidePlus,
      lucideUsers,
      lucideFuel,
      lucideGauge,
      lucidePencil,
      lucideTrash2,
      lucideInfo,
      lucideFingerprint,
      lucideShieldCheck,
      lucideShield,
      lucideLeaf,
      lucideCreditCard,
      lucideMilestone,
      lucideClock,
      lucideMoreHorizontal,
      lucideUploadCloud,
      lucideCheckCircle,
      lucideAlertCircle,
      lucideCheck,
      lucideSearchX,
      lucideX,
      lucideGripVertical,
      lucideStar,
      lucideImage,
    }),
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class RRVehicleListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(HlmDialogService);

  @ViewChild('vehicleDetailsDialog') vehicleDetailsDialog!: TemplateRef<any>;
  @ViewChild('vehicleFormDialog') vehicleFormDialog!: TemplateRef<any>;

  // Collections data
  vehicles = signal<IVehicle[]>([]);

  // Seating filter: 'all', '5', or '7'
  selectedSeating = signal<SeatingFilter>('all');

  // Filtered lists for seating capacities
  vehicles5Seater = computed(() => this.vehicles().filter((v) => !v.seating || String(v.seating) === '5'));
  vehicles7Seater = computed(() => this.vehicles().filter((v) => String(v.seating) === '7'));
  vehiclesOtherSeater = computed(() => this.vehicles().filter((v) => v.seating && String(v.seating) !== '5' && String(v.seating) !== '7'));

  // Counts
  totalCount = computed(() => this.vehicles().length);
  count5Seater = computed(() => this.vehicles5Seater().length);
  count7Seater = computed(() => this.vehicles7Seater().length);

  setSeatingFilter(filter: SeatingFilter) {
    this.selectedSeating.set(filter);
  }

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Modals signals
  editingVehicleMode = signal<boolean>(false);

  // Selections
  selectedVehicleDetails = signal<IVehicle | null>(null);

  // Forms
  vehicleFormGroup!: FormGroup;

  // Multi-image state
  uploadedImages = signal<VehicleImageItem[]>([]);
  isUploading = signal<boolean>(false);
  uploadError = signal<string | null>(null);
  uploadProgress = signal<number>(0);

  resetUploadState() {
    this.isUploading.set(false);
    this.uploadError.set(null);
    this.uploadProgress.set(0);
  }

  ngOnInit() {
    this.initForms();
    this.loadVehicles();
  }

  private initForms() {
    this.vehicleFormGroup = this.fb.group({
      regNo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9 -]+$/)]],
      name: ['', Validators.required],
      manufacturer: ['', Validators.required],
      model: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{2}$/)]],
      seating: ['5', Validators.required],
      odometer: ['', [Validators.required, Validators.min(0)]],
      type: ['', Validators.required],
      color: ['', Validators.required],
      fuelType: ['Petrol', Validators.required],
      engineNo: ['', Validators.required],
      chassisNo: ['', Validators.required],
      insuranceExpiry: ['', Validators.required],
      pollutionExpiry: ['', Validators.required],
      status: ['available', Validators.required],
      pricing: this.fb.group({
        h23: this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h11: this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h3:  this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] }),
        h1:  this.fb.group({ price: ['', [Validators.required, Validators.min(0)]], km: ['', [Validators.required, Validators.min(0)]] })
      }),
      extraKmPrice: ['', [Validators.required, Validators.min(0)]],
      extraHourPrice: ['', [Validators.required, Validators.min(0)]]
    });
  }

  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.error?.message || 'Error loading vehicles.');
    }
  }

  getVehicleImage(v: IVehicle | null): string {
    if (v && v.images && v.images.length > 0) {
      return v.images[0];
    }
    return 'https://via.placeholder.com/150';
  }

  // --- VIEW DETAILS MODAL ---
  viewVehicleDetails(v: any) {
    this.selectedVehicleDetails.set(v);
    this.dialog.open(this.vehicleDetailsDialog, {
      contentClass: 'max-w-xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  closeVehicleDetailsPopup() {
    this.dialog.closeAll();
    this.selectedVehicleDetails.set(null);
  }

  // --- ADD/EDIT MODALS ---
  openAddVehicleModal() {
    this.editingVehicleMode.set(false);
    this.uploadedImages.set([]);
    this.resetUploadState();
    this.vehicleFormGroup.reset({
      seating: '5',
      fuelType: 'Petrol',
      status: 'available'
    });
    this.dialog.open(this.vehicleFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  onEditVehicle(v: IVehicle) {
    this.selectedVehicleDetails.set(v);
    this.openEditVehicleModal();
  }

  openEditVehicleModal() {
    const v = this.selectedVehicleDetails();
    if (!v) return;

    this.dialog.closeAll();
    this.editingVehicleMode.set(true);
    this.resetUploadState();

    this.vehicleFormGroup.reset({
      regNo: v.regNo,
      name: v.name,
      manufacturer: v.manufacturer,
      model: v.model,
      seating: v.seating || '5',
      odometer: v.odometer,
      type: v.type,
      color: v.color,
      fuelType: v.fuelType || 'Petrol',
      engineNo: v.engineNo,
      chassisNo: v.chassisNo,
      insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry) : null,
      pollutionExpiry: v.pollutionExpiry ? new Date(v.pollutionExpiry) : null,
      status: v.status || 'available',
      extraKmPrice: v.extraKmPrice,
      extraHourPrice: v.extraHourPrice
    });

    const pricingGroup = this.vehicleFormGroup.get('pricing') as FormGroup;
    pricingGroup.patchValue({
      h23: { price: v.pricing?.h23?.price || '', km: v.pricing?.h23?.km || '' },
      h11: { price: v.pricing?.h11?.price || '', km: v.pricing?.h11?.km || '' },
      h3:  { price: v.pricing?.h3?.price || '',  km: v.pricing?.h3?.km || '' },
      h1:  { price: v.pricing?.h1?.price || '',  km: v.pricing?.h1?.km || '' }
    });

    const existingImages: VehicleImageItem[] = (v.images || [])
      .filter((img) => typeof img === 'string' && img.trim().length > 0)
      .map((url, idx) => ({
        id: `img-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        url,
        isPrimary: idx === 0,
        fileName: `Photo ${idx + 1}`
      }));

    this.uploadedImages.set(existingImages);

    this.dialog.open(this.vehicleFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  closeVehicleFormModal() {
    this.dialog.closeAll();
    this.selectedVehicleDetails.set(null);
    this.uploadedImages.set([]);
    this.resetUploadState();
  }

  async saveVehicle(e: Event) {
    e.preventDefault();
    if (this.vehicleFormGroup.invalid) return;

    const formVal = this.vehicleFormGroup.value;
    const imagesList = this.uploadedImages().map((item) => item.url).filter(Boolean);
    const payload = {
      ...formVal,
      insuranceExpiry: toISODateString(formVal.insuranceExpiry as IndianDateInput),
      pollutionExpiry: toISODateString(formVal.pollutionExpiry as IndianDateInput),
      images: imagesList.length > 0
        ? imagesList
        : [`assets/rr/${formVal.name?.toLowerCase()}.png`]
    };

    try {
      if (this.editingVehicleMode()) {
        await this.rrApi.updateVehicle(payload.regNo, payload);
        toast.success('Vehicle updated successfully.');
      } else {
        await this.rrApi.createVehicle(payload);
        toast.success('Vehicle added successfully.');
      }
      this.closeVehicleFormModal();
      this.loadVehicles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.error?.message || 'Error saving vehicle.');
    }
  }

  async deleteVehicle(regNo: string) {
    if (!confirm(`Are you sure you want to delete vehicle ${regNo}?`)) return;

    try {
      await this.rrApi.deleteVehicle(regNo);
      toast.success('Vehicle deleted successfully.');
      this.closeVehicleFormModal();
      this.loadVehicles();
    } catch (err: any) {
      console.error(err);
      toast.error(err.error?.message || 'Error deleting vehicle.');
    }
  }

  // --- REORDERING & IMAGE MANAGEMENT ---
  onImageReordered(event: CdkDragDrop<VehicleImageItem[]>) {
    const list = [...this.uploadedImages()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    const updated = list.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
    }));
    this.uploadedImages.set(updated);
  }

  setPrimaryImage(index: number) {
    const list = [...this.uploadedImages()];
    if (index <= 0 || index >= list.length) return;
    const [selected] = list.splice(index, 1);
    list.unshift(selected);
    const updated = list.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
    }));
    this.uploadedImages.set(updated);
    toast.success('Image set as primary cover.');
  }

  removeImage(index: number) {
    const list = [...this.uploadedImages()];
    if (index < 0 || index >= list.length) return;
    list.splice(index, 1);
    const updated = list.map((item, idx) => ({
      ...item,
      isPrimary: idx === 0,
    }));
    this.uploadedImages.set(updated);
  }

  clearAllImages() {
    this.uploadedImages.set([]);
    this.resetUploadState();
  }

  // --- MULTI-FILE UPLOAD PROCESSING ---
  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    input.value = '';
    await this.processFiles(files);
  }

  async onFilesDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      await this.processFiles(files);
    }
  }

  private async processFiles(files: File[]) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        errors.push(`"${file.name}": Only JPEG, PNG, and WebP images are allowed.`);
        continue;
      }
      if (file.size > maxSize) {
        errors.push(`"${file.name}": Size exceeds the 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (errors.length > 0) {
      this.uploadError.set(errors.join(' '));
      toast.error(errors[0]);
    } else {
      this.uploadError.set(null);
    }

    if (validFiles.length === 0) return;

    // Create temporary optimistic items with local object URL preview
    const startIndex = this.uploadedImages().length;
    const tempItems: VehicleImageItem[] = validFiles.map((file, i) => ({
      id: `temp-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      url: URL.createObjectURL(file),
      fileName: file.name,
      isPrimary: startIndex === 0 && i === 0,
      isUploading: true,
    }));

    this.uploadedImages.update((curr) => [...curr, ...tempItems]);

    try {
      this.isUploading.set(true);
      this.uploadProgress.set(25);

      const res = await this.rrApi.uploadVehicleImages(validFiles);

      this.uploadProgress.set(100);

      const returnedAssets = res.images || [];

      this.uploadedImages.update((current) => {
        let uploadedIdx = 0;
        return current.map((item) => {
          if (item.isUploading) {
            const uploadedAsset = returnedAssets[uploadedIdx++];
            const resolvedUrl = uploadedAsset?.url || item.url;
            return {
              ...item,
              url: resolvedUrl,
              isUploading: false,
            };
          }
          return item;
        });
      });

      toast.success(`${validFiles.length} ${validFiles.length === 1 ? 'image' : 'images'} uploaded successfully.`);
    } catch (err: any) {
      console.error(err);
      this.uploadError.set(err.error?.message || 'Failed to upload images. Please try again.');
      // Remove temporary items that failed
      this.uploadedImages.update((current) => current.filter((item) => !item.isUploading));
      toast.error('Failed to upload image(s).');
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
    }
  }
}
