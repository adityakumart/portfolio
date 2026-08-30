import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { AuthenticatedRequest } from '../types/express';
import { connectToDatabase } from '../utils/DB/mongodb';
import { User, UserRole, FileScopeInfo } from '@portfolio/shared-types';

export const ROOT_PATH = 'root/';

/**
 * Sanitizes full name for filesystem / S3 key compatibility
 */
export function sanitizeFolderName(name: string): string {
  if (!name) return 'User';
  // Replace invalid path characters and slashes
  return name.replace(/[/\\?%*:|"<>]/g, '').trim() || 'User';
}

/**
 * Computes dynamic upload and root directory based on user role and identity
 */
export function computeUserScope(user: User): FileScopeInfo {
  const USER_ID = user.id;
  const rawFullName = user.fullName || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
  const USER_FULL_NAME = sanitizeFolderName(rawFullName);
  const USER_ROLE: UserRole = user.admin ? 'admin' : 'user';
  const isAdmin = USER_ROLE === 'admin';

  // Admin has full visibility starting at ROOT_PATH ('root/')
  // Standard users are restricted to /root/users/{userId}-{fullName}/
  const UPLOAD_DIR = isAdmin 
    ? ROOT_PATH 
    : `${ROOT_PATH}users/${USER_ID}-${USER_FULL_NAME}/`;

  return {
    userRole: USER_ROLE,
    userId: USER_ID,
    userFullName: USER_FULL_NAME,
    rootPath: ROOT_PATH,
    uploadDir: UPLOAD_DIR,
    isAdmin,
    activePath: UPLOAD_DIR,
  };
}

/**
 * Express middleware to enforce Role-Based Access Control (RBAC) and directory isolation for files
 */
export async function enforceFileRBAC(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    const db = await connectToDatabase();
    const userCollection = db.collection('user');

    let objId: ObjectId | null = null;
    try {
      objId = new ObjectId(userId);
    } catch {
      // If not standard ObjectId, fallback to id query
    }

    const userDoc = objId 
      ? await userCollection.findOne({ _id: objId })
      : await userCollection.findOne({ id: userId });

    if (!userDoc) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
      return;
    }

    const user: User = {
      id: userDoc._id ? userDoc._id.toString() : String(userDoc['id']),
      email: userDoc['email'],
      first_name: userDoc['first_name'],
      last_name: userDoc['last_name'],
      fullName: `${userDoc['first_name'] || ''} ${userDoc['last_name'] || ''}`.trim(),
      admin: Boolean(userDoc['admin']),
      role: userDoc['admin'] ? 'admin' : 'user',
      isEnabled: userDoc['isEnabled'],
    };

    req.user = user;
    const scope = computeUserScope(user);
    req.fileScope = scope;

    // Security check: Check for path traversal attacks in query or body
    const rawPrefix = String(req.query['prefix'] || '');
    const rawKey = String(req.query['key'] || '');
    const rawBodyPath = String(req.body?.path || '');

    const inputsToCheck = [rawPrefix, rawKey, rawBodyPath].filter(Boolean);
    for (const input of inputsToCheck) {
      if (input.includes('..') || input.includes('\\') || input.includes('\0')) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: Directory traversal or invalid characters detected.',
        });
        return;
      }
    }

    next();
  } catch (error: any) {
    console.error('RBAC file middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
