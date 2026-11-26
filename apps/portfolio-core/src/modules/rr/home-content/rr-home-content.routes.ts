import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRHomeContentController } from './rr-home-content.controller';

const rrHomeContentRouter = Router();

rrHomeContentRouter.get('/', authenticateRRToken, requireAdmin, RRHomeContentController.getHomeContent);
rrHomeContentRouter.put('/', authenticateRRToken, requireAdmin, RRHomeContentController.updateHomeContent);
rrHomeContentRouter.post('/reset', authenticateRRToken, requireAdmin, RRHomeContentController.resetHomeContent);

export { rrHomeContentRouter };
