import { User, UserRole } from '@portfolio/shared-types';

export interface IUserDocument extends User {
  _id?: unknown;
  password?: string;
  refresh_token?: string;
  access_token?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type { User, UserRole };
