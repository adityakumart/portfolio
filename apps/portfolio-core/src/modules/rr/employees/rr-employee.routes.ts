import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RREmployeeController } from './rr-employee.controller';

const rrEmployeeRouter = Router();

rrEmployeeRouter.get('/', authenticateRRToken, requireAdmin, RREmployeeController.getEmployees);
rrEmployeeRouter.post('/', authenticateRRToken, requireAdmin, RREmployeeController.createEmployee);
rrEmployeeRouter.put('/:id/activate', authenticateRRToken, requireAdmin, RREmployeeController.activateEmployee);
rrEmployeeRouter.post('/:id/reset-password', authenticateRRToken, requireAdmin, RREmployeeController.resetPassword);
rrEmployeeRouter.put('/:id', authenticateRRToken, requireAdmin, RREmployeeController.updateEmployee);
rrEmployeeRouter.delete('/:id', authenticateRRToken, requireAdmin, RREmployeeController.deleteEmployee);

export { rrEmployeeRouter };
