import { Router, Request, Response, NextFunction } from 'express';
import { adVariationsService } from './adVariations.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

const router = Router();
router.use(authenticate);

router.get('/styles', (_req: Request, res: Response) => {
  res.json({ success: true, data: adVariationsService.getAvailableStyles() });
});

const createSchema = z.object({ generationId: z.string().uuid(), style: z.string().min(1) });

router.post('/', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const variation = await adVariationsService.generateVariation(req.userId!, parsed.data.generationId, parsed.data.style);
    res.status(201).json({ success: true, data: variation });
  } catch (err) { next(err); }
});

router.post('/all/:generationId', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variations = await adVariationsService.generateAll(req.userId!, req.params.generationId);
    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
});

router.get('/:generationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const variations = await adVariationsService.listByGeneration(req.params.generationId);
    res.json({ success: true, data: variations });
  } catch (err) { next(err); }
});

export default router;
