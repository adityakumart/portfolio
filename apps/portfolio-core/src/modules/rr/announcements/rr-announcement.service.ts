import { ObjectId } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { IRRAnnouncementItem, IRRScrollingTicker } from './rr-announcement.model';

export class RRAnnouncementService {
  /**
   * Retrieves current ticker and active announcement cards.
   */
  static async getAnnouncementsAndTicker(): Promise<{
    ticker: IRRScrollingTicker;
    items: IRRAnnouncementItem[];
  }> {
    const settingsCol = await RRDb.getSettingsCol();
    const announcementsCol = await RRDb.getAnnouncementsCol();

    const tickerDoc = await settingsCol.findOne<IRRScrollingTicker>({ key: 'rr_ticker' });
    const ticker: IRRScrollingTicker = tickerDoc
      ? {
          message: tickerDoc.message || '',
          badgeText: tickerDoc.badgeText || 'ANNOUNCEMENT',
          isActive: tickerDoc.isActive !== false,
          speed: tickerDoc.speed || 'normal',
          linkText: tickerDoc.linkText || '',
          linkUrl: tickerDoc.linkUrl || '',
          updatedAt: tickerDoc.updatedAt || '',
          updatedBy: tickerDoc.updatedBy || '',
        }
      : {
          message: '',
          badgeText: 'ANNOUNCEMENT',
          isActive: false,
          speed: 'normal',
        };

    const items = await announcementsCol
      .find({ isDeleted: { $ne: true } })
      .sort({ priority: -1, createdAt: -1 })
      .toArray();

    return { ticker, items };
  }

  /**
   * Updates homepage ticker configurations.
   */
  static async updateTicker(
    body: Partial<IRRScrollingTicker>,
    userId = 'ADMIN',
    userRole = 'admin',
  ): Promise<IRRScrollingTicker> {
    const settingsCol = await RRDb.getSettingsCol();
    const now = new Date().toISOString();

    const updateDoc: IRRScrollingTicker = {
      message: (body.message || '').trim(),
      badgeText: (body.badgeText || 'ANNOUNCEMENT').trim(),
      isActive: body.isActive !== false,
      speed: ['slow', 'normal', 'fast'].includes(body.speed as string)
        ? body.speed
        : 'normal',
      linkText: (body.linkText || '').trim(),
      linkUrl: (body.linkUrl || '').trim(),
      updatedAt: now,
      updatedBy: userId,
    };

    await settingsCol.updateOne(
      { key: 'rr_ticker' },
      { $set: updateDoc as unknown as Record<string, unknown> },
      { upsert: true },
    );

    await RRLogService.logActivity(
      'UPDATE_TICKER_SETTINGS',
      userId,
      userRole,
      `Updated homepage scrolling ticker settings. Active: ${updateDoc.isActive}`,
    );

    return updateDoc;
  }

  /**
   * Creates a promotional or advisory announcement card.
   */
  static async createAnnouncement(
    body: Partial<IRRAnnouncementItem>,
    userId = 'ADMIN',
    userRole = 'admin',
  ): Promise<IRRAnnouncementItem> {
    const announcementsCol = await RRDb.getAnnouncementsCol();
    const { title, description, category } = body;

    if (!title || !description || !category) {
      throw new Error('Title, description, and category are required');
    }

    const now = new Date().toISOString();
    const newItem: IRRAnnouncementItem = {
      title: title.trim(),
      description: description.trim(),
      category: ['offer', 'intimation', 'festival'].includes(category)
        ? category
        : 'intimation',
      tag: body.tag?.trim() || '',
      promoCode: body.promoCode?.trim() || '',
      discountText: body.discountText?.trim() || '',
      validFrom: body.validFrom || undefined,
      validUntil: body.validUntil || undefined,
      ctaText: body.ctaText?.trim() || '',
      ctaAction: ['call', 'whatsapp', 'link', 'none'].includes(body.ctaAction as string)
        ? body.ctaAction
        : 'none',
      ctaLink: body.ctaLink?.trim() || '',
      icon: body.icon?.trim() || '',
      priority: Number(body.priority) || 0,
      isActive: body.isActive !== false,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
    };

    const insertResult = await announcementsCol.insertOne(newItem);
    newItem._id = insertResult.insertedId;

    await RRLogService.logActivity(
      'CREATE_ANNOUNCEMENT',
      userId,
      userRole,
      `Created announcement: "${newItem.title}" (${newItem.category})`,
    );

    return newItem;
  }

  /**
   * Updates an announcement card.
   */
  static async updateAnnouncement(
    id: string,
    body: Partial<IRRAnnouncementItem>,
    userId = 'ADMIN',
    userRole = 'admin',
  ): Promise<IRRAnnouncementItem> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid announcement ID');
    }

    const announcementsCol = await RRDb.getAnnouncementsCol();
    const existing = await announcementsCol.findOne({
      _id: new ObjectId(id),
      isDeleted: { $ne: true },
    });
    if (!existing) {
      throw new Error('Announcement not found');
    }

    const now = new Date().toISOString();
    const updateDoc: Partial<IRRAnnouncementItem> = {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(body.description !== undefined && { description: body.description.trim() }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tag !== undefined && { tag: body.tag.trim() }),
      ...(body.promoCode !== undefined && { promoCode: body.promoCode.trim() }),
      ...(body.discountText !== undefined && { discountText: body.discountText.trim() }),
      ...(body.validFrom !== undefined && { validFrom: body.validFrom }),
      ...(body.validUntil !== undefined && { validUntil: body.validUntil }),
      ...(body.ctaText !== undefined && { ctaText: body.ctaText.trim() }),
      ...(body.ctaAction !== undefined && { ctaAction: body.ctaAction }),
      ...(body.ctaLink !== undefined && { ctaLink: body.ctaLink.trim() }),
      ...(body.icon !== undefined && { icon: body.icon.trim() }),
      ...(body.priority !== undefined && { priority: Number(body.priority) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      updatedAt: now,
    };

    await announcementsCol.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc as Record<string, unknown> },
    );

    const updated = (await announcementsCol.findOne({ _id: new ObjectId(id) }))!;

    await RRLogService.logActivity(
      'UPDATE_ANNOUNCEMENT',
      userId,
      userRole,
      `Updated announcement: "${updated.title}"`,
    );

    return updated;
  }

  /**
   * Toggles active visibility status for an announcement.
   */
  static async toggleAnnouncement(
    id: string,
    isActive?: boolean,
    userId = 'ADMIN',
    userRole = 'admin',
  ): Promise<IRRAnnouncementItem> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid announcement ID');
    }

    const announcementsCol = await RRDb.getAnnouncementsCol();
    const existing = await announcementsCol.findOne({
      _id: new ObjectId(id),
      isDeleted: { $ne: true },
    });
    if (!existing) {
      throw new Error('Announcement not found');
    }

    const newActiveState = isActive !== undefined ? isActive : !existing.isActive;

    await announcementsCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: newActiveState,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        },
      },
    );

    const updated = (await announcementsCol.findOne({ _id: new ObjectId(id) }))!;

    await RRLogService.logActivity(
      'TOGGLE_ANNOUNCEMENT',
      userId,
      userRole,
      `Toggled announcement "${updated.title}" to ${newActiveState ? 'active' : 'inactive'}`,
    );

    return updated;
  }

  /**
   * Soft-deletes an announcement card.
   */
  static async deleteAnnouncement(
    id: string,
    userId = 'ADMIN',
    userRole = 'admin',
  ): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid announcement ID');
    }

    const announcementsCol = await RRDb.getAnnouncementsCol();
    const existing = await announcementsCol.findOne({
      _id: new ObjectId(id),
      isDeleted: { $ne: true },
    });
    if (!existing) {
      throw new Error('Announcement not found');
    }

    await announcementsCol.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: userId,
        },
      },
    );

    await RRLogService.logActivity(
      'DELETE_ANNOUNCEMENT',
      userId,
      userRole,
      `Deleted announcement: "${existing.title}"`,
    );
  }
}
