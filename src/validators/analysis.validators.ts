import { z } from 'zod';

export const createAnalysisSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  brandName: z.string().min(1, 'Brand name is required').max(200),
  niche: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  targetAudience: z.string().max(500).optional(),
  productDescription: z.string().max(2000).optional(),
  competitors: z.array(z.string().max(200)).max(20).optional(),
  notes: z.string().max(2000).optional(),
});

export const analysisIdParamSchema = z.object({
  id: z.string().uuid('Invalid analysis ID'),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
