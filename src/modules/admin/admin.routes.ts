import { Router, Request, Response, NextFunction } from 'express';
import { adminController } from './admin.controller';
import { systemSettingsService } from './systemSettings.service';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';

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

// System settings (provider configuration)
router.get('/settings/providers', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = await systemSettingsService.getConfigSchema();
    res.json({ success: true, data: schema });
  } catch (err) { next(err); }
});

router.get('/settings/all', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await systemSettingsService.getAll();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

const upsertSchema = z.object({ key: z.string().min(1), value: z.string().min(1) });

router.post('/settings/provider', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = upsertSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    await systemSettingsService.upsert(parsed.data.key, parsed.data.value);
    res.json({ success: true, message: `Setting ${parsed.data.key} saved` });
  } catch (err) { next(err); }
});

router.delete('/settings/provider/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await systemSettingsService.delete(req.params.key);
    res.json({ success: true, message: `Setting ${req.params.key} deleted` });
  } catch (err) { next(err); }
});

export default router;
