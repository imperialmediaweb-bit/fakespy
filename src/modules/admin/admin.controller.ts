import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { paginationSchema } from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

export class AdminController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid pagination', parsed.error.flatten().fieldErrors);
      }

      const result = await adminService.getUsers(parsed.data.page, parsed.data.limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid pagination', parsed.error.flatten().fieldErrors);
      }

      const result = await adminService.getSubscriptions(parsed.data.page, parsed.data.limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getUsageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getUsageStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
