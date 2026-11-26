import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRWhatsAppController } from './rr-whatsapp.controller';

const rrWhatsAppRouter = Router();

rrWhatsAppRouter.get('/config', authenticateRRToken, RRWhatsAppController.getConfig);
rrWhatsAppRouter.put('/config', authenticateRRToken, requireAdmin, RRWhatsAppController.saveConfig);
rrWhatsAppRouter.post('/test', authenticateRRToken, requireAdmin, RRWhatsAppController.testDispatch);
rrWhatsAppRouter.post('/run-scheduler-sweep', authenticateRRToken, requireAdmin, RRWhatsAppController.runSchedulerSweep);

export { rrWhatsAppRouter };
