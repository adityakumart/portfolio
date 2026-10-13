import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { AuthenticatedRequest } from '../types/express';
import { getJwtSecret } from '../config/security';
import { connectToDatabase } from '../utils/DB/mongodb';

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    let token = authHeader ? authHeader.split(' ')[1] : undefined;
    if (!token && req.query['token'] && typeof req.query['token'] === 'string') {
      token = req.query['token'];
    }

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization token is required.',
      });
      return;
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    req.userId = decoded.id;

    // Instant Token Revocation & Deactivation Verification:
    // Verify that the user account exists, is active, and session has not been revoked/logged out.
    let objId: ObjectId;
    try {
      objId = new ObjectId(decoded.id);
    } catch {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid session identity.' });
      return;
    }

    const db = await connectToDatabase();
    const userDoc = await db.collection('user').findOne(
      { _id: objId },
      { projection: { access_token: 1, isEnabled: 1 } }
    );

    if (!userDoc) {
      res.status(401).json({ error: 'Unauthorized', message: 'User account not found.' });
      return;
    }

    if (userDoc['isEnabled'] === false) {
      res.status(403).json({ error: 'Forbidden', message: 'User account has been deactivated.' });
      return;
    }

    // If access_token was cleared in DB (via logout), reject the request immediately
    if (userDoc['access_token'] === null) {
      res.status(401).json({ error: 'Unauthorized', message: 'Session has been revoked or logged out.' });
      return;
    }

    next();
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Authentication middleware error:', err);
    res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Invalid or expired authorization token.',
    });
  }
}
