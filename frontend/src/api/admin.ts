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
    return api.get<ApiResponse<any>>('/admin/usage');
  },
  getProjects(page = 1, limit = 20) {
    return api.get<ApiResponse<{ projects: any[]; pagination: any }>>('/admin/projects', { params: { page, limit } });
  },
  getAnalyses(page = 1, limit = 20) {
    return api.get<ApiResponse<{ analyses: any[]; pagination: any }>>('/admin/analyses', { params: { page, limit } });
  },
  getGenerations(page = 1, limit = 20) {
    return api.get<ApiResponse<{ generations: any[]; pagination: any }>>('/admin/generations', { params: { page, limit } });
  },
  getExports(page = 1, limit = 20) {
    return api.get<ApiResponse<{ exports: any[]; pagination: any }>>('/admin/exports', { params: { page, limit } });
  },
  getAuditLogs(page = 1, limit = 20) {
    return api.get<ApiResponse<{ logs: any[]; pagination: any }>>('/admin/logs', { params: { page, limit } });
  },
  getProviderSchema() {
    return api.get<ApiResponse<Record<string, { key: string; label: string; hasValue: boolean; sensitive: boolean }[]>>>('/admin/settings/providers');
  },
  saveProviderSetting(key: string, value: string) {
    return api.post('/admin/settings/provider', { key, value });
  },
  deleteProviderSetting(key: string) {
    return api.delete(`/admin/settings/provider/${key}`);
  },
};
