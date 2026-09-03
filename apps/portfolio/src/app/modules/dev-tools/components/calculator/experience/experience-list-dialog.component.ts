import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { HlmButtonDirective } from '@spartan-ng/hel/button';
import { HlmTooltipImports } from '@spartan-ng/hel/tooltip';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { UserExperienceRecord } from '@portfolio/shared-types';

@Component({
  selector: 'app-experience-list-dialog',
  standalone: true,
  imports: [
    HlmButtonDirective,
    HlmTooltipImports,
    NgIconComponent,
  ],
  providers: [
    provideIcons({ lucidePencil, lucideTrash2 }),
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold tracking-tight mb-4">Saved Experiences</h2>
      <div class="border rounded-xl overflow-hidden mb-4">
        <table class="w-full text-xs text-left">
          <thead class="bg-muted/40 uppercase font-semibold text-muted-foreground">
            <tr>
              <th class="p-3">Name</th>
              <th class="p-3">Email</th>
              <th class="p-3">Total Experience</th>
              <th class="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            @for (element of context.records; track element.id || $index) {
              <tr class="hover:bg-muted/10 transition-colors">
                <td class="p-3 font-medium">{{ element.name }}</td>
                <td class="p-3 text-muted-foreground">{{ element.email }}</td>
                <td class="p-3">{{ element.displayYears }} Y, {{ element.displayMonths }} M, {{ element.displayDays }} D</td>
                <td class="p-3 text-right space-x-1">
                  <button
                    hlmBtn
                    size="icon"
                    variant="ghost"
                    (click)="onAction('edit', element)"
                    hlmTooltip="Edit"
                    class="h-7 w-7 text-primary"
                  >
                    <ng-icon name="lucidePencil"></ng-icon>
                  </button>
                  <button
                    hlmBtn
                    size="icon"
                    variant="ghost"
                    (click)="onAction('delete', element)"
                    hlmTooltip="Delete"
                    class="h-7 w-7 text-destructive"
                  >
                    <ng-icon name="lucideTrash2"></ng-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
        @if (context.records.length === 0) {
          <div class="p-6 text-center text-muted-foreground text-xs">
            No records found.
          </div>
        }
      </div>
      <div class="flex justify-end">
        <button hlmBtn variant="outline" size="sm" (click)="dialogRef?.close()">Close</button>
      </div>
    </div>
  `,
})
export class ExperienceListDialogComponent {
  public dialogRef = inject(BrnDialogRef, { optional: true });
  public context = injectBrnDialogContext<{ records: UserExperienceRecord[] }>({ optional: true }) || { records: [] };

  onAction(action: string, record: UserExperienceRecord) {
    this.dialogRef?.close({ action, record });
  }
}
