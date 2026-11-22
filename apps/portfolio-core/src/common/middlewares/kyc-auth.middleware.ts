import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/security';

export interface IKycRequest extends Request {
  userId?: string;
  userRole?: string;
}

/**
 * Universal KYC authentication middleware.
 * Verifies JWT tokens from both the main user platform and RR module.
 */
export async function authenticateKycUser(
  req: IKycRequest,
  res: Response,
  next: NextFunction,
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
        message: 'Authentication token is required for KYC verification.',
      });
      return;
    }

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { id?: string; _id?: string; role?: string };
    req.userId = decoded.id || decoded._id;
    req.userRole = decoded.role;
    next();
  } catch (err: unknown) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication session for KYC verification.',
    });
  }
}
