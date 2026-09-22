import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RRCustomerApiService } from '../../../../services/rr-customer-api.service';
import {
  IRegularCustomerMasked,
  CustomerMembershipTier,
  ICreateCustomerDTO,
  IUpdateCustomerDTO,
} from '@portfolio/shared-types';
import { HlmTableImports } from '@spartan-ng/hel/table';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmDialogService } from '@spartan-ng/hel/dialog';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUsers,
  lucidePlus,
  lucidePencil,
  lucideEye,
  lucideTrash2,
  lucideBadgeCheck,
  lucideCrown,
  lucideShieldCheck,
  lucidePhone,
  lucideMail,
  lucideMapPin,
  lucideSearch,
  lucideX,
  lucideSparkles,
  lucideTag,
  lucideCheck,
} from '@ng-icons/lucide';

export type FormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-rr-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HlmTableImports,
    HlmButtonImports,
    HlmInputImports,
    HlmBadgeImports,
    HlmTooltipImports,
    HlmLabelImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideUsers,
      lucidePlus,
      lucidePencil,
      lucideEye,
      lucideTrash2,
      lucideBadgeCheck,
      lucideCrown,
      lucideShieldCheck,
      lucidePhone,
      lucideMail,
      lucideMapPin,
      lucideSearch,
      lucideX,
      lucideSparkles,
      lucideTag,
      lucideCheck,
    }),
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class RRCustomerListComponent implements OnInit {
  customerApi = inject(RRCustomerApiService);
  private fb = inject(FormBuilder);
  private dialogService = inject(HlmDialogService);

  @ViewChild('customerModal') customerModal!: TemplateRef<unknown>;

  // Component state signals
  searchQuery = signal<string>('');
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);
  isSubmitting = signal<boolean>(false);
  activeMode = signal<FormMode>('create');
  selectedCustomer = signal<IRegularCustomerMasked | null>(null);

  customerFormGroup!: FormGroup;
  private activeDialogRef: { close: () => void } | null = null;

  // Filtered & paginated customers
  filteredCustomers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.customerApi.customers();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.membershipId.toLowerCase().includes(query)
    );
  });

  pagedCustomers = computed(() => {
    const start = this.currentPage() * this.pageSize();
    return this.filteredCustomers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredCustomers().length / this.pageSize()))
  );

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
  }

  /**
   * Initializes Reactive Form with comprehensive synchronous validators.
   */
  private initForm(): void {
    this.customerFormGroup = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]+$/),
          Validators.minLength(2),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]+$/),
          Validators.minLength(1),
        ],
      ],
      fatherName: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[A-Za-z ]+$/),
          Validators.minLength(2),
        ],
      ],
      phone: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)],
        [this.duplicatePhoneValidator.bind(this)],
      ],
      altPhone: ['', [Validators.pattern(/^[6-9]\d{9}$/)]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      aadhar: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      dl: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z0-9]{15,16}$/)],
      ],
      address: ['', [Validators.required, Validators.minLength(5)]],
      membershipTier: ['regular', [Validators.required]],
      discountRate: [
        10,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      isActive: [true],
    });

    // Auto-update discount rate when membership tier changes
    this.customerFormGroup
      .get('membershipTier')
      ?.valueChanges.subscribe((tier: CustomerMembershipTier) => {
        let defaultRate = 10;
        if (tier === 'silver') defaultRate = 15;
        else if (tier === 'gold') defaultRate = 20;
        else if (tier === 'platinum') defaultRate = 25;
        this.customerFormGroup.patchValue(
          { discountRate: defaultRate },
          { emitEvent: false }
        );
      });
  }

  /**
   * Asynchronous duplicate phone validator checking against loaded customer list.
   */
  private async duplicatePhoneValidator(
    control: AbstractControl
  ): Promise<ValidationErrors | null> {
    const val = control.value?.trim();
    if (!val || val.length !== 10) return null;

    const currentId = this.selectedCustomer()?.membershipId;
    const existing = this.customerApi
      .customers()
      .find((c) => c.phone === val && c.membershipId !== currentId);

    if (existing) {
      return { duplicatePhone: `Already registered to ${existing.membershipId}` };
    }
    return null;
  }

  async loadCustomers(): Promise<void> {
    try {
      await this.customerApi.getCustomers({ limit: 100 });
    } catch (err: unknown) {
      toast.error('Failed to load customer memberships');
    }
  }

  openCreateModal(): void {
    this.activeMode.set('create');
    this.selectedCustomer.set(null);
    this.customerFormGroup.reset({
      membershipTier: 'regular',
      discountRate: 10,
      isActive: true,
    });
    this.customerFormGroup.enable();
    this.customerFormGroup.get('aadhar')?.setValidators([
      Validators.required,
      Validators.pattern(/^\d{12}$/),
    ]);
    this.customerFormGroup.get('dl')?.setValidators([
      Validators.required,
      Validators.pattern(/^[A-Za-z0-9]{15,16}$/),
    ]);
    this.customerFormGroup.get('aadhar')?.updateValueAndValidity();
    this.customerFormGroup.get('dl')?.updateValueAndValidity();

    this.activeDialogRef = this.dialogService.open(this.customerModal, {
      contentClass:
        'w-[95vw] max-w-4xl p-4 sm:p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  openEditModal(customer: IRegularCustomerMasked): void {
    this.activeMode.set('edit');
    this.selectedCustomer.set(customer);
    this.customerFormGroup.enable();

    this.customerFormGroup.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      fatherName: customer.fatherName,
      phone: customer.phone,
      altPhone: customer.altPhone || '',
      email: customer.email,
      address: customer.address,
      membershipTier: customer.membershipTier,
      discountRate: customer.discountRate,
      isActive: customer.isActive,
      aadhar: '',
      dl: '',
    });

    this.customerFormGroup.get('aadhar')?.clearValidators();
    this.customerFormGroup.get('dl')?.clearValidators();
    this.customerFormGroup.get('aadhar')?.updateValueAndValidity();
    this.customerFormGroup.get('dl')?.updateValueAndValidity();

    this.activeDialogRef = this.dialogService.open(this.customerModal, {
      contentClass:
        'w-[95vw] max-w-4xl p-4 sm:p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  openViewModal(customer: IRegularCustomerMasked): void {
    this.activeMode.set('view');
    this.selectedCustomer.set(customer);
    this.customerFormGroup.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      fatherName: customer.fatherName,
      phone: customer.phone,
      altPhone: customer.altPhone || '',
      email: customer.email,
      aadhar: customer.aadhar,
      dl: customer.dl,
      address: customer.address,
      membershipTier: customer.membershipTier,
      discountRate: customer.discountRate,
      isActive: customer.isActive,
    });
    this.customerFormGroup.disable();
    this.activeDialogRef = this.dialogService.open(this.customerModal, {
      contentClass:
        'w-[95vw] max-w-4xl p-4 sm:p-6 max-h-[90vh] flex flex-col overflow-hidden',
    });
  }

  closeModal(): void {
    if (this.activeDialogRef) {
      this.activeDialogRef.close();
      this.activeDialogRef = null;
    }
  }

  async onFormSubmit(): Promise<void> {
    if (this.activeMode() === 'view') {
      this.closeModal();
      return;
    }

    if (this.customerFormGroup.invalid) {
      this.customerFormGroup.markAllAsTouched();
      toast.error('Please resolve validation errors before submitting.');
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.customerFormGroup.value;

    try {
      if (this.activeMode() === 'create') {
        const payload: ICreateCustomerDTO = {
          firstName: formVal.firstName.trim(),
          lastName: formVal.lastName.trim(),
          fatherName: formVal.fatherName.trim(),
          phone: formVal.phone.trim(),
          altPhone: formVal.altPhone?.trim() || '',
          email: formVal.email.trim().toLowerCase(),
          aadhar: formVal.aadhar.trim(),
          dl: formVal.dl.trim().toUpperCase(),
          address: formVal.address.trim(),
          membershipTier: formVal.membershipTier,
          discountRate: Number(formVal.discountRate),
        };

        const created = await this.customerApi.createCustomer(payload);
        toast.success(
          `Registered customer membership ${created.membershipId} successfully!`
        );
        this.closeModal();
      } else if (this.activeMode() === 'edit') {
        const current = this.selectedCustomer();
        if (!current) return;

        const payload: IUpdateCustomerDTO = {
          firstName: formVal.firstName.trim(),
          lastName: formVal.lastName.trim(),
          fatherName: formVal.fatherName.trim(),
          phone: formVal.phone.trim(),
          altPhone: formVal.altPhone?.trim() || '',
          email: formVal.email.trim().toLowerCase(),
          address: formVal.address.trim(),
          membershipTier: formVal.membershipTier,
          discountRate: Number(formVal.discountRate),
          isActive: formVal.isActive,
        };

        if (formVal.aadhar && /^\d{12}$/.test(formVal.aadhar.trim())) {
          payload.aadhar = formVal.aadhar.trim();
        }
        if (formVal.dl && /^[A-Za-z0-9]{15,16}$/.test(formVal.dl.trim())) {
          payload.dl = formVal.dl.trim().toUpperCase();
        }

        await this.customerApi.updateCustomer(
          current._id || current.membershipId,
          payload
        );
        toast.success(
          `Updated customer membership ${current.membershipId} successfully!`
        );
        this.closeModal();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save customer membership.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteCustomer(customer: IRegularCustomerMasked): Promise<void> {
    if (
      !confirm(
        `Are you sure you want to deactivate and remove membership for ${customer.firstName} ${customer.lastName} (${customer.membershipId})?`
      )
    ) {
      return;
    }

    try {
      await this.customerApi.deleteCustomer(
        customer._id || customer.membershipId
      );
      toast.success(
        `Membership ${customer.membershipId} removed successfully.`
      );
    } catch (err: unknown) {
      toast.error('Failed to delete customer membership.');
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  getTierBadgeVariant(tier: CustomerMembershipTier): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (tier) {
      case 'platinum':
        return 'destructive';
      case 'gold':
        return 'default';
      case 'silver':
        return 'secondary';
      default:
        return 'outline';
    }
  }
}
