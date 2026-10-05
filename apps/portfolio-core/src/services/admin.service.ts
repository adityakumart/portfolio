import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../utils/DB/mongodb';
import { getMovieModel } from '../models/movie.model';
import {
  AdminUserListItem,
  AdminUsersQuery,
  AdminUsersResponse,
  UpdateUserPermissionsPayload,
  AdminDashboardStats,
  UserModules,
} from '@portfolio/shared-types';

export class AdminService {
  /**
   * Fetches paginated users with optional search and role/status filtering.
   */
  static async getUsers(query: AdminUsersQuery): Promise<AdminUsersResponse> {
    const db = await connectToDatabase();
    const userCollection = db.collection('user');

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      is_deleted: { $ne: true },
    };

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(
        query.search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
        'i',
      );
      filter['$or'] = [
        { email: searchRegex },
        { first_name: searchRegex },
        { last_name: searchRegex },
      ];
    }

    if (query.role === 'masterAdmin') {
      filter['masterAdmin'] = true;
    } else if (query.role === 'admin') {
      filter['admin'] = true;
    } else if (query.role === 'user') {
      filter['admin'] = { $ne: true };
      filter['masterAdmin'] = { $ne: true };
    }

    if (query.status === 'enabled') {
      filter['isEnabled'] = true;
    } else if (query.status === 'disabled') {
      filter['isEnabled'] = false;
    }

    const [users, total] = await Promise.all([
      userCollection
        .find(filter)
        .sort({ user_logged_in_at: -1, updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      userCollection.countDocuments(filter),
    ]);

    const formattedUsers: AdminUserListItem[] = users.map((u) => ({
      id: u._id.toString(),
      email: u['email'] || '',
      first_name: u['first_name'] || '',
      last_name: u['last_name'] || '',
      admin: Boolean(u['admin']),
      masterAdmin: Boolean(u['masterAdmin']),
      masterFolder: Boolean(u['masterFolder']),
      isEnabled: Boolean(u['isEnabled']),
      is_deleted: Boolean(u['is_deleted']),
      modules: {
        aiSpace: Boolean(u['modules']?.aiSpace),
        aiAssistant: Boolean(u['modules']?.aiAssistant),
        fileManager: Boolean(u['modules']?.fileManager),
        dietHydration: Boolean(u['modules']?.dietHydration),
        planner: Boolean(u['modules']?.planner),
        game: Boolean(u['modules']?.game),
        movies: Boolean(u['modules']?.movies),
      },
      user_logged_in_at: u['user_logged_in_at'] || null,
      updated_at: u['updated_at'] || undefined,
    }));

    return {
      success: true,
      users: formattedUsers,
      total,
      page,
      limit,
    };
  }

  /**
   * Updates user permissions and module assignments.
   */
  static async updateUserPermissions(
    targetUserId: string,
    payload: UpdateUserPermissionsPayload,
    operatorUserId: string,
  ): Promise<AdminUserListItem> {
    const db = await connectToDatabase();
    const userCollection = db.collection('user');

    let targetObjId: ObjectId;
    try {
      targetObjId = new ObjectId(targetUserId);
    } catch {
      throw new Error('Invalid target user ID format');
    }

    const targetUser = await userCollection.findOne({ _id: targetObjId });
    if (!targetUser) {
      throw new Error('Target user not found');
    }

    // Safety guard: prevent self-demoting from masterAdmin
    if (
      targetUserId === operatorUserId &&
      payload.masterAdmin === false
    ) {
      throw new Error('You cannot remove masterAdmin privilege from your own account');
    }

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.admin === 'boolean') {
      updateFields['admin'] = payload.admin;
    }

    if (typeof payload.masterAdmin === 'boolean') {
      updateFields['masterAdmin'] = payload.masterAdmin;
    }

    if (typeof payload.isEnabled === 'boolean') {
      updateFields['isEnabled'] = payload.isEnabled;
    }

    if (typeof payload.masterFolder === 'boolean') {
      updateFields['masterFolder'] = payload.masterFolder;
    }

    if (payload.modules && typeof payload.modules === 'object') {
      const m = payload.modules;
      if (typeof m.aiSpace === 'boolean') updateFields['modules.aiSpace'] = m.aiSpace;
      if (typeof m.aiAssistant === 'boolean') updateFields['modules.aiAssistant'] = m.aiAssistant;
      if (typeof m.fileManager === 'boolean') updateFields['modules.fileManager'] = m.fileManager;
      if (typeof m.dietHydration === 'boolean') updateFields['modules.dietHydration'] = m.dietHydration;
      if (typeof m.planner === 'boolean') updateFields['modules.planner'] = m.planner;
      if (typeof m.game === 'boolean') updateFields['modules.game'] = m.game;
      if (typeof m.movies === 'boolean') updateFields['modules.movies'] = m.movies;
    }

    await userCollection.updateOne(
      { _id: targetObjId },
      { $set: updateFields },
    );

    const updated = await userCollection.findOne({ _id: targetObjId });
    if (!updated) {
      throw new Error('Failed to retrieve updated user');
    }

    return {
      id: updated._id.toString(),
      email: updated['email'] || '',
      first_name: updated['first_name'] || '',
      last_name: updated['last_name'] || '',
      admin: Boolean(updated['admin']),
      masterAdmin: Boolean(updated['masterAdmin']),
      masterFolder: Boolean(updated['masterFolder']),
      isEnabled: Boolean(updated['isEnabled']),
      is_deleted: Boolean(updated['is_deleted']),
      modules: {
        aiSpace: Boolean(updated['modules']?.aiSpace),
        aiAssistant: Boolean(updated['modules']?.aiAssistant),
        fileManager: Boolean(updated['modules']?.fileManager),
        dietHydration: Boolean(updated['modules']?.dietHydration),
        planner: Boolean(updated['modules']?.planner),
        game: Boolean(updated['modules']?.game),
        movies: Boolean(updated['modules']?.movies),
      },
      user_logged_in_at: updated['user_logged_in_at'] || null,
      updated_at: updated['updated_at'] || undefined,
    };
  }

  /**
   * Soft-deletes a user.
   */
  static async deleteUser(
    targetUserId: string,
    operatorUserId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (targetUserId === operatorUserId) {
      throw new Error('You cannot delete your own account');
    }

    const db = await connectToDatabase();
    const userCollection = db.collection('user');

    let targetObjId: ObjectId;
    try {
      targetObjId = new ObjectId(targetUserId);
    } catch {
      throw new Error('Invalid user ID format');
    }

    const result = await userCollection.updateOne(
      { _id: targetObjId },
      {
        $set: {
          is_deleted: true,
          isEnabled: false,
          updated_at: new Date().toISOString(),
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new Error('User not found');
    }

    return {
      success: true,
      message: 'User account has been deactivated successfully.',
    };
  }

  /**
   * Aggregates key system metrics for the Admin Dashboard tab.
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const db = await connectToDatabase();
    const userCollection = db.collection('user');
    const MovieModel = await getMovieModel();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

    const [
      totalUsers,
      masterAdminCount,
      activeUsersCount,
      aiSpaceCount,
      aiAssistantCount,
      fileManagerCount,
      dietHydrationCount,
      plannerCount,
      gameCount,
      moviesCount,
      totalMovies,
      untranslatedMoviesCount,
    ] = await Promise.all([
      userCollection.countDocuments({ is_deleted: { $ne: true } }),
      userCollection.countDocuments({ masterAdmin: true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({
        is_deleted: { $ne: true },
        user_logged_in_at: { $gte: thirtyDaysAgoIso },
      }),
      userCollection.countDocuments({ 'modules.aiSpace': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.aiAssistant': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.fileManager': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.dietHydration': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.planner': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.game': true, is_deleted: { $ne: true } }),
      userCollection.countDocuments({ 'modules.movies': true, is_deleted: { $ne: true } }),
      MovieModel.countDocuments(),
      MovieModel.countDocuments({
        $or: [
          { englishTranslation: { $in: ['', null, undefined] } },
          { teluguTranslation: { $in: ['', null, undefined] } },
        ],
      }),
    ]);

    const moduleAdoption: Record<keyof UserModules, number> = {
      aiSpace: aiSpaceCount,
      aiAssistant: aiAssistantCount,
      fileManager: fileManagerCount,
      dietHydration: dietHydrationCount,
      planner: plannerCount,
      game: gameCount,
      movies: moviesCount,
    };

    return {
      totalUsers,
      activeUsersCount,
      masterAdminCount,
      totalMovies,
      untranslatedMoviesCount,
      moduleAdoption,
    };
  }
}
