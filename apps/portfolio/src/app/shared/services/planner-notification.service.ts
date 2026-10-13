import { Injectable, inject, signal, computed, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../modules/user/services/auth';
import { IPlannerNotification, IPlannerProject } from '@portfolio/shared-types';
import { toast } from '@spartan-ng/brain/sonner';

@Injectable({
  providedIn: 'root',
})
export class PlannerNotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  readonly notifications = signal<IPlannerNotification[]>([]);
  readonly isInboxOpen = signal<boolean>(false);
  readonly isConnecting = signal<boolean>(false);

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length
  );

  private eventSource: EventSource | null = null;
  private reconnectTimer: any = null;

  private get baseUrl(): string {
    return `${environment.APIURL}/user/planner`;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Auto connect if logged in
      if (this.authService.currentUser()) {
        this.loadNotifications();
        this.initSseStream();
      }
    }
  }

  toggleInbox(): void {
    this.isInboxOpen.update((v) => !v);
  }

  closeInbox(): void {
    this.isInboxOpen.set(false);
  }

  loadNotifications(): void {
    this.http
      .get<IPlannerNotification[]>(`${this.baseUrl}/notifications`, {
        headers: this.getHeaders(),
      })
      .subscribe({
        next: (list) => {
          this.notifications.set(list || []);
        },
        error: (err) => console.error('Error loading notifications:', err),
      });
  }

  initSseStream(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = this.authService.getAccessToken();
    if (!token) return;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    try {
      const streamUrl = `${this.baseUrl}/notifications/stream?token=${encodeURIComponent(token)}`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.addEventListener('connected', () => {
        // SSE connected
      });

      this.eventSource.addEventListener('notification', (event: MessageEvent) => {
        this.ngZone.run(() => {
          try {
            const notif: IPlannerNotification = JSON.parse(event.data);
            this.notifications.update((prev) => [notif, ...prev]);
            toast.info(notif.title, {
              description: notif.message,
            });
          } catch (e) {
            console.error('Failed to parse incoming notification:', e);
          }
        });
      });

      this.eventSource.addEventListener('member_accepted', (event: MessageEvent) => {
        this.ngZone.run(() => {
          try {
            const data = JSON.parse(event.data);
            toast.success(`${data.name} joined the project!`);
          } catch {}
        });
      });

      this.eventSource.onerror = () => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Attempt reconnection after 10s
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.authService.currentUser()) {
              this.initSseStream();
            }
          }, 10000);
        }
      };
    } catch (err) {
      console.error('Could not initiate SSE stream:', err);
    }
  }

  markAsRead(id: string): void {
    this.notifications.update((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    this.http
      .patch(`${this.baseUrl}/notifications/${id}/read`, {}, {
        headers: this.getHeaders(),
      })
      .subscribe({
        error: (err) => console.error('Error marking notification read:', err),
      });
  }

  markAllAsRead(): void {
    this.notifications.update((prev) => prev.map((n) => ({ ...n, isRead: true })));
    this.http
      .patch(`${this.baseUrl}/notifications/read-all`, {}, {
        headers: this.getHeaders(),
      })
      .subscribe({
        error: (err) => console.error('Error marking all notifications read:', err),
      });
  }

  acceptInvitation(projectId: string, onAccepted?: () => void): void {
    this.http
      .post<{ success: boolean; project: IPlannerProject }>(
        `${this.baseUrl}/projects/${projectId}/accept`,
        {},
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: (res) => {
          toast.success('Invitation accepted! Project access unlocked.');
          // Mark all project invite notifications for this project as read
          this.notifications.update((prev) =>
            prev.map((n) =>
              n.projectId === projectId && n.type === 'project_invite'
                ? { ...n, isRead: true }
                : n
            )
          );
          if (onAccepted) onAccepted();
        },
        error: (err) => {
          toast.error(err.error?.message || 'Failed to accept invitation');
        },
      });
  }

  declineInvitation(projectId: string, onDeclined?: () => void): void {
    this.http
      .post<{ success: boolean }>(
        `${this.baseUrl}/projects/${projectId}/decline`,
        {},
        { headers: this.getHeaders() }
      )
      .subscribe({
        next: () => {
          toast.info('Invitation declined.');
          this.notifications.update((prev) =>
            prev.filter((n) => !(n.projectId === projectId && n.type === 'project_invite'))
          );
          if (onDeclined) onDeclined();
        },
        error: (err) => {
          toast.error(err.error?.message || 'Failed to decline invitation');
        },
      });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
