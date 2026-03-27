import { Request, Response, NextFunction } from 'express';
import { settingsService } from './settings.service';
import { ValidationError } from '../../lib/errors';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
}).refine((data) => data.name || data.email, {
  message: 'At least one field (name or email) is required',
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
});

const createApiKeySchema = z.object({
  provider: z.string().min(1).max(50),
  key: z.string().min(1).max(500),
});

const apiKeyIdParamSchema = z.object({
  id: z.string().uuid(),
});

export class SettingsController {
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await settingsService.getProfile(req.userId!);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const user = await settingsService.updateProfile(req.userId!, parsed.data);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = updatePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      await settingsService.updatePassword(req.userId!, parsed.data.currentPassword, parsed.data.newPassword);
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getApiKeys(req: Request, res: Response, next: NextFunction) {
    try {
      const keys = await settingsService.getApiKeys(req.userId!);
      res.json({ success: true, data: keys });
    } catch (err) {
      next(err);
    }
  }

  async createApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createApiKeySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const key = await settingsService.createApiKey(req.userId!, parsed.data.provider, parsed.data.key);
      res.status(201).json({ success: true, data: key });
    } catch (err) {
      next(err);
    }
  }

  async deleteApiKey(req: Request, res: Response, next: NextFunction) {
    try {
      const params = apiKeyIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid key ID', params.error.flatten().fieldErrors);
      }

      await settingsService.deleteApiKey(req.userId!, params.data.id);
      res.json({ success: true, message: 'API key deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export const settingsController = new SettingsController();
