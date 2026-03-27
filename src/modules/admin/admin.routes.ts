import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.get('/subscriptions', (req, res, next) => adminController.getSubscriptions(req, res, next));
router.get('/usage', (req, res, next) => adminController.getUsageStats(req, res, next));

export default router;
