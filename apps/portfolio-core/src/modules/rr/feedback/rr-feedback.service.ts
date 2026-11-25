import { Filter, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import { RRDb } from '../common/rr-db.util';
import { RRLogService } from '../logs/rr-log.service';
import { safeRegex } from '../../../common/utils/security/regex.util';
import { RRRole } from '@portfolio/shared-types';
import {
  IRRFeedback,
  RRFeedbackStatus,
  RRFeedbackPage,
  RRFeedbackIssueType,
  IRRCreateFeedbackPayload,
  IRRUpdateFeedbackStatusPayload,
  RR_FEEDBACK_PAGES,
  RR_FEEDBACK_ISSUE_TYPES,
} from './rr-feedback.model';

export class RRFeedbackService {
  /**
   * Submit a new feedback ticket
   */
  static async submitFeedback(
    payload: IRRCreateFeedbackPayload,
    staffId: string,
    userRoleInput?: string,
  ): Promise<IRRFeedback> {
    const { page, issueType, description, imageUrl, imageKey, imageOriginalName } = payload;

    const validPages = RR_FEEDBACK_PAGES.map((p) => p.value);
    if (!page || !validPages.includes(page as RRFeedbackPage)) {
      throw new Error(`Invalid page selection. Must be one of: ${validPages.join(', ')}`);
    }

    const validIssueTypes = RR_FEEDBACK_ISSUE_TYPES.map((t) => t.value);
    if (!issueType || !validIssueTypes.includes(issueType as RRFeedbackIssueType)) {
      throw new Error(`Invalid issue type. Must be one of: ${validIssueTypes.join(', ')}`);
    }

    const trimmedDesc = typeof description === 'string' ? description.trim() : '';
    if (trimmedDesc.length < 10 || trimmedDesc.length > 1000) {
      throw new Error('Feedback description must be between 10 and 1000 characters.');
    }

    const empCol = await RRDb.getEmployeesCol();
    const emp = await empCol.findOne({ id: staffId });
    const userName = (emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id : staffId) || 'Staff';
    const userEmail = emp?.email || '';
    const userRole: RRRole = (emp?.role as RRRole) || (userRoleInput === 'admin' ? 'admin' : 'employee');

    const feedbackId = `RRFB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const feedbackDoc: IRRFeedback = {
      id: feedbackId,
      user: {
        id: staffId,
        name: userName,
        email: userEmail,
        role: userRole,
      },
      page: page as RRFeedbackPage,
      issueType: issueType as RRFeedbackIssueType,
      description: trimmedDesc,
      imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl.trim() : undefined,
      imageKey: typeof imageKey === 'string' && imageKey.trim() ? imageKey.trim() : undefined,
      imageOriginalName: typeof imageOriginalName === 'string' && imageOriginalName.trim() ? imageOriginalName.trim() : undefined,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };

    const feedbackCol = await RRDb.getFeedbackCol();
    await feedbackCol.insertOne(feedbackDoc as OptionalUnlessRequiredId<IRRFeedback>);

    await RRLogService.logActivity(
      'SUBMIT_FEEDBACK',
      staffId,
      userRole,
      `Submitted feedback ticket ${feedbackId} for ${page} (${issueType})`,
    );

    return feedbackDoc;
  }

  /**
   * Get feedback submitted by a specific user
   */
  static async getMyFeedback(staffId: string): Promise<IRRFeedback[]> {
    const feedbackCol = await RRDb.getFeedbackCol();
    return await feedbackCol
      .find({ 'user.id': staffId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Aggregate feedback statistics for administration
   */
  static async getFeedbackStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    onHold: number;
    completed: number;
    closed: number;
  }> {
    const feedbackCol = await RRDb.getFeedbackCol();
    const [total, open, inProgress, onHold, completed, closed] = await Promise.all([
      feedbackCol.countDocuments(),
      feedbackCol.countDocuments({ status: 'open' }),
      feedbackCol.countDocuments({ status: 'in-progress' }),
      feedbackCol.countDocuments({ status: 'on-hold' }),
      feedbackCol.countDocuments({ status: 'completed' }),
      feedbackCol.countDocuments({ status: 'closed' }),
    ]);

    return { total, open, inProgress, onHold, completed, closed };
  }

  /**
   * Query all feedbacks with filters, pagination, and regex search
   */
  static async getFeedbacks(params: {
    status?: string;
    page?: string;
    issueType?: string;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ total: number; data: IRRFeedback[] }> {
    const { status, page, issueType, search, limit, skip } = params;
    const filter: Filter<IRRFeedback> = {};

    if (status && typeof status === 'string' && status !== 'all') {
      filter.status = status as RRFeedbackStatus;
    }
    if (page && typeof page === 'string' && page !== 'all') {
      filter.page = page as RRFeedbackPage;
    }
    if (issueType && typeof issueType === 'string' && issueType !== 'all') {
      filter.issueType = issueType as RRFeedbackIssueType;
    }
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = safeRegex(search.trim(), 'i');
      filter.$or = [
        { id: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { 'user.name': { $regex: searchRegex } },
        { 'user.id': { $regex: searchRegex } },
        { 'user.email': { $regex: searchRegex } },
        { adminNotes: { $regex: searchRegex } },
      ];
    }

    const feedbackCol = await RRDb.getFeedbackCol();
    let query = feedbackCol.find(filter).sort({ createdAt: -1 });

    if (skip && !isNaN(Number(skip))) {
      query = query.skip(Number(skip));
    }
    if (limit && !isNaN(Number(limit))) {
      query = query.limit(Number(limit));
    }

    const data = await query.toArray();
    const total = await feedbackCol.countDocuments(filter);

    return { total, data };
  }

  /**
   * Update feedback status and admin resolution notes
   */
  static async updateFeedbackStatus(
    id: string,
    payload: IRRUpdateFeedbackStatusPayload,
    staffId: string,
    userRole = 'admin',
  ): Promise<IRRFeedback> {
    const { status, adminNotes } = payload;
    const validStatuses: RRFeedbackStatus[] = [
      'open',
      'in-progress',
      'on-hold',
      'completed',
      'closed',
    ];
    if (!status || !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const feedbackCol = await RRDb.getFeedbackCol();
    const isValidObjectId = ObjectId.isValid(id);
    const existing = await feedbackCol.findOne({
      $or: [
        { id },
        ...(isValidObjectId ? [{ _id: new ObjectId(id) }] : []),
      ],
    });

    if (!existing) {
      throw new Error(`Feedback ticket with ID ${id} was not found.`);
    }

    const now = new Date().toISOString();
    const updateDoc: Partial<IRRFeedback> = {
      status,
      updatedAt: now,
    };

    if (adminNotes !== undefined) {
      updateDoc.adminNotes = typeof adminNotes === 'string' ? adminNotes.trim() : '';
    }

    if (status === 'closed' || status === 'completed') {
      updateDoc.resolvedAt = now;
      updateDoc.resolvedBy = staffId;
    } else {
      updateDoc.resolvedAt = null;
      updateDoc.resolvedBy = null;
    }

    await feedbackCol.updateOne(
      { _id: existing._id },
      { $set: updateDoc },
    );

    const updated = await feedbackCol.findOne({ _id: existing._id });
    if (!updated) {
      throw new Error('Failed to retrieve updated feedback record.');
    }

    await RRLogService.logActivity(
      'UPDATE_FEEDBACK_STATUS',
      staffId,
      userRole,
      `Updated feedback ${existing.id} status to "${status}"`,
    );

    return updated;
  }

  /**
   * Delete feedback ticket (Admin only)
   */
  static async deleteFeedback(
    id: string,
    staffId: string,
    userRole = 'admin',
  ): Promise<void> {
    const feedbackCol = await RRDb.getFeedbackCol();
    const isValidObjectId = ObjectId.isValid(id);
    const existing = await feedbackCol.findOne({
      $or: [
        { id },
        ...(isValidObjectId ? [{ _id: new ObjectId(id) }] : []),
      ],
    });

    if (!existing) {
      throw new Error(`Feedback ticket with ID ${id} was not found.`);
    }

    await feedbackCol.deleteOne({ _id: existing._id });

    await RRLogService.logActivity(
      'DELETE_FEEDBACK',
      staffId,
      userRole,
      `Deleted feedback ticket ${existing.id}`,
    );
  }
}
