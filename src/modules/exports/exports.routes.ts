import { Router } from 'express';
import { exportsController } from './exports.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { enforceLimit } from '../../middleware/planEnforcement.middleware';

const router = Router();

router.use(authenticate);

router.post('/project/:id', enforceLimit('exports'), (req, res, next) =>
  exportsController.exportProject(req, res, next),
);
router.get('/', (req, res, next) => exportsController.findAll(req, res, next));

export default router;
