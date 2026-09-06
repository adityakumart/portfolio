import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { IEmployee } from '@portfolio/shared-types';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucidePlus,
  lucidePencil,
  lucideBadgeCheck,
  lucideContact,
  lucideCheck,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-rr-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmTableImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucidePlus,
      lucidePencil,
      lucideBadgeCheck,
      lucideContact,
      lucideCheck,
    }),
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class RREmployeeListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(HlmDialogService);

  @ViewChild('employeeFormDialog') employeeFormDialog!: TemplateRef<any>;

  // Collections data
  employees = signal<IEmployee[]>([]);

  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);

  pagedEmployees = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.employees().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.employees().length / this.pageSize()) || 1);

  // Modals signals
  editingEmployeeMode = signal<boolean>(false);

  // Forms
  employeeFormGroup!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadEmployees();
  }

  private initForms() {
    this.employeeFormGroup = this.fb.group({
      id: [''],
      firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]],
      dob: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      altPhone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      dl: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{16}$/)]],
      role: ['employee', Validators.required],
      allowLogin: [true],
      address: ['', Validators.required]
    });
  }

  // --- RETRIEVALS ---
  async loadEmployees() {
    try {
      const data = await this.rrApi.getEmployees();
      this.employees.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  // --- ADD/EDIT MODALS ---
  openAddEmployeeModal() {
    this.editingEmployeeMode.set(false);
    this.employeeFormGroup.reset({
      role: 'employee',
      allowLogin: true
    });
    this.dialog.open(this.employeeFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  openEditEmployeeModal(e: IEmployee) {
    this.editingEmployeeMode.set(true);
    this.employeeFormGroup.reset({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      dob: e.dob ? new Date(e.dob).toISOString().split('T')[0] : '',
      phone: e.phone,
      altPhone: e.altPhone,
      email: e.email,
      aadhar: e.aadhar,
      dl: e.dl,
      role: e.role,
      allowLogin: e.allowLogin,
      address: e.address
    });
    this.dialog.open(this.employeeFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  closeEmployeeFormModal() {
    this.dialog.closeAll();
  }

  async saveEmployee(e: Event) {
    e.preventDefault();
    if (this.employeeFormGroup.invalid) return;

    const payload = this.employeeFormGroup.value;

    try {
      if (this.editingEmployeeMode()) {
        await this.rrApi.updateEmployee(payload.id, payload);
        toast.success('Employee details updated.');
      } else {
        await this.rrApi.createEmployee(payload);
        toast.success('Employee registered successfully.');
      }
      this.closeEmployeeFormModal();
      this.loadEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed.');
    }
  }

  // Pagination controls
  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }
}
