import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../../config/security';
import { RRService } from './rr.service';

export interface IRRRequest extends Request {
  userId?: string;
  userRole?: string;
}

export async function authenticateRRToken(
  req: IRRRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { id: string; role?: string };
    
    // Instant Revocation & Real-time Role Sync:
    // Verify that the employee still exists, has not been deleted, and has not been deactivated.
    const empCol = await RRService.getEmployeesCol();
    const emp = await empCol.findOne({ id: decoded.id, isDeleted: { $ne: true } });

    if (!emp) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Employee account does not exist or has been removed.',
      });
      return;
    }

    if (!emp.allowLogin) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Account access has been revoked by an administrator.',
      });
      return;
    }

    req.userId = emp.id;
    // Always use the real-time role from database to prevent stale token privilege escalation
    req.userRole = emp.role;
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
