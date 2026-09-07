import { api } from './client';
import type { ApiResponse, AdScore, AdVariation, AudienceProfile, BlogCategory, BlogPost, BlogPostStatus, BlogTag, Pagination, VariationStyle, VariationStyleInfo } from '@/types/api';

// ── Ad Score ──
export const adScoreApi = {
  score(generationId: string) {
    return api.post<ApiResponse<AdScore>>(`/ad-scores/${generationId}`);
  },
  get(generationId: string) {
    return api.get<ApiResponse<AdScore | null>>(`/ad-scores/${generationId}`);
  },
};

// ── Audience Builder ──
export const audienceApi = {
  generate(data: { projectId: string; name: string }) {
    return api.post<ApiResponse<AudienceProfile>>('/audience', data);
  },
  listByProject(projectId: string) {
    return api.get<ApiResponse<AudienceProfile[]>>(`/audience/project/${projectId}`);
  },
  get(id: string) {
    return api.get<ApiResponse<AudienceProfile>>(`/audience/${id}`);
  },
  delete(id: string) {
    return api.delete(`/audience/${id}`);
  },
};

// ── Ad Variations ──
export const variationsApi = {
  getStyles() {
    return api.get<ApiResponse<VariationStyleInfo[]>>('/variations/styles');
  },
  generate(data: { generationId: string; style: VariationStyle }) {
    return api.post<ApiResponse<AdVariation>>('/variations', data);
  },
  generateAll(generationId: string) {
    return api.post<ApiResponse<AdVariation[]>>(`/variations/all/${generationId}`);
  },
  list(generationId: string) {
    return api.get<ApiResponse<AdVariation[]>>(`/variations/${generationId}`);
  },
};

// ── Blog ──
export interface BlogPostInput {
  title: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  status?: BlogPostStatus;
  scheduledAt?: string;
  tagIds?: string[];
}

export const blogApi = {
  // Public
  getPublishedPosts(page = 1, limit = 10) {
    return api.get<ApiResponse<{ posts: BlogPost[]; pagination: Pagination }>>('/blog/public', { params: { page, limit } });
  },
  getPublishedPost(slug: string) {
    return api.get<ApiResponse<BlogPost>>(`/blog/public/${slug}`);
  },
  // Admin
  getCategories() { return api.get<ApiResponse<BlogCategory[]>>('/blog/categories'); },
  createCategory(name: string) { return api.post<ApiResponse<BlogCategory>>('/blog/categories', { name }); },
  updateCategory(id: string, name: string) { return api.patch<ApiResponse<BlogCategory>>(`/blog/categories/${id}`, { name }); },
  deleteCategory(id: string) { return api.delete(`/blog/categories/${id}`); },
  getTags() { return api.get<ApiResponse<BlogTag[]>>('/blog/tags'); },
  createTag(name: string) { return api.post<ApiResponse<BlogTag>>('/blog/tags', { name }); },
  deleteTag(id: string) { return api.delete(`/blog/tags/${id}`); },
  getPosts(page = 1, limit = 20, filters?: { status?: BlogPostStatus; search?: string }) {
    return api.get<ApiResponse<{ posts: BlogPost[]; pagination: Pagination }>>('/blog/posts', { params: { page, limit, ...filters } });
  },
  getPost(id: string) { return api.get<ApiResponse<BlogPost>>(`/blog/posts/${id}`); },
  createPost(data: BlogPostInput) { return api.post<ApiResponse<BlogPost>>('/blog/posts', data); },
  updatePost(id: string, data: Partial<BlogPostInput>) { return api.patch<ApiResponse<BlogPost>>(`/blog/posts/${id}`, data); },
  deletePost(id: string) { return api.delete(`/blog/posts/${id}`); },
};
