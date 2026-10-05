import { UserModules } from './user';

export interface AdminUserListItem {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  admin: boolean;
  masterAdmin: boolean;
  masterFolder?: boolean;
  isEnabled: boolean;
  is_deleted?: boolean;
  modules: UserModules;
  user_logged_in_at?: string | null;
  updated_at?: string;
  created_at?: string;
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'all' | 'masterAdmin' | 'admin' | 'user';
  status?: 'all' | 'enabled' | 'disabled';
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateUserPermissionsPayload {
  admin?: boolean;
  masterAdmin?: boolean;
  isEnabled?: boolean;
  masterFolder?: boolean;
  modules?: Partial<UserModules>;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsersCount: number;
  masterAdminCount: number;
  totalMovies: number;
  untranslatedMoviesCount: number;
  moduleAdoption: Record<keyof UserModules, number>;
}

export interface CreateMoviePayload {
  title: string;
  cast?: string;
  englishTranslation: string;
  teluguTranslation?: string;
  year?: number;
}

export interface UpdateMoviePayload {
  title?: string;
  cast?: string;
  englishTranslation?: string;
  teluguTranslation?: string;
  year?: number;
}
