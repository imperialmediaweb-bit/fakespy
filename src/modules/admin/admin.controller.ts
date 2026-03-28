import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { paginationSchema } from '../../validators/project.validators';
import { ValidationError } from '../../lib/errors';

function parsePagination(query: any) {
  const parsed = paginationSchema.safeParse(query);
  if (!parsed.success) throw new ValidationError('Invalid pagination', parsed.error.flatten().fieldErrors);
  return parsed.data;
}

export class AdminController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getUsers(page, limit) }); } catch (err) { next(err); }
  }
  async getSubscriptions(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getSubscriptions(page, limit) }); } catch (err) { next(err); }
  }
  async getUsageStats(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: await adminService.getUsageStats() }); } catch (err) { next(err); }
  }
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getProjects(page, limit) }); } catch (err) { next(err); }
  }
  async getAnalyses(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getAnalyses(page, limit) }); } catch (err) { next(err); }
  }
  async getGenerations(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getGenerations(page, limit) }); } catch (err) { next(err); }
  }
  async getExports(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getExports(page, limit) }); } catch (err) { next(err); }
  }
  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try { const { page, limit } = parsePagination(req.query); res.json({ success: true, data: await adminService.getAuditLogs(page, limit) }); } catch (err) { next(err); }
  }
}

export const adminController = new AdminController();
