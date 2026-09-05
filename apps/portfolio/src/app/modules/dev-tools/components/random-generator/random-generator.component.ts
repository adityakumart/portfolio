import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorImports } from '@spartan-ng/hel/separator';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCopy, lucideRefreshCw } from '@ng-icons/lucide';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { RandomGeneratorService } from './services/random-generator.service';

export type GeneratorType = 'array' | 'number' | 'objects' | 'uuid' | 'password' | 'hash';

@Component({
  selector: 'app-random-generator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmCardImports,
    HlmInputImports,
    HlmButtonImports,
    HlmTooltipImports,
    HlmSeparatorImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucideCheckCircle, lucideCopy, lucideRefreshCw }),
  ],
  templateUrl: './random-generator.component.html',
  styleUrls: ['./random-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomGeneratorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private generatorService = inject(RandomGeneratorService);

  readonly generatorTypes: GeneratorType[] = ['array', 'number', 'objects', 'uuid', 'password', 'hash'];
  generatorType: GeneratorType = 'uuid';
  settingsForm!: FormGroup;
  generatedOutputs: string[] = [];
  hashSeeds: string[] = []; // Used to show source for hashes

  copiedIndex: number | null = null;
  copiedAll = false;

  get passwordLength(): number {
    return this.settingsForm?.get('passwordLength')?.value || 0;
  }

  get passwordStrength(): { text: string; color: string } {
    const len = this.passwordLength;
    const val = this.settingsForm?.value || {};
    let pools = 0;
    if (val.passwordLowercase) pools++;
    if (val.passwordUppercase) pools++;
    if (val.passwordNumbers) pools++;
    if (val.passwordSymbols) pools++;

    if (len < 8 || pools < 2) {
      return { text: 'Weak - Poor security', color: 'var(--destructive, #ef4444)' };
    }
    if (len < 12 || pools < 3) {
      return { text: 'Medium - Average security', color: '#ffc107' };
    }
    return { text: 'Strong - Excellent password!', color: '#2e7d32' };
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.updateGeneratorTypeFromUrl();
    this.setupRouteListener();
    this.setupFormValueChanges();
    this.generate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the settings form controls.
   */
  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // Array generator settings
      arrayType: ['mixed'],
      arrayMinElements: [3, [Validators.required, Validators.min(1), Validators.max(50)]],
      arrayMaxElements: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      arrayUnique: [false],

      // Number generator settings
      numberMin: [0, [Validators.required]],
      numberMax: [1000, [Validators.required]],
      numberInteger: [true],
      numberPrecision: [2, [Validators.required, Validators.min(0), Validators.max(10)]],

      // Objects generator settings
      objectPreset: ['user'],

      // UUID generator settings
      uuidCasing: ['lower'],
      uuidHyphens: [true],

      // Password generator settings
      passwordLength: [16, [Validators.required, Validators.min(4), Validators.max(128)]],
      passwordUppercase: [true],
      passwordLowercase: [true],
      passwordNumbers: [true],
      passwordSymbols: [true],
      passwordExcludeAmbiguous: [false],
      passwordExcludeSimilar: [false],

      // Hash generator settings
      hashAlgorithm: ['sha256'],
      hashCasing: ['lower'],
    });
  }

  /**
   * Listen to active route change to keep the selector radio button in sync.
   */
  private setupRouteListener(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateGeneratorTypeFromUrl();
        this.generate();
      });
  }

  /**
   * Reads URL and sets the current generatorType.
   */
  private updateGeneratorTypeFromUrl(): void {
    const url = this.router.url;
    if (url.includes('generator/array')) {
      this.generatorType = 'array';
    } else if (url.includes('generator/number')) {
      this.generatorType = 'number';
    } else if (url.includes('generator/objects')) {
      this.generatorType = 'objects';
    } else if (url.includes('generator/uuid')) {
      this.generatorType = 'uuid';
    } else if (url.includes('generator/password')) {
      this.generatorType = 'password';
    } else if (url.includes('generator/hash')) {
      this.generatorType = 'hash';
    }
  }

  /**
   * Watches form input changes and auto-regenerates values.
   */
  private setupFormValueChanges(): void {
    this.settingsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.settingsForm.valid) {
          this.generate();
        }
      });
  }

  /**
   * Triggered when clicking on the selection radio buttons.
   */
  onRadioChange(newType: GeneratorType): void {
    this.generatorType = newType;
    this.router.navigate([`/dev-tools/generator/${newType}`]);
  }

  /**
   * Core generator driver. Builds 5 items.
   */
  generate(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const formVal = this.settingsForm.value;
    const outputs: string[] = [];
    const seeds: string[] = [];

    for (let i = 0; i < 5; i++) {
      switch (this.generatorType) {
        case 'array':
          outputs.push(
            this.generatorService.generateArray({
              type: formVal.arrayType,
              minElements: formVal.arrayMinElements,
              maxElements: formVal.arrayMaxElements,
              unique: formVal.arrayUnique,
            })
          );
          break;
        case 'number':
          outputs.push(
            this.generatorService
              .generateNumber({
                min: formVal.numberMin,
                max: formVal.numberMax,
                integer: formVal.numberInteger,
                precision: formVal.numberPrecision,
              })
              .toString()
          );
          break;
        case 'objects':
          outputs.push(
            this.generatorService.generateObject({
              preset: formVal.objectPreset,
            })
          );
          break;
        case 'uuid':
          outputs.push(
            this.generatorService.generateUUID({
              casing: formVal.uuidCasing,
              hyphens: formVal.uuidHyphens,
            })
          );
          break;
        case 'password':
          outputs.push(
            this.generatorService.generatePassword({
              length: formVal.passwordLength,
              uppercase: formVal.passwordUppercase,
              lowercase: formVal.passwordLowercase,
              numbers: formVal.passwordNumbers,
              symbols: formVal.passwordSymbols,
              excludeAmbiguous: formVal.passwordExcludeAmbiguous,
              excludeSimilar: formVal.passwordExcludeSimilar,
            })
          );
          break;
        case 'hash': {
          const hashRes = this.generatorService.generateHash({
            algorithm: formVal.hashAlgorithm,
            casing: formVal.hashCasing,
          });
          outputs.push(hashRes.hash);
          seeds.push(hashRes.seed);
          break;
        }
      }
    }

    this.generatedOutputs = outputs;
    this.hashSeeds = seeds;
  }

  /**
   * Copy specific entry to clipboard.
   */
  onCopy(text: string, index: number): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      () => {
        this.copiedIndex = index;
        this.showSnackBar('Copied item to clipboard!', 'success');
        setTimeout(() => {
          this.copiedIndex = null;
        }, 1500);
      },
      () => {
        this.showSnackBar('Failed to copy to clipboard.', 'error');
      }
    );
  }

  /**
   * Copy all 5 entries at once (joined by double newline).
   */
  onCopyAll(): void {
    if (this.generatedOutputs.length === 0) return;
    const divider = this.generatorType === 'objects' || this.generatorType === 'array' ? '\n\n' : '\n';
    const textToCopy = this.generatedOutputs.join(divider);

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        this.copiedAll = true;
        this.showSnackBar('Copied all items to clipboard!', 'success');
        setTimeout(() => {
          this.copiedAll = false;
        }, 1500);
      },
      () => {
        this.showSnackBar('Failed to copy items.', 'error');
      }
    );
  }

  /**
   * Helper to display snackbar notifications.
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  }
}
