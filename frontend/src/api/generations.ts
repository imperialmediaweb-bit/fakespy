import { api } from './client';
import type { ApiResponse, AdGeneration, GenerationType } from '@/types/api';

export const generationsApi = {
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
