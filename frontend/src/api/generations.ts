import { api } from './client';
import type { ApiResponse, AdGeneration, GenerationType, Pagination } from '@/types/api';

export const generationsApi = {
  list(page = 1, limit = 20) {
    return api.get<ApiResponse<{ generations: AdGeneration[]; pagination: Pagination }>>('/generations', { params: { page, limit } });
  },
  create(data: {
    projectId: string;
    analysisId?: string;
    type: GenerationType;
    brandName: string;
    niche?: string;
    audience?: string;
    tone?: string;
    objective?: string;
    competitorContext?: string;
    additionalInstructions?: string;
  }) {
    return api.post<ApiResponse<AdGeneration>>('/generations', data);
  },
  get(id: string) {
    return api.get<ApiResponse<AdGeneration>>(`/generations/${id}`);
  },
  listByProject(projectId: string) {
    return api.get<ApiResponse<AdGeneration[]>>(`/projects/${projectId}/generations`);
  },
};
