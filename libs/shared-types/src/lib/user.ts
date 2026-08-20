export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  admin?: boolean;
  isEnabled?: boolean;
  is_deleted?: boolean;
  access_token?: string | null;
  refresh_token?: string | null;
  user_logged_in_at?: string | null;
  updated_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: User;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}
