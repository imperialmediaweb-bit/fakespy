import { Request, Response, NextFunction } from 'express';
import { generationsService } from './generations.service';
import {
  createGenerationSchema,
  generationIdParamSchema,
} from '../../validators/generation.validators';
import { projectIdParamSchema, paginationSchema } from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

export class GenerationsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createGenerationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const generation = await generationsService.create(req.userId!, parsed.data);

      res.status(201).json({ success: true, data: generation });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = paginationSchema.safeParse(req.query);
      if (!pagination.success) {
        throw new ValidationError('Invalid pagination', pagination.error.flatten().fieldErrors);
      }
      const result = await generationsService.findAllByUser(req.userId!, pagination.data.page, pagination.data.limit);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = generationIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid generation ID', params.error.flatten().fieldErrors);
      }

      const generation = await generationsService.findById(params.data.id, req.userId!);

      res.json({ success: true, data: generation });
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

      const generations = await generationsService.findByProject(params.data.id, req.userId!);

      res.json({ success: true, data: generations });
    } catch (err) {
      next(err);
    }
  }
}

export const generationsController = new GenerationsController();
