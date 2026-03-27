import { api } from './client';
import type { ApiResponse, User } from '@/types/api';

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  },
  login(data: { email: string; password: string }) {
    return api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  },
  logout() {
    return api.post('/auth/logout');
  },
  me() {
    return api.get<ApiResponse<User>>('/auth/me');
  },
  forgotPassword(email: string) {
    return api.post<ApiResponse<null>>('/auth/forgot-password', { email });
  },
  resetPassword(token: string, password: string) {
    return api.post<ApiResponse<null>>('/auth/reset-password', { token, password });
  },
  verifyEmail(token: string) {
    return api.get<ApiResponse<null>>(`/auth/verify-email/${token}`);
  },
};
