export type UserRole = 'normal' | 'admin';

export type UserAccountStatus = 'active' | 'disabled' | 'expired';

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  expires_at?: string | null;
  status?: UserAccountStatus;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  invite_code: string;
};

export type InviteCodeStatus = 'available' | 'registered' | 'expired';

export type InviteCodeItem = {
  id: string;
  code: string;
  email?: string | null;
  created_by: string;
  used_by?: string | null;
  used_at?: string | null;
  expires_at?: string | null;
  status?: InviteCodeStatus;
  timestamp?: string | null;
};
