import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRLogController } from './rr-log.controller';

const rrLogRouter = Router();

rrLogRouter.get('/', authenticateRRToken, requireAdmin, RRLogController.getLogs);

export { rrLogRouter };
