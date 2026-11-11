import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RRApiService } from '../../../../services/rr-api.service';
import { IEmployee } from '@portfolio/shared-types';
import { RRAadharInputComponent } from '../../../../shared/components/aadhar-input/aadhar-input.component';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmDatePickerImports } from '@spartan-ng/hel/date-picker';
import { HlmSpinnerImports } from '@spartan-ng/hel/spinner';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { IndianDatePipe, toISODateString, IndianDateInput } from '../../../../../../shared/pipes/indian-date.pipe';
import {
  lucideUsers,
  lucidePlus,
  lucidePencil,
  lucideBadgeCheck,
  lucideContact,
  lucideCheck,
  lucideTrash2,
  lucideUserCheck,
  lucideKeyRound,
  lucideCopy,
  lucideEye,
  lucideEyeOff,
  lucideRefreshCw,
  lucideX,
  lucideShieldCheck,
  lucideAlertCircle,
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
    HlmDatePickerImports,
    HlmSpinnerImports,
    IndianDatePipe,
    NgIconComponent,
    RRAadharInputComponent,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucidePlus,
      lucidePencil,
      lucideBadgeCheck,
      lucideContact,
      lucideCheck,
      lucideTrash2,
      lucideUserCheck,
      lucideKeyRound,
      lucideCopy,
      lucideEye,
      lucideEyeOff,
      lucideRefreshCw,
      lucideX,
      lucideShieldCheck,
      lucideAlertCircle,
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
  @ViewChild('resetPasswordDialog') resetPasswordDialog!: TemplateRef<any>;

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
  selectedEmployeeForEdit = signal<IEmployee | null>(null);

  // Initial credential selection for new staff registration (Task 1)
  credentialType = signal<'dob' | 'temp_password'>('dob');
  generatedTempPassword = signal<string>('');
  showTempPassword = signal<boolean>(false);

  // Interactive reset password dialog signals (Task 2)
  targetEmployeeForReset = signal<IEmployee | null>(null);
  resetType = signal<'dob' | 'temp_password'>('dob');
  resetTempPassword = signal<string>('');
  showResetTempPassword = signal<boolean>(false);
  resetSuccessResult = signal<{ temporaryPassword: string; message: string } | null>(null);
  isResetSubmitting = signal<boolean>(false);

  // Forms
  employeeFormGroup!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadEmployees();
  }

  generateRandomPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const num = Math.floor(10 + Math.random() * 90);
    return `RR@${pass}#${num}`;
  }

  async copyToClipboard(text: string, label = 'Temporary password') {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard.`);
        return;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error('Failed to copy to clipboard.');
    }
  }

  setCredentialType(type: 'dob' | 'temp_password') {
    this.credentialType.set(type);
    if (type === 'temp_password' && !this.generatedTempPassword()) {
      this.generatedTempPassword.set(this.generateRandomPassword());
    }
  }

  generateNewRegistrationPassword() {
    this.generatedTempPassword.set(this.generateRandomPassword());
  }

  onTempPasswordInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.generatedTempPassword.set(val);
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
      allowLogin: [false],
      address: ['', Validators.required],
      password: ['']
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
    this.selectedEmployeeForEdit.set(null);
    this.credentialType.set('dob');
    this.generatedTempPassword.set('');
    this.showTempPassword.set(false);
    this.employeeFormGroup.reset({
      id: '',
      role: 'employee',
      allowLogin: false,
      password: ''
    });
    this.dialog.open(this.employeeFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  openEditEmployeeModal(e: IEmployee) {
    this.editingEmployeeMode.set(true);
    this.selectedEmployeeForEdit.set(e);
    this.employeeFormGroup.reset({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      dob: e.dob ? new Date(e.dob) : null,
      phone: e.phone,
      altPhone: e.altPhone,
      email: e.email,
      aadhar: e.aadhar,
      dl: e.dl,
      role: e.role,
      allowLogin: e.allowLogin,
      address: e.address,
      password: ''
    });
    this.dialog.open(this.employeeFormDialog, {
      contentClass: 'max-w-3xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  closeEmployeeFormModal() {
    this.dialog.closeAll();
  }

  async activateEmployee(e: IEmployee) {
    try {
      await this.rrApi.activateEmployee(e.id);
      toast.success(`Account for ${e.firstName} ${e.lastName} (${e.id}) activated.`);
      await this.loadEmployees();
      if (this.selectedEmployeeForEdit()?.id === e.id) {
        this.selectedEmployeeForEdit.update(emp => emp ? ({ ...emp, status: 'active', allowLogin: true }) : null);
        this.employeeFormGroup.patchValue({ allowLogin: true });
      }
    } catch (err: any) {
      toast.error(err.error?.message || err.message || 'Failed to activate staff member.');
    }
  }

  private resetDialogRef: any = null;

  // --- INTERACTIVE RESET PASSWORD MODAL (Task 2) ---
  openResetPasswordModal(e: IEmployee) {
    this.targetEmployeeForReset.set(e);
    this.resetType.set('dob');
    this.resetTempPassword.set(this.generateRandomPassword());
    this.showResetTempPassword.set(false);
    this.resetSuccessResult.set(null);
    this.resetDialogRef = this.dialog.open(this.resetPasswordDialog, {
      contentClass: 'max-w-md w-full p-6 max-h-[85vh] flex flex-col overflow-hidden',
    });
  }

  setResetType(type: 'dob' | 'temp_password') {
    this.resetType.set(type);
    if (type === 'temp_password' && !this.resetTempPassword()) {
      this.resetTempPassword.set(this.generateRandomPassword());
    }
  }

  generateNewResetPassword() {
    this.resetTempPassword.set(this.generateRandomPassword());
  }

  onResetTempPasswordInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.resetTempPassword.set(val);
  }

  async confirmResetPassword() {
    const emp = this.targetEmployeeForReset();
    if (!emp) return;

    const tempPass = this.resetType() === 'temp_password'
      ? (this.resetTempPassword().trim() || this.generateRandomPassword())
      : (emp.dob || 'RoadReady@123');

    this.isResetSubmitting.set(true);
    try {
      const res = await this.rrApi.resetEmployeePassword(emp.id, tempPass);
      this.resetSuccessResult.set({
        temporaryPassword: res.temporaryPassword || tempPass,
        message: res.message || `Password reset successfully for ${emp.firstName} ${emp.lastName}.`
      });
      toast.success(`Password reset for ${emp.id}. User must create new password on next login.`);
      await this.loadEmployees();
    } catch (err: any) {
      toast.error(err.error?.message || err.message || 'Failed to reset password.');
    } finally {
      this.isResetSubmitting.set(false);
    }
  }

  closeResetModal() {
    if (this.resetDialogRef) {
      this.resetDialogRef.close();
      this.resetDialogRef = null;
    } else {
      this.dialog.closeAll();
    }
    this.targetEmployeeForReset.set(null);
    this.resetSuccessResult.set(null);
    this.isResetSubmitting.set(false);
  }

  resetPassword(e: IEmployee) {
    this.openResetPasswordModal(e);
  }

  resetPasswordFromModal(event: Event) {
    event.preventDefault();
    const emp = this.selectedEmployeeForEdit();
    if (emp) {
      this.openResetPasswordModal(emp);
    }
  }

  async saveEmployee(e: Event) {
    e.preventDefault();
    if (this.employeeFormGroup.invalid) return;

    const formVal = this.employeeFormGroup.value;
    const isoDob = toISODateString(formVal.dob as IndianDateInput);
    const payload: any = {
      ...formVal,
      dob: isoDob,
    };

    if (!this.editingEmployeeMode()) {
      if (this.credentialType() === 'dob') {
        payload.password = isoDob;
      } else {
        const tempPass = this.generatedTempPassword().trim();
        payload.password = tempPass || this.generateRandomPassword();
      }
    } else {
      if (!payload.password) {
        delete payload.password;
      }
    }

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

  async deleteEmployee(e: IEmployee) {
    const currentUser = this.rrApi.currentUser();
    if (currentUser?.id === e.id) {
      toast.error('You cannot delete your own administrative account.');
      return;
    }

    if (!confirm(`Are you sure you want to delete staff member ${e.firstName} ${e.lastName} (${e.id})? This action cannot be undone.`)) {
      return;
    }

    try {
      await this.rrApi.deleteEmployee(e.id);
      toast.success(`Employee ${e.id} removed from system.`);
      this.loadEmployees();
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      toast.error(err.error?.message || err.message || 'Failed to delete employee.');
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
