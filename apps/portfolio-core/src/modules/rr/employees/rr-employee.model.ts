import { IEmployee, RRRole } from '@portfolio/shared-types';

export interface IRRPasswordPolicyInfo {
  mustChangePassword: boolean;
  isFirstLogin: boolean;
  passwordAgeDays: number;
  passwordExpiresInDays: number;
  isBufferPeriod: boolean;
  isExpired: boolean;
}

export type { IEmployee, RRRole };
