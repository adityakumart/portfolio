import { Router } from 'express';
import { authenticateRRToken } from '../rr.middleware';
import { authRateLimiter } from '../../../common/middlewares/rate-limit.middleware';
import { RRAuthController } from './rr-auth.controller';

const rrAuthRouter = Router();

rrAuthRouter.post('/login', authRateLimiter, RRAuthController.login);
rrAuthRouter.post('/change-password', authenticateRRToken, RRAuthController.changePassword);
rrAuthRouter.post('/logout', authenticateRRToken, RRAuthController.logout);
rrAuthRouter.get('/permissions', authenticateRRToken, RRAuthController.getPermissions);

export { rrAuthRouter };
