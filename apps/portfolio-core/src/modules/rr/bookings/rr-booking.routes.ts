import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRBookingController } from './rr-booking.controller';

const rrBookingRouter = Router();

// Advance sweeps and vehicle helpers
rrBookingRouter.post('/advance/auto-close', authenticateRRToken, RRBookingController.autoCloseIdleAdvance);
rrBookingRouter.get('/vehicles/autocomplete', authenticateRRToken, RRBookingController.getBookingVehiclesAutocomplete);
rrBookingRouter.get('/vehicles', authenticateRRToken, RRBookingController.getBookingVehiclesAutocomplete);

// WhatsApp notification helpers for bookings
rrBookingRouter.get('/:id/whatsapp/preview', authenticateRRToken, RRBookingController.previewWhatsApp);
rrBookingRouter.post('/:id/whatsapp/send', authenticateRRToken, RRBookingController.sendWhatsApp);

// Lifecycle actions
rrBookingRouter.post('/:id/close-advance', authenticateRRToken, RRBookingController.closeAdvanceBooking);
rrBookingRouter.post('/:id/customer-intimation', authenticateRRToken, RRBookingController.recordCustomerIntimation);

// Standard CRUD
rrBookingRouter.get('/', authenticateRRToken, RRBookingController.getBookings);
rrBookingRouter.post('/', authenticateRRToken, RRBookingController.createBooking);
rrBookingRouter.put('/:id', authenticateRRToken, RRBookingController.updateBooking);
rrBookingRouter.delete('/:id', authenticateRRToken, requireAdmin, RRBookingController.deleteBooking);

export { rrBookingRouter };
