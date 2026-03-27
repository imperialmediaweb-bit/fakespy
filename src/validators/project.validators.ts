import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  brandName: z.string().min(1, 'Brand name is required').max(200),
  niche: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
  productDescription: z.string().max(2000).optional(),
  competitors: z.array(z.string().max(200)).max(20).optional(),
  inputData: z.record(z.unknown()).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  brandName: z.string().min(1).max(200).optional(),
  niche: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
  productDescription: z.string().max(2000).optional(),
  competitors: z.array(z.string().max(200)).max(20).optional(),
  inputData: z.record(z.unknown()).optional(),
});

export const projectIdParamSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
