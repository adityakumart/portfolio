import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { HlmInputImports } from '@spartan-ng/hel/input';
import { HlmLabelImports } from '@spartan-ng/hel/label';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideMessageSquare,
  lucideSettings,
  lucideClock,
  lucideCheckCircle2,
  lucideAlertTriangle,
  lucideSend,
  lucideCopy,
  lucideRotateCcw,
  lucideSave,
  lucideRefreshCw,
  lucideCar,
  lucideCalendarClock,
  lucideReceipt,
  lucideShieldCheck,
  lucideZap,
  lucidePhone,
  lucideCheck,
  lucideLayoutGrid,
  lucideKey,
  lucideWrench,
  lucideFileText,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/hel/sonner';
import {
  IRRWhatsAppConfig,
  IRRWhatsAppTemplateId,
  IRRWhatsAppTemplate,
  IRRDashboardCardKey,
  DEFAULT_RR_WHATSAPP_CONFIG,
} from '@portfolio/shared-types';
import { RRApiService } from '../../../../services/rr-api.service';

@Component({
  selector: 'app-rr-whatsapp-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmCardImports,
    HlmBadgeImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      lucideMessageSquare,
      lucideSettings,
      lucideClock,
      lucideCheckCircle2,
      lucideAlertTriangle,
      lucideSend,
      lucideCopy,
      lucideRotateCcw,
      lucideSave,
      lucideRefreshCw,
      lucideCar,
      lucideCalendarClock,
      lucideReceipt,
      lucideShieldCheck,
      lucideZap,
      lucidePhone,
      lucideCheck,
      lucideLayoutGrid,
      lucideKey,
      lucideWrench,
      lucideFileText,
    }),
  ],
  templateUrl: './whatsapp-templates.component.html',
})
export class RRWhatsAppTemplatesComponent implements OnInit {
  private rrApi = inject(RRApiService);

  isLoading = signal(true);
  isSaving = signal(false);
  isTesting = signal(false);
  isSweeping = signal(false);
  activeTab = signal<'templates' | 'automation' | 'gateway'>('templates');

  config: IRRWhatsAppConfig = JSON.parse(JSON.stringify(DEFAULT_RR_WHATSAPP_CONFIG));
  selectedTemplateId = signal<IRRWhatsAppTemplateId>('new_booking');

  // Test console
  testPhone = signal<string>('');
  testMessage = signal<string>('Hello from RoadReady! This is a test WhatsApp notification.');

  readonly templateTypes: { id: IRRWhatsAppTemplateId; label: string; icon: string; triggerNote: string }[] = [
    {
      id: 'new_booking',
      label: 'New Booking Confirmation',
      icon: 'lucideCar',
      triggerNote: 'Auto-sent upon new booking creation',
    },
    {
      id: 'active_reminder',
      label: 'Active Booking Return Reminder',
      icon: 'lucideClock',
      triggerNote: 'Manual card action or auto-sent 4 hours before return',
    },
    {
      id: 'reserve_booking',
      label: 'Advance Reservation Confirmation',
      icon: 'lucideCalendarClock',
      triggerNote: 'Auto-sent upon advance reservation creation',
    },
    {
      id: 'reserve_intimation',
      label: 'Reserve Intimation (Pickup)',
      icon: 'lucideCalendarClock',
      triggerNote: 'Manual card action or auto-sent 12h & 4h before pickup',
    },
    {
      id: 'pending_payment',
      label: 'Pending Amount Due Reminder',
      icon: 'lucideAlertTriangle',
      triggerNote: 'Manual card action or auto-sent every 4h till return',
    },
    {
      id: 'end_booking_invoice',
      label: 'End Booking Tax Invoice (24h Link)',
      icon: 'lucideReceipt',
      triggerNote: 'Auto-sent on rental completion with 24h invoice link',
    },
  ];

  readonly dashboardCardOptions: { key: IRRDashboardCardKey; label: string; icon: string }[] = [
    { key: 'fleet', label: 'Total Fleet', icon: 'lucideCar' },
    { key: 'available', label: 'Available', icon: 'lucideCheckCircle2' },
    { key: 'bookings', label: 'Active Bookings', icon: 'lucideKey' },
    { key: 'reserved', label: 'Reserved Fleet', icon: 'lucideCalendarClock' },
    { key: 'maintenance', label: 'In Service', icon: 'lucideWrench' },
    { key: 'contract', label: 'In-Contract', icon: 'lucideFileText' },
    { key: 'payments', label: 'Pending Payments', icon: 'lucideAlertTriangle' },
  ];

  toggleDashboardCard(cardKey: IRRDashboardCardKey) {
    const tpl = this.currentTemplate;
    if (!tpl) return;
    if (!tpl.dashboardCards) {
      tpl.dashboardCards = [];
    }
    const idx = tpl.dashboardCards.indexOf(cardKey);
    if (idx >= 0) {
      tpl.dashboardCards.splice(idx, 1);
    } else {
      tpl.dashboardCards.push(cardKey);
    }
  }

  isDashboardCardSelected(cardKey: IRRDashboardCardKey): boolean {
    const tpl = this.currentTemplate;
    return Boolean(tpl?.dashboardCards?.includes(cardKey));
  }

  get currentTemplate(): IRRWhatsAppTemplate {
    return (
      this.config.templates[this.selectedTemplateId()] ||
      DEFAULT_RR_WHATSAPP_CONFIG.templates[this.selectedTemplateId()]
    );
  }

  ngOnInit() {
    this.loadConfig();
  }

  async loadConfig() {
    this.isLoading.set(true);
    try {
      const data = await this.rrApi.getWhatsAppConfig();
      if (data) {
        this.config = data;
        if (this.config.templates) {
          for (const key of Object.keys(this.config.templates) as IRRWhatsAppTemplateId[]) {
            if (!this.config.templates[key].dashboardCards) {
              this.config.templates[key].dashboardCards = [];
            }
          }
        }
      }
    } catch (err: unknown) {
      toast.error('Could not load WhatsApp settings: ' + ((err as { error?: { message?: string }; message?: string })?.error?.message || ((err as { message?: string })?.message || String(err))));
    } finally {
      this.isLoading.set(false);
    }
  }

  selectTemplate(id: IRRWhatsAppTemplateId) {
    this.selectedTemplateId.set(id);
  }

  insertPlaceholder(placeholder: string) {
    const tpl = this.currentTemplate;
    tpl.templateText = (tpl.templateText || '') + ` {{${placeholder}}}`;
  }

  resetCurrentTemplate() {
    const defaultTpl = DEFAULT_RR_WHATSAPP_CONFIG.templates[this.selectedTemplateId()];
    if (defaultTpl) {
      this.config.templates[this.selectedTemplateId()] = JSON.parse(JSON.stringify(defaultTpl));
      toast.info(`Reset "${defaultTpl.name}" to default template.`);
    }
  }

  async saveConfig() {
    this.isSaving.set(true);
    try {
      const res = await this.rrApi.updateWhatsAppConfig(this.config);
      if (res?.success) {
        toast.success('WhatsApp templates and settings saved successfully!');
        if (res.config) {
          this.config = res.config;
        }
      }
    } catch (err: unknown) {
      toast.error('Failed to save settings: ' + ((err as { error?: { message?: string }; message?: string })?.error?.message || ((err as { message?: string })?.message || String(err))));
    } finally {
      this.isSaving.set(false);
    }
  }

  async sendTestMessage() {
    if (!this.testPhone().trim()) {
      toast.error('Please enter a recipient phone number for the test.');
      return;
    }
    this.isTesting.set(true);
    try {
      const res = await this.rrApi.testWhatsAppMessage(this.testPhone().trim(), this.testMessage().trim());
      if (res.success) {
        toast.success(`Test message dispatched successfully via ${res.provider}!`);
      } else {
        toast.error(`Test message failed: ${res.message}`);
      }
    } catch (err: unknown) {
      toast.error('Error dispatching test message: ' + ((err as { error?: { message?: string }; message?: string })?.error?.message || ((err as { message?: string })?.message || String(err))));
    } finally {
      this.isTesting.set(false);
    }
  }

  async runManualSweep() {
    this.isSweeping.set(true);
    try {
      const res = await this.rrApi.runWhatsAppSchedulerSweep();
      if (res?.success) {
        const { activeRemindersSent, reserve12hSent, reserve4hSent, pendingRemindersSent } = res.stats;
        toast.success(
          `Scheduler sweep complete: Sent ${activeRemindersSent} return reminders, ${reserve12hSent + reserve4hSent} pickup intimations, ${pendingRemindersSent} pending reminders.`
        );
      }
    } catch (err: unknown) {
      toast.error('Error running scheduler sweep: ' + ((err as { error?: { message?: string }; message?: string })?.error?.message || ((err as { message?: string })?.message || String(err))));
    } finally {
      this.isSweeping.set(false);
    }
  }
}
