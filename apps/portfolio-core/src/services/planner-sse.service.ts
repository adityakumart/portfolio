import { Response } from 'express';
import { IPlannerNotification } from '@portfolio/shared-types';

class PlannerSseService {
  private clients = new Map<string, Set<Response>>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startHeartbeat();
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, responses] of this.clients.entries()) {
        for (const res of responses) {
          try {
            res.write(': keepalive\n\n');
          } catch {
            responses.delete(res);
          }
        }
        if (responses.size === 0) {
          this.clients.delete(userId);
        }
      }
    }, 25000);
  }

  addClient(userId: string, res: Response): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(res);

    // Initial connection event
    res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);
  }

  removeClient(userId: string, res: Response): void {
    const responses = this.clients.get(userId);
    if (responses) {
      responses.delete(res);
      if (responses.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  sendToUser(userId: string, event: string, data: any): void {
    const responses = this.clients.get(userId);
    if (!responses || responses.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of responses) {
      try {
        res.write(payload);
      } catch (err) {
        responses.delete(res);
      }
    }
    if (responses.size === 0) {
      this.clients.delete(userId);
    }
  }

  sendToUsers(userIds: string[], event: string, data: any, excludeUserId?: string): void {
    for (const userId of userIds) {
      if (excludeUserId && userId === excludeUserId) continue;
      this.sendToUser(userId, event, data);
    }
  }

  sendNotification(userId: string, notification: IPlannerNotification): void {
    this.sendToUser(userId, 'notification', notification);
  }
}

export const plannerSse = new PlannerSseService();
