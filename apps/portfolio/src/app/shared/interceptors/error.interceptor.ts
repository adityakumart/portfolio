import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { toast } from '@spartan-ng/hel/sonner';

/**
 * Formats a duration in seconds to a human-friendly string.
 */
function formatWaitDuration(seconds: number): string {
  if (seconds <= 0) return 'shortly';
  if (seconds < 60) {
    return `in ${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const mins = Math.ceil(seconds / 60);
  return `in ${mins} minute${mins === 1 ? '' : 's'}`;
}

/**
 * Global HTTP Interceptor
 * Intercepts HTTP 429 (Too Many Requests) rate limit responses
 * and displays a user-friendly Spartan UI Sonner toast notification.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 429) {
        // Extract retryAfter from JSON body or response headers
        const headerRetry = error.headers?.get('Retry-After');
        const retrySeconds =
          typeof error.error?.retryAfter === 'number'
            ? error.error.retryAfter
            : headerRetry
            ? parseInt(headerRetry, 10)
            : undefined;

        let description = error.error?.message;

        if (typeof retrySeconds === 'number' && !isNaN(retrySeconds)) {
          const waitStr = formatWaitDuration(retrySeconds);
          if (!description) {
            description = `Rate limit exceeded. Please wait and try again ${waitStr}.`;
          } else if (!description.toLowerCase().includes('minute') && !description.toLowerCase().includes('second')) {
            description = `${description} (Try again ${waitStr})`;
          }
        } else if (!description) {
          description =
            'Rate limit exceeded. You have made too many requests. Please wait a moment before trying again.';
        }

        // Display Spartan UI toast notification (only in browser, SSR safe)
        if (isPlatformBrowser(platformId)) {
          toast.warning('Rate Limit Exceeded', {
            id: 'rate-limit-toast',
            description,
            duration: 6000,
          });
        }
      }

      return throwError(() => error);
    })
  );
};
