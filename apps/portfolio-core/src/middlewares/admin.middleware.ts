import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';
import { connectToDatabase } from '../utils/DB/mongodb';
import { getJwtSecret } from '../config/security';
import { User } from '@portfolio/shared-types';

/**
 * Middleware: requireMasterAdmin
 * Strictly enforces that the requesting user exists in MongoDB and has `masterAdmin === true`.
 * Checks the database in real-time on every transaction.
 */
export async function requireMasterAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
      return;
    }

    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid Authorization header format',
      });
      return;
    }

    const jwtSecret = getJwtSecret();
    let payload: { id: string };
    try {
      payload = jwt.verify(token, jwtSecret) as { id: string };
    } catch (err: unknown) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authorization token',
      });
      return;
    }

    if (!payload?.id) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token payload missing user identifier',
      });
      return;
    }

    // Direct Database Permission Check on every transaction
    const db = await connectToDatabase();
    const userCollection = db.collection('user');

    let objId: ObjectId;
    try {
      objId = new ObjectId(payload.id);
    } catch {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid user ID format in token',
      });
      return;
    }

    const userDoc = await userCollection.findOne({ _id: objId });
    if (!userDoc) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User account not found',
      });
      return;
    }

    if (userDoc['is_deleted'] === true) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Account has been deleted',
      });
      return;
    }

    if (userDoc['isEnabled'] === false) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Account is disabled',
      });
      return;
    }

    // Explicit check: only masterAdmin is allowed
    if (userDoc['masterAdmin'] !== true) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: masterAdmin privileges required',
      });
      return;
    }

    const safeUser: User = {
      id: userDoc._id.toString(),
      email: userDoc['email'],
      first_name: userDoc['first_name'],
      last_name: userDoc['last_name'],
      fullName: `${userDoc['first_name'] || ''} ${userDoc['last_name'] || ''}`.trim(),
      admin: Boolean(userDoc['admin']),
      masterAdmin: true,
      masterFolder: Boolean(userDoc['masterFolder']),
      isEnabled: Boolean(userDoc['isEnabled']),
      role: 'admin',
      modules: userDoc['modules'] || {},
    };

    req.user = safeUser;
    req.userId = safeUser.id;

    next();
  } catch (error: unknown) {
    console.error('requireMasterAdmin middleware error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message || 'Failed to authenticate master admin',
    });
  }
}
