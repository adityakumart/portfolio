import { RRService } from '../rr.service';
import { RRWhatsAppService } from './rr-whatsapp.service';

export class RRNotificationSchedulerService {
  private static intervalId: NodeJS.Timeout | null = null;
  private static isRunningSweep = false;

  /**
   * Start recurring automated scheduler
   * Checks every 5 minutes for upcoming time triggers
   */
  static startScheduler(intervalMs = 5 * 60 * 1000): void {
    if (this.intervalId) {
      return; // Already initialized
    }

    console.log('[RR WhatsApp Scheduler] Initializing automated notification background engine...');

    // Run first check after a brief 10 second delay
    setTimeout(() => {
      this.runAutomatedNotificationSweep().catch((err) =>
        console.error('[RR WhatsApp Scheduler] Initial sweep error:', err)
      );
    }, 10000);

    this.intervalId = setInterval(() => {
      this.runAutomatedNotificationSweep().catch((err) =>
        console.error('[RR WhatsApp Scheduler] Scheduled sweep error:', err)
      );
    }, intervalMs);
  }

  static stopScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[RR WhatsApp Scheduler] Background scheduler halted.');
    }
  }

  /**
   * Main evaluation sweep for automated time-based notifications
   */
  static async runAutomatedNotificationSweep(): Promise<{
    activeRemindersSent: number;
    reserve12hSent: number;
    reserve4hSent: number;
    pendingRemindersSent: number;
  }> {
    if (this.isRunningSweep) {
      return { activeRemindersSent: 0, reserve12hSent: 0, reserve4hSent: 0, pendingRemindersSent: 0 };
    }

    this.isRunningSweep = true;
    let activeRemindersSent = 0;
    let reserve12hSent = 0;
    let reserve4hSent = 0;
    let pendingRemindersSent = 0;

    try {
      const config = await RRWhatsAppService.getConfig();
      const { generalSettings, templates } = config;
      const bookingsCol = await RRService.getBookingsCol();
      const now = Date.now();

      // -------------------------------------------------------------
      // 1. ACTIVE BOOKING 4-HOUR RETURN REMINDER
      // -------------------------------------------------------------
      if (generalSettings.sendAutomaticActiveReminder && templates.active_reminder?.enabled) {
        const activeBookings = await bookingsCol
          .find({
            status: 'active',
            isDeleted: { $ne: true },
            'notifications.returnReminder4hSentAt': { $in: [null, undefined] } as any,
          })
          .toArray();

        for (const b of activeBookings) {
          if (!b.returnDateTime) continue;
          const returnMs = new Date(b.returnDateTime).getTime();
          if (isNaN(returnMs)) continue;

          const diffMs = returnMs - now;
          // Trigger when return is within 4 hours and 30 minutes from now (and hasn't expired past 30 mins)
          const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
          const BUFFER_MS = 30 * 60 * 1000;

          if (diffMs > -BUFFER_MS && diffMs <= FOUR_HOURS_MS + BUFFER_MS) {
            console.log(`[RR WhatsApp Scheduler] Dispatching 4hr return reminder for active booking #${b.id}`);
            await RRWhatsAppService.sendBookingNotification(b.id, 'active_reminder', {
              isAutomated: true,
              sentByName: 'System Scheduler (4h Return)',
            });
            activeRemindersSent++;
          }
        }
      }

      // -------------------------------------------------------------
      // 2. RESERVE INTIMATION (12h & 4h BEFORE PICKUP)
      // -------------------------------------------------------------
      if (generalSettings.sendAutomaticReserveIntimation && templates.reserve_intimation?.enabled) {
        const reservedBookings = await bookingsCol
          .find({
            status: 'reserved',
            isDeleted: { $ne: true },
            isClosed: { $ne: true },
          })
          .toArray();

        for (const b of reservedBookings) {
          if (!b.pickupDateTime) continue;
          const pickupMs = new Date(b.pickupDateTime).getTime();
          if (isNaN(pickupMs)) continue;

          const diffMs = pickupMs - now;
          const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
          const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
          const BUFFER_MS = 30 * 60 * 1000;

          // Check 12-hour intimation
          if (
            !b.notifications?.reserveIntimation12hSentAt &&
            diffMs <= TWELVE_HOURS_MS + BUFFER_MS &&
            diffMs > FOUR_HOURS_MS
          ) {
            console.log(`[RR WhatsApp Scheduler] Dispatching 12hr pickup intimation for reservation #${b.id}`);
            await RRWhatsAppService.sendBookingNotification(b.id, 'reserve_intimation', {
              isAutomated: true,
              sentByName: 'System Scheduler (12h Intimation)',
            });
            reserve12hSent++;
            continue;
          }

          // Check 4-hour intimation
          if (
            !b.notifications?.reserveIntimation4hSentAt &&
            diffMs <= FOUR_HOURS_MS + BUFFER_MS &&
            diffMs > -BUFFER_MS
          ) {
            console.log(`[RR WhatsApp Scheduler] Dispatching 4hr pickup intimation for reservation #${b.id}`);
            await RRWhatsAppService.sendBookingNotification(b.id, 'reserve_intimation', {
              isAutomated: true,
              sentByName: 'System Scheduler (4h Intimation)',
            });
            reserve4hSent++;
          }
        }
      }

      // -------------------------------------------------------------
      // 3. PENDING AMOUNT REMINDERS (EVERY 4 HOURS TILL RETURN)
      // -------------------------------------------------------------
      if (generalSettings.sendAutomaticPendingReminders && templates.pending_payment?.enabled) {
        const pendingBookings = await bookingsCol
          .find({
            status: 'active',
            isDeleted: { $ne: true },
            pendingAmount: { $nin: ['0', '', '0.00'] } as any,
          })
          .toArray();

        for (const b of pendingBookings) {
          const pending = parseFloat(b.pendingAmount);
          if (isNaN(pending) || pending <= 0) continue;

          // Only send while current time is before or within return time
          if (b.returnDateTime) {
            const returnMs = new Date(b.returnDateTime).getTime();
            if (!isNaN(returnMs) && now > returnMs + 30 * 60 * 1000) {
              // Rental period concluded; avoid automated nagging past return
              continue;
            }
          }

          const lastSentIso = b.notifications?.lastPendingReminderSentAt;
          const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

          let shouldSend = false;
          if (!lastSentIso) {
            // Never sent before -> send initial reminder
            shouldSend = true;
          } else {
            const lastSentMs = new Date(lastSentIso).getTime();
            if (!isNaN(lastSentMs) && now - lastSentMs >= FOUR_HOURS_MS) {
              shouldSend = true;
            }
          }

          if (shouldSend) {
            console.log(`[RR WhatsApp Scheduler] Dispatching 4hr cadence pending reminder for booking #${b.id} (Due: ₹${pending})`);
            await RRWhatsAppService.sendBookingNotification(b.id, 'pending_payment', {
              isAutomated: true,
              sentByName: 'System Scheduler (4h Pending Cadence)',
            });
            pendingRemindersSent++;
          }
        }
      }
    } catch (err) {
      console.error('[RR WhatsApp Scheduler] Error during sweep:', err);
    } finally {
      this.isRunningSweep = false;
    }

    return { activeRemindersSent, reserve12hSent, reserve4hSent, pendingRemindersSent };
  }
}
