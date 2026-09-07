import { Router, Request, Response, NextFunction } from 'express';
import { audienceBuilderService } from './audienceBuilder.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

const router = Router();
router.use(authenticate);

const createSchema = z.object({ projectId: z.string().uuid('Invalid project ID'), name: z.string().min(1).max(200) });
const projectParam = z.object({ projectId: z.string().uuid('Invalid project ID') });
const idParam = z.object({ id: z.string().uuid('Invalid profile ID') });

// Generating a profile is an AI call, so it consumes generation quota.
router.post('/', aiRateLimiter, enforceLimit('generations'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const profile = await audienceBuilderService.generate(req.userId!, parsed.data.projectId, parsed.data.name);
    res.status(201).json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.get('/project/:projectId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = projectParam.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
    const profiles = await audienceBuilderService.listByProject(req.userId!, params.data.projectId);
    res.json({ success: true, data: profiles });
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idParam.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid profile ID', params.error.flatten().fieldErrors);
    const profile = await audienceBuilderService.getById(req.userId!, params.data.id);
    res.json({ success: true, data: profile });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = idParam.safeParse(req.params);
    if (!params.success) throw new ValidationError('Invalid profile ID', params.error.flatten().fieldErrors);
    await audienceBuilderService.delete(req.userId!, params.data.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
