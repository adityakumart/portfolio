import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRCustomerController } from './rr-customer.controller';

const rrCustomerRouter = Router();

// Protect all customer routes with RR JWT authentication
rrCustomerRouter.use(authenticateRRToken);

// Billing membership discount check (must precede :id param)
rrCustomerRouter.get('/billing/discount', RRCustomerController.checkDiscount);

// Autocomplete lookup returning only id and name (must precede :id param)
rrCustomerRouter.get('/autocomplete', RRCustomerController.getCustomersAutocomplete);

// Customer CRUD operations
rrCustomerRouter.post('/', requireAdmin, RRCustomerController.createCustomer);
rrCustomerRouter.get('/', RRCustomerController.getCustomers);
rrCustomerRouter.get('/:id', RRCustomerController.getCustomerById);
rrCustomerRouter.put('/:id', requireAdmin, RRCustomerController.updateCustomer);
rrCustomerRouter.delete('/:id', requireAdmin, RRCustomerController.deleteCustomer);

export { rrCustomerRouter };
