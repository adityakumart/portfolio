import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateRRToken, requireAdmin } from '../app/rr/rr.middleware';

export const customerRouter = Router();

// Protect all customer routes with RR JWT authentication
customerRouter.use(authenticateRRToken);

// Billing membership discount check (must precede :id param)
customerRouter.get('/billing/discount', CustomerController.checkDiscount);

// Customer CRUD operations
customerRouter.post('/', CustomerController.createCustomer);
customerRouter.get('/', CustomerController.getCustomers);
customerRouter.get('/:id', CustomerController.getCustomerById);
customerRouter.put('/:id', CustomerController.updateCustomer);
customerRouter.delete('/:id', requireAdmin, CustomerController.deleteCustomer);
