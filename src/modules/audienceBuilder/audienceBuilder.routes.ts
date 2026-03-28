import { Router, Request, Response, NextFunction } from 'express';
import { audienceBuilderService } from './audienceBuilder.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

const router = Router();
router.use(authenticate);

const createSchema = z.object({ projectId: z.string().uuid(), name: z.string().min(1).max(200) });

router.post('/', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const profile = await audienceBuilderService.generate(req.userId!, parsed.data.projectId, parsed.data.name);
    res.status(201).json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.get('/project/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profiles = await audienceBuilderService.listByProject(req.userId!, req.params.projectId);
    res.json({ success: true, data: profiles });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await audienceBuilderService.getById(req.userId!, req.params.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await audienceBuilderService.delete(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
