import { Router, Request, Response, NextFunction } from 'express';
import { blogService } from './blog.service';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';
import { paginationSchema } from '../../validators/project.validators';

const router = Router();

const httpUrl = z.string().max(500).url().refine((u) => /^https?:\/\//i.test(u), 'Must be an http(s) URL');

const adminListSchema = paginationSchema.extend({
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
});

const postSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(200_000),
  excerpt: z.string().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  featuredImage: httpUrl.optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().max(300).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  scheduledAt: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

// ── Public routes ──
router.get('/public', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError('Invalid pagination', parsed.error.flatten().fieldErrors);
    const result = await blogService.getPublishedPosts(parsed.data.page, parsed.data.limit);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/public/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await blogService.getPublishedBySlug(req.params.slug);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

// ── Admin routes ──
router.get('/categories', authenticate, requireAdmin, async (_req, res, next) => {
  try { res.json({ success: true, data: await blogService.getCategories() }); } catch (err) { next(err); }
});
router.post('/categories', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') throw new ValidationError('Name is required');
    res.status(201).json({ success: true, data: await blogService.createCategory(name) });
  } catch (err) { next(err); }
});
router.patch('/categories/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) throw new ValidationError('Name is required');
    res.json({ success: true, data: await blogService.updateCategory(req.params.id, name) });
  } catch (err) { next(err); }
});
router.delete('/categories/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { await blogService.deleteCategory(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

router.get('/tags', authenticate, requireAdmin, async (_req, res, next) => {
  try { res.json({ success: true, data: await blogService.getTags() }); } catch (err) { next(err); }
});
router.post('/tags', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) throw new ValidationError('Name is required');
    res.status(201).json({ success: true, data: await blogService.createTag(name) });
  } catch (err) { next(err); }
});
router.delete('/tags/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { await blogService.deleteTag(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

router.get('/posts', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const parsed = adminListSchema.safeParse(req.query);
    if (!parsed.success) throw new ValidationError('Invalid query', parsed.error.flatten().fieldErrors);
    const { page, limit, status, categoryId, search } = parsed.data;
    const result = await blogService.getPosts(page, limit, { status, categoryId, search });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.get('/posts/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { res.json({ success: true, data: await blogService.getPost(req.params.id) }); } catch (err) { next(err); }
});

router.post('/posts', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = postSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const post = await blogService.createPost({ ...parsed.data, authorId: req.userId! });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
});

router.patch('/posts/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const parsed = postSchema.partial().safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const post = await blogService.updatePost(req.params.id, parsed.data);
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

router.delete('/posts/:id', authenticate, requireAdmin, async (req, res, next) => {
  try { await blogService.deletePost(req.params.id); res.json({ success: true }); } catch (err) { next(err); }
});

export default router;
