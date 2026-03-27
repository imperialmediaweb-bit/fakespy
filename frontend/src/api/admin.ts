import { api } from './client';
import type { ApiResponse } from '@/types/api';

export const adminApi = {
  getUsers(page = 1, limit = 20) {
    return api.get<ApiResponse<{ users: any[]; pagination: any }>>('/admin/users', { params: { page, limit } });
  },
  getSubscriptions(page = 1, limit = 20) {
    return api.get<ApiResponse<{ subscriptions: any[]; pagination: any }>>('/admin/subscriptions', { params: { page, limit } });
  },
  getUsageStats() {
    return api.get<ApiResponse<{ totalUsers: number; activeSubscriptions: number; currentMonth: string; monthlyUsage: { totalAnalyses: number; totalGenerations: number; totalExports: number } }>>('/admin/usage');
  },
};
