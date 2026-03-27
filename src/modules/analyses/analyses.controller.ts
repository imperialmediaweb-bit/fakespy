import { Request, Response, NextFunction } from 'express';
import { analysesService } from './analyses.service';
import {
  createAnalysisSchema,
  analysisIdParamSchema,
} from '../../validators/analysis.validators';
import { projectIdParamSchema } from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

export class AnalysesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createAnalysisSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const analysis = await analysesService.create(req.userId!, parsed.data);

      res.status(202).json({
        success: true,
        data: analysis,
        message: 'Analysis started. Poll the analysis endpoint for results.',
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = analysisIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid analysis ID', params.error.flatten().fieldErrors);
      }

      const analysis = await analysesService.findById(params.data.id, req.userId!);

      res.json({ success: true, data: analysis });
    } catch (err) {
      next(err);
    }
  }

  async findByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
      }

      const analyses = await analysesService.findByProject(params.data.id, req.userId!);

      res.json({ success: true, data: analyses });
    } catch (err) {
      next(err);
    }
  }

  async rerun(req: Request, res: Response, next: NextFunction) {
    try {
      const params = analysisIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid analysis ID', params.error.flatten().fieldErrors);
      }

      const analysis = await analysesService.rerun(params.data.id, req.userId!);

      res.status(202).json({
        success: true,
        data: analysis,
        message: 'Analysis rerun started.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const analysesController = new AnalysesController();
