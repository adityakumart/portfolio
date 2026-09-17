import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toast } from '@spartan-ng/hel/sonner';

/**
 * Global HTTP Interceptor
 * Intercepts HTTP 429 (Too Many Requests) rate limit responses
 * and displays a user-friendly Spartan UI Sonner toast notification.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        // Extract message from backend payload or provide a clear fallback
        const rateLimitMessage =
          error.error?.message ||
          'Rate limit exceeded. You have made too many requests. Please wait a moment before trying again.';

        // Display Spartan UI toast notification
        // Note: Using an id prevents duplicate stacked toasts if multiple parallel requests fail with 429
        toast.warning('Rate Limit Exceeded', {
          id: 'rate-limit-toast',
          description: rateLimitMessage,
          duration: 6000,
        });
      }

      return throwError(() => error);
    })
  );
};
