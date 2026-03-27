import { Router } from 'express';
import { generationsController } from './generations.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();

router.use(authenticate);

router.post('/', aiRateLimiter, enforceLimit('generations'), (req, res, next) =>
  generationsController.create(req, res, next),
);
router.get('/:id', (req, res, next) => generationsController.findById(req, res, next));

export default router;
