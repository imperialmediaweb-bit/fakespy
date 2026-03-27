import { Router } from 'express';
import { settingsController } from './settings.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => settingsController.getSettings(req, res, next));
router.patch('/profile', (req, res, next) => settingsController.updateProfile(req, res, next));
router.patch('/password', (req, res, next) => settingsController.updatePassword(req, res, next));
router.get('/api-keys', (req, res, next) => settingsController.getApiKeys(req, res, next));
router.post('/api-keys', (req, res, next) => settingsController.createApiKey(req, res, next));
router.delete('/api-keys/:id', (req, res, next) => settingsController.deleteApiKey(req, res, next));

export default router;
