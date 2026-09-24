import { Router, Request, Response } from 'express';
import { RRService } from './rr.service';
import { safeRegex } from '../../utils/security/regex.util';

const rrPublicRouter = Router();

/* ============================================================
   PUBLIC PORTAL APIS
   Dedicated, unauthenticated routes for public visitors.
   Strictly projects customer-facing fields and filters out
   internal/sensitive vehicle metadata.
============================================================ */

// GET /api/rr/public/vehicles
rrPublicRouter.get('/vehicles', async (req: Request, res: Response) => {
  try {
    const col = await RRService.getVehiclesCol();
    const { search, limit } = req.query;

    const filter: any = {
      isDeleted: { $ne: true },
      allowBooking: { $ne: false },
      status: { $nin: ['maintenance', 'contract', 'in_contract'] },
    };

    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = safeRegex(search.trim(), 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { manufacturer: { $regex: searchRegex } },
        { type: { $regex: searchRegex } },
      ];
    }

    let cursor = col
      .find(filter)
      .project({
        _id: 1,
        name: 1,
        manufacturer: 1,
        model: 1,
        type: 1,
        color: 1,
        seating: 1,
        fuelType: 1,
        images: 1,
        status: 1,
        allowBooking: 1,
      })
      .sort({ manufacturer: 1, name: 1 });

    const parsedLimit = limit ? parseInt(limit as string, 10) : 100;
    const safeLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 100;
    cursor = cursor.limit(safeLimit);

    const list = await cursor.toArray();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export { rrPublicRouter };
