import { Injectable, inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlannerStateService } from './planner-state.service';
import { PlatformAdapterService } from './platform-adapter.service';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({
  providedIn: 'root',
})
export class PlannerReminderService {
  private state = inject(PlannerStateService);
  private platform = inject(PlatformAdapterService);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  private intervalId: any = null;
  private triggeredReminderIds = new Set<string>();

  init(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check every 30 seconds outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.evaluateReminders();
      }, 30 * 1000);
    });

    // Run first evaluation shortly after startup
    setTimeout(() => this.evaluateReminders(), 3000);
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async requestPermission(): Promise<boolean> {
    return this.platform.requestNotificationPermission();
  }

  private evaluateReminders(): void {
    const active = this.state.activeReminders();
    if (!active || active.length === 0) return;

    const now = new Date();

    for (const todo of active) {
      if (!todo.reminder) continue;

      const triggerKey = `${todo.id}_${todo.reminder.reminderTime}_${todo.reminder.snoozedUntil || ''}`;
      if (this.triggeredReminderIds.has(triggerKey)) continue;

      const targetTimeStr = todo.reminder.snoozedUntil || todo.reminder.reminderTime;
      const targetTime = new Date(targetTimeStr);

      if (isNaN(targetTime.getTime())) continue;

      // If scheduled time has arrived or passed within the last 15 minutes
      const diffMs = now.getTime() - targetTime.getTime();
      if (diffMs >= 0 && diffMs <= 15 * 60 * 1000) {
        this.triggeredReminderIds.add(triggerKey);
        this.fireNotification(todo);
      }
    }
  }

  private fireNotification(todo: any): void {
    // 1. Dispatch through Platform Adapter (Web Notification API, Capacitor, or Chrome Extension)
    this.platform.dispatchNotification(`Reminder: ${todo.title}`, {
      body: todo.description ? todo.description.slice(0, 100) : 'Due now!',
      tag: `todo_${todo.id}`,
    });

    // 2. In-App Spartan Toast alert with action
    this.ngZone.run(() => {
      toast(todo.title, {
        description: todo.dueDate ? `Due: ${todo.dueDate}` : 'Task reminder alert',
        action: {
          label: 'Complete',
          onClick: () => this.state.toggleTodoStatus(todo),
        },
      });
    });
  }
}
