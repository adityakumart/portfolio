import * as bcrypt from 'bcrypt';
import { Filter } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { IEmployee } from './rr-employee.model';
import { escapeRegex } from '../../../common/utils/security/regex.util';

export class RREmployeeService {
  /**
   * Returns employees list after executing the 60-day inactivity check.
   */
  static async getEmployees(includeDeleted = false): Promise<IEmployee[]> {
    const col = await RRDb.getEmployeesCol();

    // 60-day inactivity sweep: automatically deactivate any active employee who has not logged in for 60+ days
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
    await col.updateMany(
      {
        status: 'active',
        lastLoginAt: { $lt: sixtyDaysAgo },
        isDeleted: { $ne: true },
      },
      {
        $set: { status: 'deactivated', allowLogin: false },
      },
    );

    const filter: Filter<IEmployee> = {};
    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }
    const list = await col.find(filter).toArray();

    return list.map((emp) => ({
      ...emp,
      status: emp.status || (emp.allowLogin !== false ? 'active' : 'deactivated'),
    }));
  }

  /**
   * Registers a new employee in 'pending_activation' state.
   */
  static async createEmployee(
    data: Omit<IEmployee, 'id' | 'createdAt'> & { password?: string },
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<IEmployee> {
    const col = await RRDb.getEmployeesCol();

    const duplicate = await col.findOne({
      firstName: { $regex: new RegExp(`^${escapeRegex(data.firstName)}$`, 'i') },
      lastName: { $regex: new RegExp(`^${escapeRegex(data.lastName)}$`, 'i') },
      dob: data.dob,
      isDeleted: { $ne: true },
    });

    if (duplicate) {
      throw new Error(`Employee ${data.firstName} ${data.lastName} already exists.`);
    }

    const employeesList = await col.find().toArray();
    let maxNumber = 0;
    employeesList.forEach((emp) => {
      const num = parseInt(emp.id.replace(/\D/g, ''), 10);
      if (num > maxNumber) maxNumber = num;
    });
    const newId = 'RRA' + String(maxNumber + 1).padStart(3, '0');

    let passwordHash: string | undefined = undefined;
    const rawPassword =
      data.password && typeof data.password === 'string' && data.password.trim()
        ? data.password.trim()
        : data.dob || (data.role === 'admin' ? 'AdminPD' : 'RoadReady@123');

    if (rawPassword) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(rawPassword, saltRounds);
    }

    delete data.password;

    const newEmp: IEmployee = {
      ...data,
      id: newId,
      status: 'pending_activation',
      allowLogin: false,
      isFirstLogin: true,
      mustChangePassword: true,
      passwordLastChangedAt: null,
      lastLoginAt: null,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    await col.insertOne(newEmp);

    RRLogService.logActivity(
      `Registered employee ${newEmp.id}`,
      performedBy,
      performedRole,
      `Employee registered (Pending Activation): ${newEmp.firstName} ${newEmp.lastName} (Role: ${newEmp.role.toUpperCase()}, Phone: ${newEmp.phone})`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log added employee:', logErr));

    return newEmp;
  }

  /**
   * Activates pending or deactivated staff account.
   */
  static async activateEmployee(
    empId: string,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<IEmployee> {
    const col = await RRDb.getEmployeesCol();
    const emp = await col.findOne({ id: empId, isDeleted: { $ne: true } });
    if (!emp) {
      throw new Error('Employee not found or has been deleted');
    }

    await col.updateOne(
      { id: empId },
      {
        $set: {
          status: 'active',
          allowLogin: true,
          lastLoginAt: new Date().toISOString(),
          lockoutUntil: null,
          failedLoginAttempts: 0,
        },
      },
    );

    const updated = (await col.findOne({ id: empId }))!;

    RRLogService.logActivity(
      `Activated staff ${empId}`,
      performedBy,
      performedRole,
      `Administrator activated user ${emp.firstName} ${emp.lastName} (${empId}). Account status changed to ACTIVE.`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log user activation:', logErr));

    return updated;
  }

  /**
   * Resets employee credentials and forces change on next login.
   */
  static async resetPassword(
    empId: string,
    temporaryPassword?: string,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<{ message: string; temporaryPassword: string }> {
    const col = await RRDb.getEmployeesCol();
    const emp = await col.findOne({ id: empId, isDeleted: { $ne: true } });
    if (!emp) {
      throw new Error('Employee not found or has been deleted');
    }

    const tempPass =
      temporaryPassword && typeof temporaryPassword === 'string' && temporaryPassword.trim()
        ? temporaryPassword.trim()
        : emp.dob || 'RoadReady@123';

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(tempPass, saltRounds);

    await col.updateOne(
      { id: empId },
      {
        $set: {
          passwordHash,
          mustChangePassword: true,
          isFirstLogin: true,
          passwordLastChangedAt: null,
          lockoutUntil: null,
          failedLoginAttempts: 0,
        },
      },
    );

    RRLogService.logActivity(
      `Reset credentials ${empId}`,
      performedBy,
      performedRole,
      `Administrator initiated password reset for ${emp.firstName} ${emp.lastName} (${empId}). Forced password update enabled on next login.`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log admin password reset:', logErr));

    return {
      message: `Password reset successfully for ${emp.firstName} ${emp.lastName}. User must configure a new password upon their next login.`,
      temporaryPassword: tempPass,
    };
  }

  /**
   * Updates employee profile fields.
   */
  static async updateEmployee(
    empId: string,
    updateData: Record<string, unknown>,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<IEmployee> {
    const col = await RRDb.getEmployeesCol();
    const emp = await col.findOne({ id: empId });
    if (!emp || emp.isDeleted) {
      throw new Error('Employee not found or has been deleted');
    }

    delete updateData['_id'];
    delete updateData['id'];
    delete updateData['createdAt'];

    if (
      updateData['password'] &&
      typeof updateData['password'] === 'string' &&
      updateData['password'].trim()
    ) {
      const saltRounds = 10;
      updateData['passwordHash'] = await bcrypt.hash(updateData['password'].trim(), saltRounds);
      updateData['passwordLastChangedAt'] = new Date().toISOString();
      updateData['mustChangePassword'] = false;
    }
    delete updateData['password'];

    if (updateData['allowLogin'] !== undefined && updateData['status'] === undefined) {
      updateData['status'] = updateData['allowLogin'] ? 'active' : 'deactivated';
    } else if (updateData['status'] !== undefined && updateData['allowLogin'] === undefined) {
      updateData['allowLogin'] = updateData['status'] === 'active';
    }

    await col.updateOne({ id: empId }, { $set: updateData });

    const updated = (await col.findOne({ id: empId }))!;
    const modDetails = [
      updateData['role'] ? `Role: ${updateData['role']}` : null,
      updateData['status'] ? `Status: ${updateData['status']}` : null,
      updateData['allowLogin'] !== undefined
        ? `Login: ${updateData['allowLogin'] ? 'Allowed' : 'Disabled'}`
        : null,
      updateData['phone'] ? `Phone: ${updateData['phone']}` : null,
      updateData['email'] ? `Email: ${updateData['email']}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    RRLogService.logActivity(
      `Modified employee ${empId}`,
      performedBy,
      performedRole,
      `Updated staff ${emp.firstName} ${emp.lastName}: [${modDetails || 'profile modified'}]`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log modified employee:', logErr));

    return updated;
  }

  /**
   * Soft-deletes employee account.
   */
  static async deleteEmployee(
    empId: string,
    performedBy = 'admin',
    performedRole = 'admin',
  ): Promise<{ message: string }> {
    if (performedBy === empId) {
      throw new Error('You cannot delete your own administrative account.');
    }

    const col = await RRDb.getEmployeesCol();
    const emp = await col.findOne({ id: empId });
    if (!emp || emp.isDeleted) {
      throw new Error('Employee not found');
    }

    await col.updateOne(
      { id: empId },
      {
        $set: {
          allowLogin: false,
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: performedBy,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    RRLogService.logActivity(
      `Soft-deleted employee ${empId}`,
      performedBy,
      performedRole,
      `Employee soft-deleted: ${emp.firstName} ${emp.lastName} (Role: ${emp.role.toUpperCase()}, Phone: ${emp.phone})`,
    ).catch((logErr) => console.error('[AuditLog] Failed to log soft-deleted employee:', logErr));

    return { message: `Employee ${empId} deleted successfully.` };
  }
}
