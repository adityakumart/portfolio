import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'supersecretlocaljwtkey1234567890!';

export interface IRRRequest extends Request {
  userId?: string;
  userRole?: string;
}

export function authenticateRRToken(
  req: IRRRequest,
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

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error: unknown) {
    const err = error as Error;
    console.error('RR Authentication middleware error:', err);
    res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Invalid or expired authorization token.',
    });
  }
}

export function requireAdmin(
  req: IRRRequest,
  res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied. Administrator privileges required.',
    });
    return;
  }
  next();
}
