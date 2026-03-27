import { api } from './client';
import type { ApiResponse, ApiKeyEntry, User, Usage } from '@/types/api';

export const settingsApi = {
  getSettings() {
    return api.get<ApiResponse<User & { usage: Usage }>>('/settings');
  },
  updateProfile(data: { name?: string; email?: string }) {
    return api.patch<ApiResponse<User>>('/settings/profile', data);
  },
  updatePassword(data: { currentPassword: string; newPassword: string }) {
    return api.patch('/settings/password', data);
  },
  getApiKeys() {
    return api.get<ApiResponse<ApiKeyEntry[]>>('/settings/api-keys');
  },
  createApiKey(data: { provider: string; key: string }) {
    return api.post<ApiResponse<ApiKeyEntry>>('/settings/api-keys', data);
  },
  deleteApiKey(id: string) {
    return api.delete(`/settings/api-keys/${id}`);
  },
};
