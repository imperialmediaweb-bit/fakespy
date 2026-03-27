import { z } from 'zod';

export const generationTypeEnum = z.enum([
  'FACEBOOK_AD',
  'GOOGLE_AD',
  'VIDEO_SCRIPT',
  'HOOK',
  'CTA',
  'FULL_CAMPAIGN',
]);

export const createGenerationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  analysisId: z.string().uuid('Invalid analysis ID').optional(),
  type: generationTypeEnum,
  brandName: z.string().min(1, 'Brand name is required').max(200),
  niche: z.string().max(200).optional(),
  audience: z.string().max(500).optional(),
  tone: z
    .string()
    .max(100)
    .optional()
    .default('professional'),
  objective: z.string().max(500).optional(),
  competitorContext: z.string().max(2000).optional(),
  additionalInstructions: z.string().max(2000).optional(),
});

export const generationIdParamSchema = z.object({
  id: z.string().uuid('Invalid generation ID'),
});

export type CreateGenerationInput = z.infer<typeof createGenerationSchema>;
