import { Injectable, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DietStateService } from './diet-state.service';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({
  providedIn: 'root',
})
export class HydrationReminderService {
  private state = inject(DietStateService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  private intervalId: any = null;

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.requestNotificationPermission();

    // Check every 60 seconds outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.evaluateReminders();
      }, 60 * 1000);
    });

    // Run first evaluation after small delay
    setTimeout(() => this.evaluateReminders(), 3000);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async requestNotificationPermission(): Promise<void> {
    if (
      isPlatformBrowser(this.platformId) &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn('Could not request notification permission:', err);
      }
    }
  }

  private evaluateReminders(): void {
    const config = this.state.userConfig();
    const dashboard = this.state.dashboardData();
    if (!config || !dashboard) return;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(
      currentMinutes,
    ).padStart(2, '0')}`;

    // 1. Evaluate Junk Food Check Prompt
    if (
      config.junkFoodPrompt.enabled &&
      !dashboard.junkFood.recorded &&
      currentTimeStr >= config.junkFoodPrompt.promptTime &&
      !this.state.isJunkPromptOpen()
    ) {
      this.ngZone.run(() => {
        this.state.isJunkPromptOpen.set(true);
      });
    }

    // 2. Evaluate Hydration Reminder
    if (config.hydration.remindersEnabled) {
      const withinWindow =
        currentTimeStr >= config.hydration.reminderStartTime &&
        currentTimeStr <= config.hydration.reminderEndTime;

      if (withinWindow) {
        const lastEntry =
          dashboard.hydration.entries.length > 0
            ? dashboard.hydration.entries[dashboard.hydration.entries.length - 1]
            : null;

        let shouldRemind = false;
        if (!lastEntry) {
          shouldRemind = true;
        } else {
          const [lastH, lastM] = lastEntry.time.split(':').map(Number);
          const minutesSinceLast =
            (currentHours - lastH) * 60 + (currentMinutes - lastM);
          if (minutesSinceLast >= config.hydration.reminderIntervalMinutes) {
            shouldRemind = true;
          }
        }

        if (shouldRemind && dashboard.hydration.progressPercentage < 100) {
          this.triggerHydrationNotification();
        }
      }
    }
  }

  private triggerHydrationNotification(): void {
    const message = 'Time to drink some water! Stay hydrated to stay energized.';

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('💧 Hydration Reminder', {
          body: message,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback to Sonner toast
        this.triggerToastReminder();
      }
    } else {
      this.triggerToastReminder();
    }
  }

  private triggerToastReminder(): void {
    this.ngZone.run(() => {
      toast('💧 Hydration Reminder', {
        description: 'Take a sip of water now! Keep your streak going.',
        action: {
          label: '+250ml',
          onClick: () => this.state.quickAddWater(250),
        },
      });
    });
  }
}
