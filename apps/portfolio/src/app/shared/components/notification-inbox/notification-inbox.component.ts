import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBell,
  lucideCheck,
  lucideX,
  lucideUserCheck,
  lucideFolderKanban,
  lucideClock,
  lucideCheckCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/hel/button';
import { PlannerNotificationService } from '../../services/planner-notification.service';
import { IPlannerNotification } from '@portfolio/shared-types';

@Component({
  selector: 'app-notification-inbox',
  standalone: true,
  imports: [CommonModule, NgIconComponent, HlmButtonImports],
  providers: [
    provideIcons({
      lucideBell,
      lucideCheck,
      lucideX,
      lucideUserCheck,
      lucideFolderKanban,
      lucideClock,
      lucideCheckCheck,
    }),
  ],
  templateUrl: './notification-inbox.component.html',
  styleUrls: ['./notification-inbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationInboxComponent {
  readonly notifService = inject(PlannerNotificationService);
  private router = inject(Router);

  close(): void {
    this.notifService.closeInbox();
  }

  markAllRead(): void {
    this.notifService.markAllAsRead();
  }

  onAccept(notif: IPlannerNotification, event: Event): void {
    event.stopPropagation();
    if (!notif.projectId) return;

    this.notifService.acceptInvitation(notif.projectId, () => {
      this.close();
      this.router.navigate(['/user/planner'], {
        queryParams: { project: notif.projectId, tab: 'projects' },
      });
    });
  }

  onDecline(notif: IPlannerNotification, event: Event): void {
    event.stopPropagation();
    if (!notif.projectId) return;
    this.notifService.declineInvitation(notif.projectId);
  }

  onNotificationClick(notif: IPlannerNotification): void {
    if (!notif.isRead) {
      this.notifService.markAsRead(notif.id);
    }
    if (notif.projectId && notif.type !== 'project_invite') {
      this.close();
      this.router.navigate(['/user/planner'], {
        queryParams: { project: notif.projectId, tab: 'projects' },
      });
    }
  }

  getTimeAgo(dateStr: string): string {
    try {
      const now = new Date().getTime();
      const past = new Date(dateStr).getTime();
      const diffSecs = Math.floor((now - past) / 1000);

      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  }
}
