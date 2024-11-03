import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {

  constructor(private snackBar: MatSnackBar) { }

  open(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'error', action: string = 'Close') {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message, action },
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type
    });
  }
}