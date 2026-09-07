import { api } from './client';
import type { ApiResponse, AdminSubscription, AdminUsageStats, AdminUser, AuditLog, Pagination } from '@/types/api';

export interface ProviderSetting { key: string; label: string; hasValue: boolean; sensitive: boolean }

export const adminApi = {
  getUsers(page = 1, limit = 20) {
    return api.get<ApiResponse<{ users: AdminUser[]; pagination: Pagination }>>('/admin/users', { params: { page, limit } });
  },
  getSubscriptions(page = 1, limit = 20) {
    return api.get<ApiResponse<{ subscriptions: AdminSubscription[]; pagination: Pagination }>>('/admin/subscriptions', { params: { page, limit } });
  },
  getUsageStats() {
    return api.get<ApiResponse<AdminUsageStats>>('/admin/usage');
  },
  getProjects(page = 1, limit = 20) {
    return api.get<ApiResponse<{ projects: any[]; pagination: Pagination }>>('/admin/projects', { params: { page, limit } });
  },
  getAnalyses(page = 1, limit = 20) {
    return api.get<ApiResponse<{ analyses: any[]; pagination: Pagination }>>('/admin/analyses', { params: { page, limit } });
  },
  getGenerations(page = 1, limit = 20) {
    return api.get<ApiResponse<{ generations: any[]; pagination: Pagination }>>('/admin/generations', { params: { page, limit } });
  },
  getExports(page = 1, limit = 20) {
    return api.get<ApiResponse<{ exports: any[]; pagination: Pagination }>>('/admin/exports', { params: { page, limit } });
  },
  getAuditLogs(page = 1, limit = 20) {
    return api.get<ApiResponse<{ logs: AuditLog[]; pagination: Pagination }>>('/admin/logs', { params: { page, limit } });
  },
  getProviderSchema() {
    return api.get<ApiResponse<Record<string, ProviderSetting[]>>>('/admin/settings/providers');
  },
  saveProviderSetting(key: string, value: string) {
    return api.post('/admin/settings/provider', { key, value });
  },
  deleteProviderSetting(key: string) {
    return api.delete(`/admin/settings/provider/${key}`);
  },
};
