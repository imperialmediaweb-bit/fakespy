import { Router, Request, Response, NextFunction } from 'express';
import { adVariationsService } from './adVariations.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

const router = Router();
router.use(authenticate);

router.get('/styles', (_req: Request, res: Response) => {
  res.json({ success: true, data: adVariationsService.getAvailableStyles() });
});

const createSchema = z.object({
  generationId: z.string().uuid('Invalid generation ID'),
  style: z.enum(['short', 'emotional', 'direct_response', 'premium', 'urgency']),
});
const idSchema = z.object({ generationId: z.string().uuid('Invalid generation ID') });

// Each variation is an AI call, so it consumes generation quota.
router.post('/', aiRateLimiter, enforceLimit('generations'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const variation = await adVariationsService.generateVariation(req.userId!, parsed.data.generationId, parsed.data.style);
    res.status(201).json({ success: true, data: variation });
  } catch (err) { next(err); }
});

// Generating all 5 styles can be up to 5 AI calls; the service reserves quota per call.
router.post('/all/:generationId', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idSchema.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid generation ID', params.error.flatten().fieldErrors);
    const variations = await adVariationsService.generateAll(req.userId!, params.data.generationId);
    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
});

router.get('/:generationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idSchema.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid generation ID', params.error.flatten().fieldErrors);
    const variations = await adVariationsService.listByGeneration(req.userId!, params.data.generationId);
    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
});

export default router;
