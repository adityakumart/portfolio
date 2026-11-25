import { IEmployee } from '@portfolio/shared-types';
import { IRRPasswordPolicyInfo } from '../employees/rr-employee.model';

export function checkInactivityAndStatus(emp: Partial<IEmployee>): {
  error?: string;
  status?: number;
  isDeactivatedDueToInactivity?: boolean;
} {
  if (emp.status === 'pending_activation') {
    return {
      error: 'Account pending activation by Administrator. Please contact an Administrator.',
      status: 403,
    };
  }

  if (emp.status === 'deactivated' || emp.allowLogin === false) {
    return {
      error: 'Your account has been deactivated. Please contact an Administrator to reactivate.',
      status: 403,
    };
  }

  // 60-day inactivity check
  const lastActiveTimestamp = emp.lastLoginAt || emp.createdAt;
  if (lastActiveTimestamp) {
    const daysSinceActive = (Date.now() - new Date(lastActiveTimestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceActive > 60) {
      return {
        error: 'Account deactivated due to more than 60 days of inactivity. Please contact an Administrator to reactivate.',
        status: 403,
        isDeactivatedDueToInactivity: true,
      };
    }
  }

  return {};
}

export function calculatePasswordPolicy(emp: Partial<IEmployee>): IRRPasswordPolicyInfo {
  const mustChangePassword = emp.mustChangePassword === true || emp.isFirstLogin === true;
  let passwordAgeDays = 0;
  let isBufferPeriod = false;
  let isExpired = false;
  let passwordExpiresInDays = 45;

  if (emp.passwordLastChangedAt) {
    const passChangedTime = new Date(emp.passwordLastChangedAt).getTime();
    passwordAgeDays = Math.floor((Date.now() - passChangedTime) / (1000 * 60 * 60 * 24));
    passwordExpiresInDays = Math.max(0, 45 - passwordAgeDays);
    isBufferPeriod = passwordAgeDays >= 40 && passwordAgeDays < 45;
    isExpired = passwordAgeDays >= 45;
  } else if (!mustChangePassword) {
    passwordExpiresInDays = 45;
    passwordAgeDays = 0;
  } else {
    passwordExpiresInDays = 0;
    passwordAgeDays = 0;
  }

  return {
    mustChangePassword,
    isFirstLogin: emp.isFirstLogin === true,
    passwordAgeDays,
    passwordExpiresInDays,
    isBufferPeriod,
    isExpired,
  };
}
