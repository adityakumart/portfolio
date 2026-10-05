import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AdminService } from '../services/admin.service';

export async function handleGetUsers(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const page = req.query['page'] ? Number(req.query['page']) : 1;
    const limit = req.query['limit'] ? Number(req.query['limit']) : 20;
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
    const role = typeof req.query['role'] === 'string' ? (req.query['role'] as any) : 'all';
    const status = typeof req.query['status'] === 'string' ? (req.query['status'] as any) : 'all';

    const result = await AdminService.getUsers({ page, limit, search, role, status });
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching admin users:', err);
    res.status(500).json({
      success: false,
      error: 'Query Failed',
      message: err.message || 'Failed to fetch users',
    });
  }
}

export async function handleUpdateUserPermissions(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const rawId = req.params['id'];
    const targetUserId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!targetUserId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    const operatorUserId = req.userId || '';
    const updatedUser = await AdminService.updateUserPermissions(
      targetUserId,
      req.body,
      operatorUserId,
    );

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'User permissions updated successfully',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating user permissions:', err);
    res.status(400).json({
      success: false,
      error: 'Update Failed',
      message: err.message || 'Failed to update user permissions',
    });
  }
}

export async function handleDeleteUser(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const rawId = req.params['id'];
    const targetUserId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!targetUserId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'User ID is required',
      });
      return;
    }

    const operatorUserId = req.userId || '';
    const result = await AdminService.deleteUser(targetUserId, operatorUserId);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting user:', err);
    res.status(400).json({
      success: false,
      error: 'Delete Failed',
      message: err.message || 'Failed to deactivate user',
    });
  }
}

export async function handleGetDashboardStats(
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  try {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({
      success: false,
      error: 'Query Failed',
      message: err.message || 'Failed to fetch dashboard stats',
    });
  }
}
