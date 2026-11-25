import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import {
  DEFAULT_RR_HOMEPAGE_CONTENT,
  IRRHomePageContent,
} from './rr-home-content.model';

export class RRHomeContentService {
  /**
   * Get current homepage CMS configuration or merged default fallback
   */
  static async getHomeContent(): Promise<IRRHomePageContent> {
    const settingsCol = await RRDb.getSettingsCol();
    const doc = await settingsCol.findOne<{
      key: string;
      content?: IRRHomePageContent;
      updatedAt?: string;
      updatedBy?: string;
    }>({ key: 'rr_home_content' });

    if (!doc || !doc.content) {
      return DEFAULT_RR_HOMEPAGE_CONTENT;
    }

    const c = doc.content;
    const merged: IRRHomePageContent = {
      isCustomized: c.isCustomized ?? true,
      hero: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.hero,
        ...(c.hero || {}),
        banners:
          c.hero?.banners && c.hero.banners.length > 0
            ? c.hero.banners
            : DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners,
      },
      services: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.services,
        ...(c.services || {}),
        items:
          c.services?.items && c.services.items.length > 0
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
        paragraphs:
          c.about?.paragraphs && c.about.paragraphs.length > 0
            ? c.about.paragraphs
            : DEFAULT_RR_HOMEPAGE_CONTENT.about.paragraphs,
        stats:
          c.about?.stats && c.about.stats.length > 0
            ? c.about.stats
            : DEFAULT_RR_HOMEPAGE_CONTENT.about.stats,
      },
      contact: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.contact,
        ...(c.contact || {}),
        items:
          c.contact?.items && c.contact.items.length > 0
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

    return merged;
  }

  /**
   * Update dynamic homepage content (Admin)
   */
  static async updateHomeContent(
    payload: Partial<IRRHomePageContent>,
    staffId: string,
    role = 'admin',
  ): Promise<IRRHomePageContent> {
    const settingsCol = await RRDb.getSettingsCol();
    const now = new Date().toISOString();

    const contentToSave: IRRHomePageContent = {
      isCustomized: true,
      hero: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.hero,
        ...(payload.hero || {}),
        banners:
          Array.isArray(payload.hero?.banners) && payload.hero.banners.length > 0
            ? payload.hero.banners
            : DEFAULT_RR_HOMEPAGE_CONTENT.hero.banners,
      },
      services: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.services,
        ...(payload.services || {}),
        items:
          Array.isArray(payload.services?.items) && payload.services.items.length > 0
            ? payload.services.items
            : DEFAULT_RR_HOMEPAGE_CONTENT.services.items,
      },
      fleet: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.fleet,
        ...(payload.fleet || {}),
      },
      about: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.about,
        ...(payload.about || {}),
        paragraphs:
          Array.isArray(payload.about?.paragraphs) && payload.about.paragraphs.length > 0
            ? payload.about.paragraphs
            : DEFAULT_RR_HOMEPAGE_CONTENT.about.paragraphs,
        stats:
          Array.isArray(payload.about?.stats) && payload.about.stats.length > 0
            ? payload.about.stats
            : DEFAULT_RR_HOMEPAGE_CONTENT.about.stats,
      },
      contact: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.contact,
        ...(payload.contact || {}),
        items:
          Array.isArray(payload.contact?.items) && payload.contact.items.length > 0
            ? payload.contact.items
            : DEFAULT_RR_HOMEPAGE_CONTENT.contact.items,
      },
      footer: {
        ...DEFAULT_RR_HOMEPAGE_CONTENT.footer,
        ...(payload.footer || {}),
      },
      updatedAt: now,
      updatedBy: staffId,
    };

    await settingsCol.updateOne(
      { key: 'rr_home_content' },
      {
        $set: {
          key: 'rr_home_content',
          content: contentToSave,
          updatedAt: now,
          updatedBy: staffId,
        },
      },
      { upsert: true },
    );

    await RRLogService.logActivity(
      'UPDATE_HOMEPAGE_CONTENT',
      staffId,
      role,
      'Updated dynamic RR homepage content and banner configurations',
    );

    return contentToSave;
  }

  /**
   * Reset homepage content to factory defaults (Admin)
   */
  static async resetHomeContent(
    staffId: string,
    role = 'admin',
  ): Promise<IRRHomePageContent> {
    const settingsCol = await RRDb.getSettingsCol();
    const now = new Date().toISOString();

    await settingsCol.updateOne(
      { key: 'rr_home_content' },
      {
        $set: {
          key: 'rr_home_content',
          content: DEFAULT_RR_HOMEPAGE_CONTENT,
          updatedAt: now,
          updatedBy: staffId,
        },
      },
      { upsert: true },
    );

    await RRLogService.logActivity(
      'RESET_HOMEPAGE_CONTENT',
      staffId,
      role,
      'Restored factory default RR homepage content configuration',
    );

    return DEFAULT_RR_HOMEPAGE_CONTENT;
  }
}
