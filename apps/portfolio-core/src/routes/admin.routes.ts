import { Router } from 'express';
import {
  handleGetUsers,
  handleUpdateUserPermissions,
  handleDeleteUser,
  handleGetDashboardStats,
} from '../controllers/admin.controller';
import { requireMasterAdmin } from '../middlewares/admin.middleware';

export const adminRouter = Router();

// All admin routes strictly require masterAdmin checked against the DB in real-time
adminRouter.use(requireMasterAdmin);

adminRouter.get('/users', handleGetUsers);
adminRouter.patch('/users/:id/permissions', handleUpdateUserPermissions);
adminRouter.delete('/users/:id', handleDeleteUser);
adminRouter.get('/stats', handleGetDashboardStats);
