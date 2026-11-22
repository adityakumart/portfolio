import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { IEmployee } from '../employees/rr-employee.model';
import { checkInactivityAndStatus, calculatePasswordPolicy } from './rr-auth.policy';
import { getJwtSecret } from '../../../common/config/security';

export class RRAuthService {
  private static getJwtSecret(): string {
    return getJwtSecret();
  }

  static async buildLoginSuccess(
    emp: IEmployee,
    auditDescription: string,
  ): Promise<{
    access_token: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email?: string;
      role: string;
    };
    status: string;
    mustChangePassword: boolean;
    isFirstLogin: boolean;
    passwordAgeDays: number;
    passwordExpiresInDays: number;
    isBufferPeriod: boolean;
    isExpired: boolean;
  }> {
    const empCol = await RRDb.getEmployeesCol();
    await empCol.updateOne(
      { id: emp.id },
      {
        $set: {
          lastLoginAt: new Date().toISOString(),
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      },
    );

    const token = jwt.sign({ id: emp.id, role: emp.role }, this.getJwtSecret(), {
      expiresIn: '24h',
    });
    const policy = calculatePasswordPolicy(emp);

    RRLogService.logActivity(
      'Logged in',
      emp.id,
      emp.role,
      auditDescription,
    ).catch((logErr) => console.error('[AuditLog] Failed to log login:', logErr));

    return {
      access_token: token,
      user: {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        role: emp.role,
      },
      status: emp.status || 'active',
      ...policy,
    };
  }

  static async login(body: {
    username?: string;
    password?: string;
    empId?: string;
    dob?: string;
  }): Promise<{ status: number; data: Record<string, unknown> }> {
    const { username, password, empId, dob } = body;
    const effectiveUsername = username || empId;
    const empCol = await RRDb.getEmployeesCol();

    const handleFailedLogin = async (employee: IEmployee, failureReason: string) => {
      const attempts = (employee.failedLoginAttempts || 0) + 1;
      const updates: Record<string, unknown> = { failedLoginAttempts: attempts };
      if (attempts >= 5) {
        updates['lockoutUntil'] = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }
      await empCol.updateOne({ id: employee.id }, { $set: updates });
      return { status: 401, data: { error: 'Unauthorized', message: failureReason } };
    };

    const resetFailedAttempts = async (employee: IEmployee) => {
      if (employee.failedLoginAttempts || employee.lockoutUntil) {
        await empCol.updateOne(
          { id: employee.id },
          { $set: { failedLoginAttempts: 0, lockoutUntil: null } },
        );
      }
    };

    // 1. Password / Credential Login
    if (effectiveUsername && password) {
      const emp = await empCol.findOne({
        $or: [{ id: effectiveUsername }, { email: effectiveUsername.toLowerCase() }],
        isDeleted: { $ne: true },
      });

      if (!emp) {
        return { status: 401, data: { error: 'Unauthorized', message: 'Invalid credentials' } };
      }

      if (emp.lockoutUntil && new Date(emp.lockoutUntil) > new Date()) {
        const remaining = Math.ceil(
          (new Date(emp.lockoutUntil).getTime() - Date.now()) / (60 * 1000),
        );
        return {
          status: 423,
          data: {
            error: 'Locked',
            message: `Account is temporarily locked due to consecutive failed attempts. Please try again after ${remaining} minute(s).`,
          },
        };
      }

      const statusCheck = checkInactivityAndStatus(emp);
      if (statusCheck.error) {
        if (statusCheck.isDeactivatedDueToInactivity) {
          await empCol.updateOne(
            { id: emp.id },
            { $set: { status: 'deactivated', allowLogin: false } },
          );
          RRLogService.logActivity(
            'Account Deactivated',
            emp.id,
            emp.role,
            `Account automatically deactivated due to 60+ days of login inactivity.`,
          ).catch(() => {});
        }
        return {
          status: statusCheck.status || 403,
          data: { error: 'Forbidden', message: statusCheck.error },
        };
      }

      if (emp.passwordHash) {
        const isMatch = await bcrypt.compare(password, emp.passwordHash);
        if (!isMatch) {
          const isInitialLogin =
            emp.isFirstLogin === true || emp.mustChangePassword === true;
          if (
            (emp.role !== 'admin' || isInitialLogin) &&
            emp.dob &&
            emp.dob === password
          ) {
            // Permitted fallback
          } else {
            return await handleFailedLogin(emp, 'Invalid password');
          }
        }
      } else {
        if (emp.dob !== password) {
          return await handleFailedLogin(emp, 'Invalid password');
        }
      }

      await resetFailedAttempts(emp);
      const loginPayload = await this.buildLoginSuccess(
        emp,
        `User session authenticated (${emp.firstName} ${emp.lastName}, Role: ${emp.role.toUpperCase()})`,
      );
      return { status: 200, data: loginPayload as unknown as Record<string, unknown> };
    }

    // 2. Employee Login (empId & dob)
    if (empId && dob) {
      const emp = await empCol.findOne({ id: empId, isDeleted: { $ne: true } });
      if (!emp) {
        return {
          status: 401,
          data: { error: 'Unauthorized', message: 'No employee found with this ID.' },
        };
      }

      if (emp.lockoutUntil && new Date(emp.lockoutUntil) > new Date()) {
        const remaining = Math.ceil(
          (new Date(emp.lockoutUntil).getTime() - Date.now()) / (60 * 1000),
        );
        return {
          status: 423,
          data: {
            error: 'Locked',
            message: `Account is temporarily locked due to consecutive failed attempts. Please try again after ${remaining} minute(s).`,
          },
        };
      }

      const statusCheck = checkInactivityAndStatus(emp);
      if (statusCheck.error) {
        if (statusCheck.isDeactivatedDueToInactivity) {
          await empCol.updateOne(
            { id: emp.id },
            { $set: { status: 'deactivated', allowLogin: false } },
          );
          RRLogService.logActivity(
            'Account Deactivated',
            emp.id,
            emp.role,
            `Account automatically deactivated due to 60+ days of login inactivity.`,
          ).catch(() => {});
        }
        return {
          status: statusCheck.status || 403,
          data: { error: 'Forbidden', message: statusCheck.error },
        };
      }

      let isDobValid = emp.dob === dob;
      if (!isDobValid && emp.passwordHash) {
        isDobValid = await bcrypt.compare(dob, emp.passwordHash);
      }

      if (!isDobValid) {
        return await handleFailedLogin(emp, 'Incorrect date of birth.');
      }

      await resetFailedAttempts(emp);
      const loginPayload = await this.buildLoginSuccess(
        emp,
        `Employee badge authenticated (${emp.firstName} ${emp.lastName}, ID: ${emp.id})`,
      );
      return { status: 200, data: loginPayload as unknown as Record<string, unknown> };
    }

    return {
      status: 400,
      data: { error: 'Bad Request', message: 'Please provide credentials' },
    };
  }

  static async changePassword(
    userId: string,
    currentPassword?: string,
    newPassword?: string,
  ): Promise<{ status: number; data: Record<string, unknown> }> {
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return {
        status: 400,
        data: {
          error: 'Bad Request',
          message: 'New password must be at least 6 characters.',
        },
      };
    }

    const empCol = await RRDb.getEmployeesCol();
    const emp = await empCol.findOne({ id: userId, isDeleted: { $ne: true } });
    if (!emp) {
      return { status: 404, data: { error: 'Not Found', message: 'Employee not found.' } };
    }

    const isMandatoryChange = emp.mustChangePassword === true || emp.isFirstLogin === true;

    const verifyPasswordMatch = async (candidate: string) => {
      if (emp.passwordHash) {
        const isMatch = await bcrypt.compare(candidate, emp.passwordHash);
        if (isMatch) return true;
        if (emp.role !== 'admin' && emp.dob && emp.dob === candidate) {
          return true;
        }
        return false;
      } else if (emp.dob && emp.dob === candidate) {
        return true;
      }
      return false;
    };

    if (!isMandatoryChange) {
      if (!currentPassword) {
        return {
          status: 400,
          data: { error: 'Bad Request', message: 'Current password is required.' },
        };
      }
      const isMatch = await verifyPasswordMatch(currentPassword);
      if (!isMatch) {
        return {
          status: 401,
          data: { error: 'Unauthorized', message: 'Current password does not match.' },
        };
      }
    } else if (currentPassword) {
      const isMatch = await verifyPasswordMatch(currentPassword);
      if (!isMatch) {
        return {
          status: 401,
          data: { error: 'Unauthorized', message: 'Current password does not match.' },
        };
      }
    }

    if (emp.dob && newPassword.trim() === emp.dob) {
      return {
        status: 400,
        data: { error: 'Bad Request', message: 'New password cannot be your Date of Birth.' },
      };
    }

    if (emp.passwordHash) {
      const isIdentical = await bcrypt.compare(newPassword.trim(), emp.passwordHash);
      if (isIdentical) {
        return {
          status: 400,
          data: {
            error: 'Bad Request',
            message: 'New password cannot be the same as your previous password.',
          },
        };
      }
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword.trim(), saltRounds);

    await empCol.updateOne(
      { id: emp.id },
      {
        $set: {
          passwordHash,
          mustChangePassword: false,
          isFirstLogin: false,
          passwordLastChangedAt: new Date().toISOString(),
        },
      },
    );

    RRLogService.logActivity(
      'Password Updated',
      emp.id,
      emp.role,
      `Password successfully configured for user ${emp.firstName} ${emp.lastName} (${emp.id})`,
    ).catch(() => {});

    return { status: 200, data: { success: true, message: 'Password updated successfully.' } };
  }

  static async logout(
    userId?: string,
    userRole?: string,
  ): Promise<{ success: boolean; message: string }> {
    const empCol = await RRDb.getEmployeesCol();
    const emp = userId ? await empCol.findOne({ id: userId }) : null;
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : userId || 'Staff';

    RRLogService.logActivity(
      'Logged out',
      userId || 'Unknown',
      userRole || 'employee',
      `User session ended (${empName}, Role: ${(userRole || 'employee').toUpperCase()})`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log logout:', logErr));

    return { success: true, message: 'Logged out successfully' };
  }

  static async getPermissions(
    userId?: string,
  ): Promise<{ status: number; data: Record<string, unknown> }> {
    const empCol = await RRDb.getEmployeesCol();
    const emp = await empCol.findOne({ id: userId, isDeleted: { $ne: true } });
    if (!emp) {
      return {
        status: 401,
        data: {
          error: 'Unauthorized',
          message: 'Employee account does not exist or has been removed.',
        },
      };
    }

    if (!emp.allowLogin || emp.status === 'deactivated') {
      return {
        status: 403,
        data: {
          error: 'Forbidden',
          message: 'Account access has been revoked or deactivated by an administrator.',
        },
      };
    }

    const statusCheck = checkInactivityAndStatus(emp);
    if (statusCheck.error) {
      return {
        status: statusCheck.status || 403,
        data: { error: 'Forbidden', message: statusCheck.error },
      };
    }

    const policy = calculatePasswordPolicy(emp);
    return {
      status: 200,
      data: {
        role: emp.role,
        status: emp.status || 'active',
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        ...policy,
      },
    };
  }
}
