import { Router } from 'express';
import { projectsController } from './projects.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { enforceProjectLimit } from '../../middleware/planEnforcement.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => projectsController.findAll(req, res, next));
router.post('/', enforceProjectLimit(), (req, res, next) => projectsController.create(req, res, next));
router.get('/:id', (req, res, next) => projectsController.findById(req, res, next));
router.patch('/:id', (req, res, next) => projectsController.update(req, res, next));
router.delete('/:id', (req, res, next) => projectsController.delete(req, res, next));

export default router;
