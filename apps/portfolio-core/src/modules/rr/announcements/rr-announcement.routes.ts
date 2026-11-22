import { Router } from 'express';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { RRAnnouncementController } from './rr-announcement.controller';

const rrAnnouncementRouter = Router();

rrAnnouncementRouter.get('/', authenticateRRToken, RRAnnouncementController.getAnnouncementsAndTicker);
rrAnnouncementRouter.put('/ticker', authenticateRRToken, requireAdmin, RRAnnouncementController.updateTicker);
rrAnnouncementRouter.post('/', authenticateRRToken, requireAdmin, RRAnnouncementController.createAnnouncement);
rrAnnouncementRouter.put('/:id', authenticateRRToken, requireAdmin, RRAnnouncementController.updateAnnouncement);
rrAnnouncementRouter.patch('/:id/toggle', authenticateRRToken, requireAdmin, RRAnnouncementController.toggleAnnouncement);
rrAnnouncementRouter.delete('/:id', authenticateRRToken, requireAdmin, RRAnnouncementController.deleteAnnouncement);

export { rrAnnouncementRouter };
