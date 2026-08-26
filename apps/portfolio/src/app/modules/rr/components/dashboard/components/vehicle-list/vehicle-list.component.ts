import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rr-vehicle-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class RRVehicleListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  @ViewChild('vehicleDetailsDialog') vehicleDetailsDialog!: TemplateRef<any>;
  @ViewChild('vehicleFormDialog') vehicleFormDialog!: TemplateRef<any>;

  // Collections data
  vehicles = signal<any[]>([]);

  // User details & checks
  currentUser = computed(() => this.rrApi.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Modals signals
  editingVehicleMode = signal<boolean>(false);

  // Selections
  selectedVehicleDetails = signal<any | null>(null);

  // Forms
  vehicleFormGroup!: FormGroup;
  vehicleImageInputUrl = '';

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
      width: '600px',
      maxWidth: '90vw'
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
    this.vehicleFormGroup.reset({
      seating: '5',
      fuelType: 'Petrol',
      status: 'available'
    });
    this.dialog.open(this.vehicleFormDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });
  }

  openEditVehicleModal() {
    const v = this.selectedVehicleDetails();
    if (!v) return;

    this.dialog.closeAll();
    this.editingVehicleMode.set(true);

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
    this.dialog.open(this.vehicleFormDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh'
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
}
