import { Router, Request, Response, NextFunction } from 'express';
import { adScoreService } from './adScore.service';
import { authenticate } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
router.use(authenticate);

router.post('/:generationId', aiRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const score = await adScoreService.scoreGeneration(req.params.generationId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

router.get('/:generationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const score = await adScoreService.getScore(req.params.generationId);
    res.json({ success: true, data: score });
  } catch (err) { next(err); }
});

export default router;
