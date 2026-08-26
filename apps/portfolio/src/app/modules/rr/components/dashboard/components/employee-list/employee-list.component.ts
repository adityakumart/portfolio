import { Component, OnInit, inject, signal, ViewChild, TemplateRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-rr-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class RREmployeeListComponent implements OnInit {
  private rrApi = inject(RRApiService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  @ViewChild('employeeFormDialog') employeeFormDialog!: TemplateRef<any>;

  // MatTable Configuration
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = [
    'id',
    'name',
    'role',
    'dob',
    'phone',
    'email',
    'allowLogin',
    'actions',
  ];

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  constructor() {
    effect(() => {
      this.dataSource.data = this.employees();
    });
  }

  // Collections data
  employees = signal<any[]>([]);

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
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });
  }

  openEditEmployeeModal(emp: any) {
    this.editingEmployeeMode.set(true);
    this.employeeFormGroup.reset({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      dob: emp.dob,
      phone: emp.phone,
      altPhone: emp.altPhone || '',
      email: emp.email,
      aadhar: emp.aadhar,
      dl: emp.dl,
      role: emp.role || 'employee',
      allowLogin: emp.allowLogin !== undefined ? emp.allowLogin : true,
      address: emp.address
    });
    this.dialog.open(this.employeeFormDialog, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh'
    });
  }

  closeEmployeeFormModal() {
    this.dialog.closeAll();
  }

  async saveEmployee(e: Event) {
    e.preventDefault();
    if (this.employeeFormGroup.invalid) return;

    try {
      if (this.editingEmployeeMode()) {
        const id = this.employeeFormGroup.value.id;
        await this.rrApi.updateEmployee(id, this.employeeFormGroup.value);
        alert('Employee updated successfully.');
      } else {
        await this.rrApi.createEmployee(this.employeeFormGroup.value);
        alert('Employee registered successfully.');
      }
      this.closeEmployeeFormModal();
      this.loadEmployees();
    } catch (err: any) {
      console.error(err);
      alert(err.error?.message || 'Error saving employee.');
    }
  }
}
