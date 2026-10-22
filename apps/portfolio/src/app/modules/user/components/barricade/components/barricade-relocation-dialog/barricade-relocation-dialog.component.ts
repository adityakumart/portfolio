import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideShieldAlert, lucideHelpCircle } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/hel/card';
import { HlmBadgeImports } from '@spartan-ng/hel/badge';
import { BarricadeStateService } from '../../services/barricade-state.service';

@Component({
  selector: 'app-barricade-relocation-dialog',
  standalone: true,
  imports: [CommonModule, NgIconComponent, HlmCardImports, HlmBadgeImports],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideHelpCircle,
    }),
  ],
  template: `
    @if (state.phase() === 'PLACING_BARRICADE') {
      <div
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
      >
        <div
          hlmCard
          class="p-4 rounded-2xl border-2 border-red-500/80 bg-card/95 backdrop-blur-xl shadow-2xl flex items-center gap-3.5"
        >
          <div
            class="h-11 w-11 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0 animate-pulse"
          >
            <ng-icon name="lucideShieldAlert" class="text-2xl" />
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h4 class="font-extrabold text-sm text-foreground">
                Barricade Captured!
              </h4>
              <span
                hlmBadge
                class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5"
              >
                Relocate
              </span>
            </div>
            <p class="text-xs text-muted-foreground mt-0.5">
              Click any highlighted dashed node on the board to deploy this obstacle.
            </p>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarricadeRelocationDialogComponent {
  readonly state = inject(BarricadeStateService);
}
