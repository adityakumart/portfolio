import { Request } from 'express';
import { User, FileScopeInfo } from '@portfolio/shared-types';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: User;
  fileScope?: FileScopeInfo;
}
