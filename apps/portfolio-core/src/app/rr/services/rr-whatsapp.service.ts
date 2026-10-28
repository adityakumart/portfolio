import * as jwt from 'jsonwebtoken';
import { Collection } from 'mongodb';
import { RRService } from '../rr.service';
import { getJwtSecret } from '../../../config/security';
import {
  IBooking,
  IRRWhatsAppConfig,
  IRRWhatsAppTemplateId,
  DEFAULT_RR_WHATSAPP_CONFIG,
} from '@portfolio/shared-types';
import {
  buildWhatsAppDirectUrl,
  extractBookingPlaceholders,
  interpolateTemplate,
  sanitizeWhatsAppPhone,
} from '../utils/template-interpolator';

export class RRWhatsAppService {
  private static async getSettingsCol(): Promise<Collection<any>> {
    return await RRService.getSettingsCol();
  }

  /**
   * Fetch current WhatsApp configuration or seed defaults if not present
   */
  static async getConfig(): Promise<IRRWhatsAppConfig> {
    const col = await this.getSettingsCol();
    let doc = await col.findOne({ key: 'rr_whatsapp_config' });

    if (!doc) {
      const initialConfig = { ...DEFAULT_RR_WHATSAPP_CONFIG, updatedAt: new Date().toISOString() };
      await col.insertOne(initialConfig);
      return initialConfig;
    }

    // Ensure all 6 standard templates exist even if new ones were added
    let hasMissingTemplates = false;
    const mergedTemplates = { ...doc.templates };
    for (const [key, tpl] of Object.entries(DEFAULT_RR_WHATSAPP_CONFIG.templates)) {
      if (!mergedTemplates[key]) {
        mergedTemplates[key] = tpl;
        hasMissingTemplates = true;
      }
    }

    if (hasMissingTemplates) {
      await col.updateOne(
        { key: 'rr_whatsapp_config' },
        { $set: { templates: mergedTemplates, updatedAt: new Date().toISOString() } }
      );
      doc.templates = mergedTemplates;
    }

    return doc as IRRWhatsAppConfig;
  }

  /**
   * Update WhatsApp configuration (Admin only)
   */
  static async saveConfig(
    updatedConfig: Partial<IRRWhatsAppConfig>,
    updatedBy: string
  ): Promise<IRRWhatsAppConfig> {
    const col = await this.getSettingsCol();
    const current = await this.getConfig();

    const merged: IRRWhatsAppConfig = {
      ...current,
      ...updatedConfig,
      key: 'rr_whatsapp_config',
      generalSettings: {
        ...current.generalSettings,
        ...(updatedConfig.generalSettings || {}),
      },
      templates: {
        ...current.templates,
        ...(updatedConfig.templates || {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    await col.updateOne(
      { key: 'rr_whatsapp_config' },
      { $set: merged },
      { upsert: true }
    );

    return merged;
  }

  /**
   * Generate signed 24-hour time-limited invoice token and public URL
   */
  static generate24HrInvoiceToken(
    bookingId: string,
    phone: string,
    baseUrl?: string
  ): { token: string; expiresAt: string; fullUrl: string } {
    const secret = getJwtSecret();
    const expiresInSeconds = 24 * 60 * 60; // 24 hours
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

    const token = jwt.sign(
      {
        bookingId,
        phone,
        type: 'rr_invoice',
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      },
      secret
    );

    const appOrigin = baseUrl || process.env['PUBLIC_APP_URL'] || 'http://localhost:4200';
    const cleanOrigin = appOrigin.replace(/\/$/, '');
    const fullUrl = `${cleanOrigin}/user/rr/invoice/${token}`;

    return { token, expiresAt, fullUrl };
  }

  /**
   * Verify signed 24-hour invoice token
   */
  static verifyInvoiceToken(token: string): {
    valid: boolean;
    bookingId?: string;
    phone?: string;
    isExpired?: boolean;
    error?: string;
  } {
    try {
      const secret = getJwtSecret();
      const decoded = jwt.verify(token, secret) as any;
      if (decoded.type !== 'rr_invoice' || !decoded.bookingId) {
        return { valid: false, error: 'Invalid token structure' };
      }
      return { valid: true, bookingId: decoded.bookingId, phone: decoded.phone };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return {
          valid: false,
          isExpired: true,
          error: 'This invoice download link has expired (links are valid for 24 hours). Please contact support for an updated copy.',
        };
      }
      return { valid: false, error: 'Invalid or forged invoice token.' };
    }
  }

  /**
   * Compile template into final message text with live booking data
   */
  static compileMessage(
    booking: IBooking,
    templateId: IRRWhatsAppTemplateId,
    config: IRRWhatsAppConfig,
    customText?: string,
    baseUrl?: string
  ): {
    compiledText: string;
    directWhatsAppUrl: string;
    phone: string;
    customerName: string;
    invoiceLink?: string;
  } {
    let invoiceLink: string | undefined;

    if (templateId === 'end_booking_invoice') {
      const tokenInfo = this.generate24HrInvoiceToken(booking.id, booking.renterPhone, baseUrl);
      invoiceLink = tokenInfo.fullUrl;
    }

    const variables = extractBookingPlaceholders(booking, config, invoiceLink);
    const templateDef = config.templates[templateId] || DEFAULT_RR_WHATSAPP_CONFIG.templates[templateId];

    let compiledText: string;
    if (customText && customText.trim()) {
      compiledText = interpolateTemplate(customText.trim(), variables);
    } else {
      compiledText = interpolateTemplate(templateDef.templateText, variables);
    }

    const phone = booking.renterPhone || '';
    const directWhatsAppUrl = buildWhatsAppDirectUrl(
      phone,
      compiledText,
      config.generalSettings.countryCodePrefix
    );

    return {
      compiledText,
      directWhatsAppUrl,
      phone,
      customerName: variables['customerName'],
      invoiceLink,
    };
  }

  /**
   * Low-level gateway dispatcher
   */
  static async dispatchViaGateway(
    phone: string,
    messageText: string,
    config: IRRWhatsAppConfig
  ): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
    const cleanPhone = sanitizeWhatsAppPhone(phone, config.generalSettings.countryCodePrefix);

    if (!cleanPhone) {
      return { success: false, provider: config.provider, error: 'Recipient phone number is invalid or empty.' };
    }

    if (config.provider === 'meta_cloud' && config.metaConfig?.accessToken && config.metaConfig?.phoneNumberId) {
      try {
        const url = `https://graph.facebook.com/v19.0/${config.metaConfig.phoneNumberId}/messages`;
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.metaConfig.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: { preview_url: true, body: messageText },
          }),
        });

        const data: any = await resp.json();
        if (!resp.ok) {
          return {
            success: false,
            provider: 'meta_cloud',
            error: data?.error?.message || 'Failed to dispatch via Meta WhatsApp Cloud API',
          };
        }
        return {
          success: true,
          provider: 'meta_cloud',
          messageId: data?.messages?.[0]?.id,
        };
      } catch (err: any) {
        return { success: false, provider: 'meta_cloud', error: err.message };
      }
    }

    if (config.provider === 'twilio' && config.twilioConfig?.accountSid && config.twilioConfig?.authToken) {
      try {
        const { accountSid, authToken, fromNumber } = config.twilioConfig;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
        const formattedTo = `whatsapp:+${cleanPhone}`;

        const formData = new URLSearchParams();
        formData.append('From', formattedFrom);
        formData.append('To', formattedTo);
        formData.append('Body', messageText);

        const resp = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data: any = await resp.json();
        if (!resp.ok) {
          return { success: false, provider: 'twilio', error: data?.message || 'Twilio send failed' };
        }
        return { success: true, provider: 'twilio', messageId: data?.sid };
      } catch (err: any) {
        return { success: false, provider: 'twilio', error: err.message };
      }
    }

    if (config.provider === 'custom_webhook' && config.customWebhookUrl) {
      try {
        const resp = await fetch(config.customWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, message: messageText, timestamp: new Date().toISOString() }),
        });
        if (!resp.ok) {
          return { success: false, provider: 'custom_webhook', error: `Webhook returned status ${resp.status}` };
        }
        return { success: true, provider: 'custom_webhook' };
      } catch (err: any) {
        return { success: false, provider: 'custom_webhook', error: err.message };
      }
    }

    // Default / manual mode: simulates local success and returns wa.me URL
    return {
      success: true,
      provider: 'manual_only',
      messageId: `manual_${Date.now()}`,
    };
  }

  /**
   * High-level send method: compiles, dispatches, persists notification state, and logs activity
   */
  static async sendBookingNotification(
    bookingId: string,
    templateId: IRRWhatsAppTemplateId,
    options?: {
      customText?: string;
      sentBy?: string;
      sentByName?: string;
      sentByRole?: string;
      isAutomated?: boolean;
      baseUrl?: string;
    }
  ): Promise<{
    success: boolean;
    provider: string;
    message: string;
    compiledText: string;
    directWhatsAppUrl: string;
    invoiceLink?: string;
    error?: string;
  }> {
    const bookingsCol = await RRService.getBookingsCol();
    const logsCol = await RRService.getLogsCol();
    const booking = await bookingsCol.findOne({ id: bookingId });

    if (!booking) {
      return {
        success: false,
        provider: 'none',
        message: 'Booking not found',
        compiledText: '',
        directWhatsAppUrl: '',
        error: 'Booking ID does not exist',
      };
    }

    const config = await this.getConfig();
    const templateDef = config.templates[templateId] || DEFAULT_RR_WHATSAPP_CONFIG.templates[templateId];

    // Check if template is disabled
    if (!templateDef.enabled && options?.isAutomated) {
      return {
        success: false,
        provider: config.provider,
        message: `Template '${templateId}' is disabled in settings`,
        compiledText: '',
        directWhatsAppUrl: '',
        error: 'Template disabled',
      };
    }

    const { compiledText, directWhatsAppUrl, phone, customerName, invoiceLink } = this.compileMessage(
      booking,
      templateId,
      config,
      options?.customText,
      options?.baseUrl
    );

    const dispatchResult = await this.dispatchViaGateway(phone, compiledText, config);

    // Update notification state in DB
    const nowIso = new Date().toISOString();
    const updateField: any = {};

    if (templateId === 'new_booking') {
      updateField['notifications.newBookingSentAt'] = nowIso;
    } else if (templateId === 'active_reminder') {
      updateField['notifications.returnReminder4hSentAt'] = nowIso;
    } else if (templateId === 'reserve_booking') {
      updateField['notifications.reserveConfirmationSentAt'] = nowIso;
    } else if (templateId === 'reserve_intimation') {
      // Determine if 12h or 4h
      const pickupMs = new Date(booking.pickupDateTime).getTime();
      const diffHours = (pickupMs - Date.now()) / (3600 * 1000);
      if (diffHours <= 5) {
        updateField['notifications.reserveIntimation4hSentAt'] = nowIso;
      } else {
        updateField['notifications.reserveIntimation12hSentAt'] = nowIso;
      }
    } else if (templateId === 'pending_payment') {
      updateField['notifications.lastPendingReminderSentAt'] = nowIso;
    } else if (templateId === 'end_booking_invoice') {
      updateField['notifications.endBookingInvoiceSentAt'] = nowIso;
      if (invoiceLink) {
        updateField['notifications.invoiceTokenExpiresAt'] = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      }
    }

    if (!options?.isAutomated) {
      updateField['notifications.lastManualNotificationSentAt'] = nowIso;
      updateField['notifications.lastManualNotificationType'] = templateId;
    }

    const incField: any = {};
    if (templateId === 'pending_payment') {
      incField['notifications.pendingRemindersCount'] = 1;
    }

    const updateQuery: any = { $set: updateField };
    if (Object.keys(incField).length > 0) {
      updateQuery.$inc = incField;
    }

    await bookingsCol.updateOne({ id: bookingId }, updateQuery);

    // Record audit log
    const sender = options?.isAutomated ? 'System Auto-Scheduler' : options?.sentByName || options?.sentBy || 'Staff';
    await logsCol.insertOne({
      action: 'WHATSAPP_NOTIFICATION',
      time: nowIso,
      timestamp: nowIso,
      user: sender,
      performedBy: sender,
      role: options?.sentByRole || 'employee',
      details: `${options?.isAutomated ? '[AUTO]' : '[MANUAL]'} WhatsApp ${templateDef.name} sent to ${customerName} (${phone}) for booking #${bookingId} via ${dispatchResult.provider}.`,
    });

    return {
      success: dispatchResult.success,
      provider: dispatchResult.provider,
      message: dispatchResult.success
        ? `WhatsApp notification (${templateDef.name}) dispatched successfully.`
        : `Notification failed: ${dispatchResult.error}`,
      compiledText,
      directWhatsAppUrl,
      invoiceLink,
      error: dispatchResult.error,
    };
  }
}
