import { Router } from 'express';
import multer from 'multer';
import { authenticateRRToken, requireAdmin } from '../rr.middleware';
import { uploadRateLimiter } from '../../../common/middlewares/rate-limit.middleware';
import { RRVehicleController } from './rr-vehicle.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per image
});

const rrVehicleRouter = Router();

// Image upload
rrVehicleRouter.post(
  '/upload',
  authenticateRRToken,
  uploadRateLimiter,
  (req, res, next) => {
    upload.fields([
      { name: 'images', maxCount: 10 },
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
  RRVehicleController.uploadImage,
);

// Autocomplete and listing
rrVehicleRouter.get('/autocomplete', authenticateRRToken, RRVehicleController.getBookingVehiclesAutocomplete);
rrVehicleRouter.get('/:id/availability', authenticateRRToken, RRVehicleController.checkAvailability);
rrVehicleRouter.get('/', authenticateRRToken, RRVehicleController.getVehicles);

// CRUD
rrVehicleRouter.post('/', authenticateRRToken, requireAdmin, RRVehicleController.createVehicle);
rrVehicleRouter.put('/:id', authenticateRRToken, requireAdmin, RRVehicleController.updateVehicle);
rrVehicleRouter.delete('/:id', authenticateRRToken, requireAdmin, RRVehicleController.deleteVehicle);

export { rrVehicleRouter };
