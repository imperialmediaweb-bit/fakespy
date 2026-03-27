import { Request, Response, NextFunction } from 'express';
import { projectsService } from './projects.service';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
  paginationSchema,
} from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

export class ProjectsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const project = await projectsService.create(req.userId!, parsed.data);

      res.status(201).json({ success: true, data: project });
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

      const result = await projectsService.findAllByUser(
        req.userId!,
        pagination.data.page,
        pagination.data.limit,
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
      }

      const project = await projectsService.findById(params.data.id, req.userId!);

      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
      }

      const body = updateProjectSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('Validation failed', body.error.flatten().fieldErrors);
      }

      const project = await projectsService.update(params.data.id, req.userId!, body.data);

      res.json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = projectIdParamSchema.safeParse(req.params);
      if (!params.success) {
        throw new ValidationError('Invalid project ID', params.error.flatten().fieldErrors);
      }

      await projectsService.delete(params.data.id, req.userId!);

      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const projectsController = new ProjectsController();
