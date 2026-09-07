import { Router, Request, Response, NextFunction } from 'express';
import { adScoreService } from './adScore.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

const router = Router();
router.use(authenticate);

const idSchema = z.object({ generationId: z.string().uuid('Invalid generation ID') });

// Scoring calls the AI provider, so it consumes generation quota.
router.post('/:generationId', aiRateLimiter, enforceLimit('generations'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idSchema.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid generation ID', params.error.flatten().fieldErrors);
    const score = await adScoreService.scoreGeneration(req.userId!, params.data.generationId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

router.get('/:generationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idSchema.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid generation ID', params.error.flatten().fieldErrors);
    const score = await adScoreService.getScore(req.userId!, params.data.generationId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

export default router;
