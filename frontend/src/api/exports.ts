import { api } from './client';
import type { ApiResponse, ExportRecord } from '@/types/api';

export const exportsApi = {
  exportProject(projectId: string) {
    return api.post<ApiResponse<{ export: ExportRecord; data: Record<string, unknown> }>>(`/exports/project/${projectId}`);
  },
  list() {
    return api.get<ApiResponse<ExportRecord[]>>('/exports');
  },
};
