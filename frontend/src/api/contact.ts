import { api } from './client';
import type { ApiResponse } from '@/types/api';

export const contactApi = {
  send(data: { name: string; email: string; message: string; website?: string }) {
    return api.post<ApiResponse<null>>('/contact', data);
  },
};
