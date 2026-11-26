import { Router } from 'express';
import { authenticateRRToken } from './rr.middleware';
import { rrAuthRouter } from './auth/rr-auth.routes';
import { rrVehicleRouter } from './vehicles/rr-vehicle.routes';
import { rrBookingRouter } from './bookings/rr-booking.routes';
import { rrEmployeeRouter } from './employees/rr-employee.routes';
import { rrCustomerRouter } from './customers/rr-customer.routes';
import { rrAnnouncementRouter } from './announcements/rr-announcement.routes';
import { rrHomeContentRouter } from './home-content/rr-home-content.routes';
import { rrFeedbackRouter } from './feedback/rr-feedback.routes';
import { rrReportRouter } from './reports/rr-report.routes';
import { rrLogRouter } from './logs/rr-log.routes';
import { rrWhatsAppRouter } from './whatsapp/rr-whatsapp.routes';
import { rrPublicRouter } from './public/rr-public.routes';
import { RRLogController } from './logs/rr-log.controller';

const rrRouter = Router();

// Unauthenticated public portal endpoints
rrRouter.use('/public', rrPublicRouter);

// Domain sub-routers
rrRouter.use('/auth', rrAuthRouter);
rrRouter.use('/vehicles', rrVehicleRouter);
rrRouter.use('/bookings', rrBookingRouter);
rrRouter.use('/employees', rrEmployeeRouter);
rrRouter.use('/customers', rrCustomerRouter);
rrRouter.use('/announcements', rrAnnouncementRouter);
rrRouter.use('/home-content', rrHomeContentRouter);
rrRouter.use('/feedback', rrFeedbackRouter);
rrRouter.use('/reports', rrReportRouter);
rrRouter.use('/logs', rrLogRouter);
rrRouter.use('/whatsapp', rrWhatsAppRouter);

// Dashboard aggregate stats
rrRouter.get('/dashboard/stats', authenticateRRToken, RRLogController.getDashboardStats);

export { rrRouter };
