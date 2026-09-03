import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ViewChild, ElementRef, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmCardDirective } from '@spartan-ng/hel/card';
import { HlmInputDirective } from '@spartan-ng/hel/input';
import { HlmLabelDirective } from '@spartan-ng/hel/label';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { HlmSeparatorDirective } from '@spartan-ng/hel/separator';
import { toast } from '@spartan-ng/hel/sonner';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideAlertTriangle, lucideHelpCircle, lucideDownload } from '@ng-icons/lucide';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import * as QRCode from 'qrcode';

export type QrDataType = 'url' | 'email' | 'phone' | 'text' | 'wifi' | 'sms' | 'vcard';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

@Component({
  selector: 'app-qr-code-generator',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HlmCardDirective,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    HlmTooltipImports,
    HlmSeparatorDirective,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucideAlertTriangle, lucideHelpCircle, lucideDownload }),
  ],
  templateUrl: './qr-code-generator.component.html',
  styleUrls: ['./qr-code-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrCodeGeneratorComponent implements OnInit, OnDestroy, AfterViewInit {
  private fb = inject(FormBuilder);

  @ViewChild('qrCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  form!: FormGroup;
  private destroy$ = new Subject<void>();

  // Error state signals
  errorMessage = signal<string | null>(null);

  // Available data type options
  dataTypes = [
    { value: 'url', label: 'URL / Website' },
    { value: 'text', label: 'Plain Text' },
    { value: 'email', label: 'Email Message' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'sms', label: 'SMS Text Message' },
    { value: 'wifi', label: 'WiFi Network' },
    { value: 'vcard', label: 'Contact Card (vCard)' },
  ];

  // Error correction levels
  errorLevels = [
    { value: 'L', label: 'L - Low (7% recovery)' },
    { value: 'M', label: 'M - Medium (15% recovery)' },
    { value: 'Q', label: 'Q - Quartile (25% recovery)' },
    { value: 'H', label: 'H - High (30% recovery)' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscribers();
  }

  ngAfterViewInit(): void {
    this.generateQRCode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Builds the reactive form groups for configurations and templates.
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      dataType: ['url', Validators.required],
      qrData: ['', Validators.required],
      foregroundColor: ['#000000', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      backgroundColor: ['#ffffff', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
      size: [250, [Validators.required, Validators.min(100), Validators.max(1000)]],
      errorCorrection: ['M', Validators.required],

      // Sub-groups for structuring context fields
      urlData: this.fb.group({
        url: ['https://example.com', Validators.required]
      }),
      textData: this.fb.group({
        text: ['Hello World!', Validators.required]
      }),
      emailData: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        subject: [''],
        body: ['']
      }),
      phoneData: this.fb.group({
        phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]+$/)]]
      }),
      smsData: this.fb.group({
        phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]+$/)]],
        message: ['']
      }),
      wifiData: this.fb.group({
        ssid: ['', Validators.required],
        password: [''],
        encryption: ['WPA', Validators.required]
      }),
      vcardData: this.fb.group({
        firstName: ['', Validators.required],
        lastName: [''],
        org: [''],
        title: [''],
        phone: [''],
        email: ['', Validators.email],
        url: ['']
      })
    });

    // Compile immediately to populate output field with initial template state
    this.compileTemplateData();
  }

  /**
   * Subscribes to changes in design controls and input fields to draw the QR code.
   * Leverages a 300ms debounce to prevent constant drawing on text input.
   */
  private setupFormSubscribers(): void {
    // 1. Recompile raw query data when any specific group templates update
    this.form.get('dataType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.compileTemplateData();
      });

    // Watch template form subgroups to update output qrData field
    const subgroups = ['urlData', 'textData', 'emailData', 'phoneData', 'smsData', 'wifiData', 'vcardData'];
    subgroups.forEach(groupName => {
      this.form.get(groupName)?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.compileTemplateData();
        });
    });

    // 2. Watch Compiled Raw Data and design variables to trigger Canvas Redraw
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.generateQRCode();
      });
  }

  /**
   * Compiles the contextual sub-forms into standardized strings.
   */
  private compileTemplateData(): void {
    const type: QrDataType = this.form.get('dataType')?.value;
    let compiled = '';

    switch (type) {
      case 'url':
        compiled = this.form.get('urlData.url')?.value || '';
        break;
      case 'text':
        compiled = this.form.get('textData.text')?.value || '';
        break;
      case 'email': {
        const email = this.form.get('emailData.email')?.value || '';
        const subject = this.form.get('emailData.subject')?.value || '';
        const body = this.form.get('emailData.body')?.value || '';
        compiled = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      }
      case 'phone':
        compiled = `tel:${this.form.get('phoneData.phone')?.value || ''}`;
        break;
      case 'sms': {
        const smsPhone = this.form.get('smsData.phone')?.value || '';
        const smsMsg = this.form.get('smsData.message')?.value || '';
        compiled = `SMSTO:${smsPhone}:${smsMsg}`;
        break;
      }
      case 'wifi': {
        const ssid = this.form.get('wifiData.ssid')?.value || '';
        const enc = this.form.get('wifiData.encryption')?.value || 'WPA';
        const pwd = this.form.get('wifiData.password')?.value || '';
        // Format: WIFI:S:NetworkSSID;T:WPA;P:Password;;
        compiled = `WIFI:S:${ssid};T:${enc};`;
        if (enc !== 'nopass' && pwd) {
          compiled += `P:${pwd};`;
        }
        compiled += ';';
        break;
      }
      case 'vcard': {
        const vcard = this.form.get('vcardData')?.value || {};
        const fn = `${vcard.firstName || ''} ${vcard.lastName || ''}`.trim();
        // Standard industrial vCard 3.0 formatting
        compiled = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (vcard.lastName || vcard.firstName) {
          compiled += `N:${vcard.lastName || ''};${vcard.firstName || ''};;;\n`;
          compiled += `FN:${fn}\n`;
        }
        if (vcard.org) compiled += `ORG:${vcard.org}\n`;
        if (vcard.title) compiled += `TITLE:${vcard.title}\n`;
        if (vcard.phone) compiled += `TEL;TYPE=CELL,VOICE:${vcard.phone}\n`;
        if (vcard.email) compiled += `EMAIL;TYPE=PREF,INTERNET:${vcard.email}\n`;
        if (vcard.url) compiled += `URL:${vcard.url}\n`;
        compiled += 'END:VCARD';
        break;
      }
    }

    // Set value in base form output field (disable event trigger to avoid infinite loops)
    this.form.get('qrData')?.setValue(compiled, { emitEvent: false });
  }

  /**
   * Checks if the active controls and current data type sub-group are valid.
   */
  private isFormConfigValid(): boolean {
    const baseControls = ['dataType', 'foregroundColor', 'backgroundColor', 'size', 'errorCorrection'];
    const baseValid = baseControls.every(controlName => this.form.get(controlName)?.valid);
    if (!baseValid) {
      return false;
    }

    const type = this.form.get('dataType')?.value;
    const subGroup = this.form.get(`${type}Data`);
    return subGroup ? subGroup.valid : true;
  }

  /**
   * Generates the QR Code and draws it onto the canvas using the native library.
   */
  private generateQRCode(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) {
      return;
    }

    const data = this.form.get('qrData')?.value;

    if (!data || !this.isFormConfigValid()) {
      // Clear canvas if there is no data or configuration errors
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const size = this.form.get('size')?.value || 250;
    const fore = this.form.get('foregroundColor')?.value || '#000000';
    const back = this.form.get('backgroundColor')?.value || '#ffffff';
    const ec: ErrorCorrectionLevel = this.form.get('errorCorrection')?.value || 'M';

    const options: QRCode.QRCodeRenderersOptions = {
      width: size,
      margin: 2,
      color: {
        dark: fore,
        light: back,
      },
      errorCorrectionLevel: ec,
    };

    QRCode.toCanvas(canvas, data, options, (err) => {
      if (err) {
        // Capture capacity limits or invalid parameters
        this.errorMessage.set(err.message || 'Error generating QR Code');
      } else {
        this.errorMessage.set(null);
      }
    });
  }

  /**
   * Converts Canvas drawing to PNG Data URL and triggers file download.
   */
  downloadQR(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || this.errorMessage()) {
      this.showSnackBar('Cannot download an invalid QR Code.', 'error');
      return;
    }

    try {
      // Convert Canvas buffer to binary URL representation
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `qr-code-${this.form.get('dataType')?.value}.png`;
      link.href = dataUrl;
      link.click();
      
      this.showSnackBar('QR Code image downloaded successfully!', 'success');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      this.showSnackBar(`Failed to save QR Code: ${errMsg}`, 'error');
    }
  }

  /**
   * Helper to display snackbar alerts.
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
