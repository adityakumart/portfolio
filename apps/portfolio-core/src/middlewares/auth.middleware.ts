import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';

const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key';

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Bearer token format is invalid.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
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
