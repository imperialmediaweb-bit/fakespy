import { Request, Response, NextFunction } from 'express';
import { exportsService } from './exports.service';
import { projectIdParamSchema } from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

export class ExportsController {
  async exportProject(req: Request, res: Response, next: NextFunction) {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
      }

      const result = await exportsService.exportProject(req.userId!, params.data.id);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const exports = await exportsService.findByUser(req.userId!);
      res.json({ success: true, data: exports });
    } catch (err) {
      next(err);
    }
  }
}

export const exportsController = new ExportsController();
