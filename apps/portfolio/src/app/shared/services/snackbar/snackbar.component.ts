import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/hel/button';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [HlmButtonDirective, NgIconComponent],
  providers: [provideIcons({ lucideX })],
  template: `
    <div class="flex items-center justify-between gap-2 p-3 text-sm">
      <span>{{ message() }}</span>
      <button hlmBtn variant="ghost" size="icon" (click)="close()">
        <ng-icon name="lucideX" class="text-sm"></ng-icon>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnackbarComponent {
  message = input<string>('');
  action = input<string>('Close');

  close() {}
}
