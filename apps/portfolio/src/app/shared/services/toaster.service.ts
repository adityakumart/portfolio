import { Injectable } from '@angular/core';
import { toast } from '@spartan-ng/hel/sonner';

@Injectable({
  providedIn: 'root',
})
export class ToastrService {
  open(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'error',
    _action: string = 'Close',
  ) {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'error':
      default:
        toast.error(message);
        break;
    }
  }
}

