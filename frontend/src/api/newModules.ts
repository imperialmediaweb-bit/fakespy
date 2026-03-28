import { api } from './client';
import type { ApiResponse } from '@/types/api';

// ── Ad Score ──
export const adScoreApi = {
  score(generationId: string) {
    return api.post<ApiResponse<any>>(`/ad-scores/${generationId}`);
  },
  get(generationId: string) {
    return api.get<ApiResponse<any>>(`/ad-scores/${generationId}`);
  },
};

// ── Audience Builder ──
export const audienceApi = {
  generate(data: { projectId: string; name: string }) {
    return api.post<ApiResponse<any>>('/audience', data);
  },
  listByProject(projectId: string) {
    return api.get<ApiResponse<any[]>>(`/audience/project/${projectId}`);
  },
  get(id: string) {
    return api.get<ApiResponse<any>>(`/audience/${id}`);
  },
  delete(id: string) {
    return api.delete(`/audience/${id}`);
  },
};

// ── Ad Variations ──
export const variationsApi = {
  getStyles() {
    return api.get<ApiResponse<{ value: string; label: string; description: string }[]>>('/variations/styles');
  },
  generate(data: { generationId: string; style: string }) {
    return api.post<ApiResponse<any>>('/variations', data);
  },
  generateAll(generationId: string) {
    return api.post<ApiResponse<any[]>>(`/variations/all/${generationId}`);
  },
  list(generationId: string) {
    return api.get<ApiResponse<any[]>>(`/variations/${generationId}`);
  },
};

// ── Blog (Admin) ──
export const blogApi = {
  // Public
  getPublishedPosts(page = 1, limit = 10) {
    return api.get<ApiResponse<{ posts: any[]; pagination: any }>>('/blog/public', { params: { page, limit } });
  },
  getPublishedPost(slug: string) {
    return api.get<ApiResponse<any>>(`/blog/public/${slug}`);
  },
  // Admin
  getCategories() { return api.get<ApiResponse<any[]>>('/blog/categories'); },
  createCategory(name: string) { return api.post<ApiResponse<any>>('/blog/categories', { name }); },
  updateCategory(id: string, name: string) { return api.patch<ApiResponse<any>>(`/blog/categories/${id}`, { name }); },
  deleteCategory(id: string) { return api.delete(`/blog/categories/${id}`); },
  getTags() { return api.get<ApiResponse<any[]>>('/blog/tags'); },
  createTag(name: string) { return api.post<ApiResponse<any>>('/blog/tags', { name }); },
  deleteTag(id: string) { return api.delete(`/blog/tags/${id}`); },
  getPosts(page = 1, limit = 20, filters?: { status?: string; search?: string }) {
    return api.get<ApiResponse<{ posts: any[]; pagination: any }>>('/blog/posts', { params: { page, limit, ...filters } });
  },
  getPost(id: string) { return api.get<ApiResponse<any>>(`/blog/posts/${id}`); },
  createPost(data: any) { return api.post<ApiResponse<any>>('/blog/posts', data); },
  updatePost(id: string, data: any) { return api.patch<ApiResponse<any>>(`/blog/posts/${id}`, data); },
  deletePost(id: string) { return api.delete(`/blog/posts/${id}`); },
};
