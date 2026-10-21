import { Router, Request, Response } from 'express';
import { RRService } from './rr.service';
import { safeRegex } from '../../utils/security/regex.util';
import { DEFAULT_RR_HOMEPAGE_CONTENT, IRRHomePageContent } from '@portfolio/shared-types';

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

// GET /api/rr/public/announcements
rrPublicRouter.get('/announcements', async (req: Request, res: Response) => {
  try {
    const settingsCol = await RRService.getSettingsCol();
    const announcementsCol = await RRService.getAnnouncementsCol();

    // 1. Fetch live ticker configuration
    const tickerDoc = await settingsCol.findOne({ key: 'rr_ticker' });
    const ticker = tickerDoc
      ? {
          message: tickerDoc.message || '',
          badgeText: tickerDoc.badgeText || 'ANNOUNCEMENT',
          isActive: tickerDoc.isActive !== false,
          speed: tickerDoc.speed || 'normal',
          linkText: tickerDoc.linkText || '',
          linkUrl: tickerDoc.linkUrl || '',
          updatedAt: tickerDoc.updatedAt || '',
        }
      : {
          message: '',
          badgeText: 'ANNOUNCEMENT',
          isActive: false,
          speed: 'normal',
        };

    // 2. Fetch active announcement cards (offers, intimations, festival wishes)
    const items = await announcementsCol
      .find({
        isDeleted: { $ne: true },
        isActive: true,
      })
      .sort({ priority: -1, createdAt: -1 })
      .toArray();

    res.json({ ticker, items });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// GET /api/rr/public/home-content
rrPublicRouter.get('/home-content', async (req: Request, res: Response) => {
  try {
    const settingsCol = await RRService.getSettingsCol();
    const doc = await settingsCol.findOne({ key: 'rr_home_content' });

    if (!doc || !doc.content) {
      res.json(DEFAULT_RR_HOMEPAGE_CONTENT);
      return;
    }

    const c = doc.content;
    const merged: IRRHomePageContent = {
      isCustomized: c.isCustomized ?? true,
      hero: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.hero,
        ...(c.hero || {}),
        banners: c.hero?.banners && c.hero.banners.length > 0
          ? c.hero.banners
          : DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners,
      },
      services: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.services,
        ...(c.services || {}),
        items: c.services?.items && c.services.items.length > 0
          ? c.services.items
          : DEFAULT_RR_HOMEPAGE_CONTENT.services.items,
      },
      fleet: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.fleet,
        ...(c.fleet || {}),
      },
      about: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.about,
        ...(c.about || {}),
        paragraphs: c.about?.paragraphs && c.about.paragraphs.length > 0
          ? c.about.paragraphs
          : DEFAULT_RR_HOMEPAGE_CONTENT.about.paragraphs,
        stats: c.about?.stats && c.about.stats.length > 0
          ? c.about.stats
          : DEFAULT_RR_HOMEPAGE_CONTENT.about.stats,
      },
      contact: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.contact,
        ...(c.contact || {}),
        items: c.contact?.items && c.contact.items.length > 0
          ? c.contact.items
          : DEFAULT_RR_HOMEPAGE_CONTENT.contact.items,
      },
      footer: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.footer,
        ...(c.footer || {}),
      },
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
    };

    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export { rrPublicRouter };
