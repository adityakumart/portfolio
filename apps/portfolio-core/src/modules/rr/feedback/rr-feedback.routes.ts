import { Router } from 'express';
import multer from 'multer';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { uploadRateLimiter } from '../../../common/middlewares/rate-limit.middleware';
import { RRFeedbackController } from './rr-feedback.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

const rrFeedbackRouter = Router();

// Upload screenshot
rrFeedbackRouter.post(
  '/upload',
  authenticateRRToken,
  uploadRateLimiter,
  (req, res, next) => {
    upload.fields([
      { name: 'screenshot', maxCount: 1 },
      { name: 'image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
    ])(req, res, (err: unknown) => {
      if (err) {
        res.status(400).json({ error: 'Bad Request', message: (err as Error).message });
      } else {
        next();
      }
    });
  },
  RRFeedbackController.uploadScreenshot,
);

// Endpoints
rrFeedbackRouter.post('/', authenticateRRToken, RRFeedbackController.submitFeedback);
rrFeedbackRouter.get('/my', authenticateRRToken, RRFeedbackController.getMyFeedback);
rrFeedbackRouter.get('/stats', authenticateRRToken, requireAdmin, RRFeedbackController.getFeedbackStats);
rrFeedbackRouter.get('/', authenticateRRToken, requireAdmin, RRFeedbackController.getFeedbacks);
rrFeedbackRouter.patch('/:id/status', authenticateRRToken, requireAdmin, RRFeedbackController.updateFeedbackStatus);
rrFeedbackRouter.delete('/:id', authenticateRRToken, requireAdmin, RRFeedbackController.deleteFeedback);

export { rrFeedbackRouter };
