import { Router } from 'express';
import { authenticateRRToken, requireManagerOrAdmin } from '../rr.middleware';
import { RRReportController } from './rr-report.controller';

const rrReportRouter = Router();

rrReportRouter.get('/status', authenticateRRToken, requireManagerOrAdmin, RRReportController.getStatusReport);
rrReportRouter.post('/log-download', authenticateRRToken, requireManagerOrAdmin, RRReportController.logReportDownload);

export { rrReportRouter };
