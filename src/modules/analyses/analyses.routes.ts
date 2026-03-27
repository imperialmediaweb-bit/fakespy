import { Router } from 'express';
import { analysesController } from './analyses.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

router.use(authenticate);

router.post('/', aiRateLimiter, enforceLimit('analyses'), (req, res, next) =>
  analysesController.create(req, res, next),
);
router.get('/:id', (req, res, next) => analysesController.findById(req, res, next));
router.post('/:id/rerun', aiRateLimiter, enforceLimit('analyses'), (req, res, next) =>
  analysesController.rerun(req, res, next),
);

export default router;
