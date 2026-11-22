import { Router } from 'express';
import { RRPublicController } from './rr-public.controller';

const rrPublicRouter = Router();

rrPublicRouter.get('/vehicles', RRPublicController.getPublicVehicles);
rrPublicRouter.get('/announcements', RRPublicController.getPublicAnnouncements);
rrPublicRouter.get('/home-content', RRPublicController.getPublicHomeContent);
rrPublicRouter.get('/invoice/:token', RRPublicController.getPublicInvoice);

export { rrPublicRouter };
