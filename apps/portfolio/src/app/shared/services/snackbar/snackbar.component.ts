import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbar',
  imports: [MatButtonModule, NgIconComponent],
  providers: [provideIcons({ lucideX })],
  templateUrl: './snackbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
  public data = inject(MAT_SNACK_BAR_DATA);
  private snackBarRef = inject<MatSnackBarRef<SnackbarComponent>>(MatSnackBarRef);

  close() {
    this.snackBarRef.dismiss();
  }
}
