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

  warning(
    message: string,
    options?: { description?: string; duration?: number; id?: string },
  ) {
    toast.warning(message, options);
  }

  error(
    message: string,
    options?: { description?: string; duration?: number; id?: string },
  ) {
    toast.error(message, options);
  }

  info(
    message: string,
    options?: { description?: string; duration?: number; id?: string },
  ) {
    toast.info(message, options);
  }

  success(
    message: string,
    options?: { description?: string; duration?: number; id?: string },
  ) {
    toast.success(message, options);
  }
}

