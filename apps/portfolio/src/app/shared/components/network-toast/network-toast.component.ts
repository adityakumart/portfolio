import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideWifi,
  lucideWifiOff,
  lucideX,
} from '@ng-icons/lucide';
import { NetworkStatusService } from '../../services/network-status.service';

@Component({
  selector: 'app-network-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      lucideWifi,
      lucideWifiOff,
      lucideX,
    }),
  ],
  template: `
    @if (network.shouldShowToast()) {
      <aside
        class="fixed top-[calc(env(safe-area-inset-top,0px)+1rem)] right-4 z-[9999] max-w-sm w-[calc(100vw-2rem)] sm:w-96 pointer-events-auto select-none"
        role="status"
        aria-live="polite"
      >
        @if (!network.isOnline()) {
          <!-- Offline Toast (Sticky until online or closed by user) -->
          <div
            class="p-3.5 rounded-2xl bg-card/95 border border-rose-500/40 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div
              class="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5"
            >
              <ng-icon name="lucideWifiOff" class="text-lg"></ng-icon>
            </div>

            <div class="flex-1 min-w-0 space-y-0.5">
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-bold text-foreground">You are offline</h4>
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </div>
              <p class="text-[11px] text-muted-foreground leading-snug">
                Internet connection was lost. Some features may be unavailable.
              </p>
            </div>

            <button
              type="button"
              (click)="network.dismiss()"
              class="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
              title="Close notification"
              aria-label="Close notification"
            >
              <ng-icon name="lucideX" class="text-sm"></ng-icon>
            </button>
          </div>
        } @else if (network.showRestored()) {
          <!-- Back Online Toast (Auto-dismiss in 3.5s) -->
          <div
            class="p-3.5 rounded-2xl bg-card/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div
              class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0"
            >
              <ng-icon name="lucideWifi" class="text-lg"></ng-icon>
            </div>

            <div class="flex-1 min-w-0 space-y-0.5">
              <div class="flex items-center gap-1.5">
                <h4 class="text-xs font-bold text-foreground">Back online</h4>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <p class="text-[11px] text-muted-foreground leading-snug">
                Internet connection restored.
              </p>
            </div>

            <button
              type="button"
              (click)="network.showRestored.set(false)"
              class="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <ng-icon name="lucideX" class="text-sm"></ng-icon>
            </button>
          </div>
        }
      </aside>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NetworkToastComponent {
  readonly network = inject(NetworkStatusService);
}
