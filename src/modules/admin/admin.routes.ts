import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.get('/subscriptions', (req, res, next) => adminController.getSubscriptions(req, res, next));
router.get('/usage', (req, res, next) => adminController.getUsageStats(req, res, next));
router.get('/projects', (req, res, next) => adminController.getProjects(req, res, next));
router.get('/analyses', (req, res, next) => adminController.getAnalyses(req, res, next));
router.get('/generations', (req, res, next) => adminController.getGenerations(req, res, next));
router.get('/exports', (req, res, next) => adminController.getExports(req, res, next));
router.get('/logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

export default router;
