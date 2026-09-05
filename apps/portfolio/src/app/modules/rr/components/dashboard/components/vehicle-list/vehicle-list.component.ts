import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { IVehicle } from '@portfolio/shared-types';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
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
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rr-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmBadgeImports,
    NgIconComponent,
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

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Modals signals
  editingVehicleMode = signal<boolean>(false);

  // Selections
  selectedVehicleDetails = signal<IVehicle | null>(null);

  // Forms
  vehicleFormGroup!: FormGroup;
  vehicleImageInputUrl = '';

  // File Upload State
  isUploading = signal<boolean>(false);
  uploadError = signal<string | null>(null);
  selectedFileName = signal<string | null>(null);
  uploadProgress = signal<number>(0);
  previewUrl = signal<string | null>(null);

  resetUploadState() {
    this.isUploading.set(false);
    this.uploadError.set(null);
    this.selectedFileName.set(null);
    this.uploadProgress.set(0);
    this.previewUrl.set(null);
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

  // --- RETRIEVALS ---
  async loadVehicles() {
    try {
      const data = await this.rrApi.getVehicles();
      this.vehicles.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  getVehicleImage(v: any): string {
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
    this.vehicleImageInputUrl = '';
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
      insuranceExpiry: v.insuranceExpiry,
      pollutionExpiry: v.pollutionExpiry,
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

    this.vehicleImageInputUrl = v.images && v.images.length > 0 ? v.images[0] : '';
    if (this.vehicleImageInputUrl && !this.vehicleImageInputUrl.startsWith('assets/')) {
      this.previewUrl.set(this.vehicleImageInputUrl);
      this.selectedFileName.set('Current vehicle image');
    }
    this.dialog.open(this.vehicleFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  closeVehicleFormModal() {
    this.dialog.closeAll();
    this.selectedVehicleDetails.set(null);
  }

  async saveVehicle(e: Event) {
    e.preventDefault();
    if (this.vehicleFormGroup.invalid) return;

    const payload = {
      ...this.vehicleFormGroup.value,
      images: this.vehicleImageInputUrl.trim() 
        ? [this.vehicleImageInputUrl.trim()] 
        : [`assets/rr/${this.vehicleFormGroup.value.name.toLowerCase()}.png`]
    };

    try {
      if (this.editingVehicleMode()) {
        await this.rrApi.updateVehicle(payload.regNo, payload);
        alert('Vehicle updated successfully.');
      } else {
        await this.rrApi.createVehicle(payload);
        alert('Vehicle added successfully.');
      }
      this.closeVehicleFormModal();
      this.loadVehicles();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error saving vehicle.');
    }
  }

  async deleteVehicle(regNo: string) {
    if (!confirm(`Are you sure you want to delete vehicle ${regNo}?`)) return;

    try {
      await this.rrApi.deleteVehicle(regNo);
      alert('Vehicle deleted successfully.');
      this.closeVehicleFormModal();
      this.loadVehicles();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error deleting vehicle.');
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // File Validation: Limit to images only
    if (!file.type.startsWith('image/')) {
      this.uploadError.set('Only image files (PNG, JPG, JPEG, WEBP) are allowed.');
      return;
    }

    // File Validation: Limit to 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.uploadError.set('File size exceeds the 5MB limit.');
      return;
    }

    this.uploadError.set(null);
    this.selectedFileName.set(file.name);

    // Create a local object URL for instant preview
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      this.isUploading.set(true);
      this.uploadProgress.set(20);
      
      const response = await this.rrApi.uploadVehicleImage(file);
      
      this.uploadProgress.set(100);
      // Save the permanent URL in vehicleImageInputUrl (which gets sent in form payload)
      this.vehicleImageInputUrl = response.url;
      
      // Update preview to use resolved URL
      this.previewUrl.set(response.url);
    } catch (err: any) {
      console.error(err);
      this.uploadError.set(err.error?.message || 'Failed to upload image. Please try again.');
      this.previewUrl.set(null);
      this.selectedFileName.set(null);
    } finally {
      this.isUploading.set(false);
      // Reset input element value so same file can be selected again if cleared
      input.value = '';
    }
  }

  clearSelectedImage() {
    this.resetUploadState();
    this.vehicleImageInputUrl = '';
  }
}
