import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserExperienceRecord } from '@portfolio/shared-types';

@Component({
  selector: 'app-experience-list-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <h2 mat-dialog-title>Saved Experiences</h2>
    <mat-dialog-content>
      <table
        mat-table
        [dataSource]="data.records"
        class="mat-elevation-z1"
        style="width: 100%; margin-top: 8px;"
      >
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let element">{{ element.email }}</td>
        </ng-container>

        <ng-container matColumnDef="experience">
          <th mat-header-cell *matHeaderCellDef>Total Experience</th>
          <td mat-cell *matCellDef="let element">
            {{ element.displayYears }} Y, {{ element.displayMonths }} M,
            {{ element.displayDays }} D
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let element">
            <button
              mat-icon-button
              color="primary"
              (click)="onAction('edit', element)"
              matTooltip="Edit"
            >
              <mat-icon>edit</mat-icon>
            </button>
            <button
              mat-icon-button
              color="warn"
              (click)="onAction('delete', element)"
              matTooltip="Delete"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
      @if (data.records.length === 0) {
        <div class="p-4" style="text-align: center; color: var(--mat-sys-on-surface-variant, #666);">
          No records found.
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ExperienceListDialogComponent {
  public dialogRef = inject<MatDialogRef<ExperienceListDialogComponent>>(MatDialogRef);
  public data = inject<{ records: UserExperienceRecord[] }>(MAT_DIALOG_DATA);

  displayedColumns: string[] = ['name', 'email', 'experience', 'action'];

  onAction(action: string, record: UserExperienceRecord) {
    this.dialogRef.close({ action, record });
  }
}
