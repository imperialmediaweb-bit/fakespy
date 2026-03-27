import { api } from './client';
import type { ApiResponse, Project, Pagination } from '@/types/api';

export const projectsApi = {
  list(page = 1, limit = 20) {
    return api.get<ApiResponse<{ projects: Project[]; pagination: Pagination }>>('/projects', { params: { page, limit } });
  },
  get(id: string) {
    return api.get<ApiResponse<Project>>(`/projects/${id}`);
  },
  create(data: { title: string; brandName: string; niche?: string; location?: string; targetAudience?: string; productDescription?: string; competitors?: string[] }) {
    return api.post<ApiResponse<Project>>('/projects', data);
  },
  update(id: string, data: Partial<{ title: string; brandName: string; niche: string; location: string; targetAudience: string; productDescription: string; competitors: string[] }>) {
    return api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
  },
  delete(id: string) {
    return api.delete(`/projects/${id}`);
  },
};
