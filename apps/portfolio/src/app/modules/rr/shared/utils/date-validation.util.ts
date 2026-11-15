import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Returns the minimum selectable local datetime string in 'YYYY-MM-DDTHH:mm' format.
 * Includes a small grace buffer (default 5 minutes) to avoid rejecting immediate submissions
 * while filling in modal details.
 */
export function getMinPickupDateTimeString(graceMinutes: number = 5): string {
  const d = new Date(Date.now() - graceMinutes * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Checks if a given datetime string falls in the past prior to the allowable buffer.
 */
export function isPastDateTime(
  dateTimeStr: string | null | undefined,
  graceMinutes: number = 5
): boolean {
  if (!dateTimeStr) return false;
  const time = new Date(dateTimeStr).getTime();
  if (isNaN(time)) return false;
  const cutoff = Date.now() - graceMinutes * 60 * 1000;
  return time < cutoff;
}

/**
 * Angular Validator that enforces that employees cannot pick backdated dates.
 * Manager and Admin roles pass through unhindered.
 */
export function backdateValidator(
  isBackdateAllowedFn: () => boolean,
  graceMinutes: number = 5
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    if (isBackdateAllowedFn()) {
      return null;
    }
    if (isPastDateTime(control.value, graceMinutes)) {
      return { backdatedNotAllowed: true };
    }
    return null;
  };
}
