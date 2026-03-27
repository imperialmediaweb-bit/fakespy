import { api } from './client';
import type { ApiResponse, Analysis } from '@/types/api';

export const analysesApi = {
  create(data: { projectId: string; brandName: string; niche?: string; location?: string; targetAudience?: string; productDescription?: string; competitors?: string[]; notes?: string }) {
    return api.post<ApiResponse<Analysis>>('/analyses', data);
  },
  get(id: string) {
    return api.get<ApiResponse<Analysis>>(`/analyses/${id}`);
  },
  listByProject(projectId: string) {
    return api.get<ApiResponse<Analysis[]>>(`/projects/${projectId}/analyses`);
  },
  rerun(id: string) {
    return api.post<ApiResponse<Analysis>>(`/analyses/${id}/rerun`);
  },
};
