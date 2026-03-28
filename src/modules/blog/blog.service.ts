import { prisma } from '../../lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '../../lib/errors';
import type { BlogPostStatus } from '@prisma/client';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export class BlogService {
  // ── Categories ──
  async getCategories() {
    return prisma.blogCategory.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } });
  }

  async createCategory(name: string) {
    const slug = slugify(name);
    const exists = await prisma.blogCategory.findUnique({ where: { slug } });
    if (exists) throw new ConflictError('Category slug already exists');
    return prisma.blogCategory.create({ data: { name, slug } });
  }

  async updateCategory(id: string, name: string) {
    const slug = slugify(name);
    const existing = await prisma.blogCategory.findFirst({ where: { slug, id: { not: id } } });
    if (existing) throw new ConflictError('Category slug already exists');
    return prisma.blogCategory.update({ where: { id }, data: { name, slug } });
  }

  async deleteCategory(id: string) {
    await prisma.blogCategory.delete({ where: { id } });
  }

  // ── Tags ──
  async getTags() {
    return prisma.blogTag.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } });
  }

  async createTag(name: string) {
    const slug = slugify(name);
    const exists = await prisma.blogTag.findUnique({ where: { slug } });
    if (exists) throw new ConflictError('Tag slug already exists');
    return prisma.blogTag.create({ data: { name, slug } });
  }

  async deleteTag(id: string) {
    await prisma.blogTag.delete({ where: { id } });
  }

  // ── Posts ──
  async getPosts(page: number, limit: number, filters?: { status?: BlogPostStatus; categoryId?: string; search?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) where.OR = [{ title: { contains: filters.search, mode: 'insensitive' } }, { content: { contains: filters.search, mode: 'insensitive' } }];

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { category: { select: { id: true, name: true } }, tags: { include: { tag: true } } } }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts: posts.map(p => ({ ...p, tags: p.tags.map(t => t.tag) })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPost(id: string) {
    const post = await prisma.blogPost.findUnique({ where: { id }, include: { category: true, tags: { include: { tag: true } } } });
    if (!post) throw new NotFoundError('Blog post');
    return { ...post, tags: post.tags.map(t => t.tag) };
  }

  async getPublishedBySlug(slug: string) {
    const post = await prisma.blogPost.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { category: true, tags: { include: { tag: true } } } });
    if (!post) throw new NotFoundError('Blog post');
    return { ...post, tags: post.tags.map(t => t.tag) };
  }

  async getPublishedPosts(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { status: 'PUBLISHED' as const };
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({ where, skip, take: limit, orderBy: { publishedAt: 'desc' }, include: { category: { select: { id: true, name: true } }, tags: { include: { tag: true } } } }),
      prisma.blogPost.count({ where }),
    ]);
    return { posts: posts.map(p => ({ ...p, tags: p.tags.map(t => t.tag) })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createPost(data: { title: string; content: string; excerpt?: string; categoryId?: string; authorId: string; featuredImage?: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string; status?: BlogPostStatus; scheduledAt?: string; tagIds?: string[] }) {
    let slug = slugify(data.title);
    const existingSlug = await prisma.blogPost.findUnique({ where: { slug } });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const publishedAt = data.status === 'PUBLISHED' ? new Date() : undefined;

    const post = await prisma.blogPost.create({
      data: {
        title: data.title, slug, content: data.content, excerpt: data.excerpt, categoryId: data.categoryId || null,
        authorId: data.authorId, featuredImage: data.featuredImage, seoTitle: data.seoTitle,
        seoDescription: data.seoDescription, seoKeywords: data.seoKeywords, status: data.status || 'DRAFT',
        publishedAt, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        ...(data.tagIds?.length ? { tags: { create: data.tagIds.map(tagId => ({ tagId })) } } : {}),
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    return { ...post, tags: post.tags.map(t => t.tag) };
  }

  async updatePost(id: string, data: { title?: string; content?: string; excerpt?: string; categoryId?: string; featuredImage?: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string; status?: BlogPostStatus; scheduledAt?: string; tagIds?: string[] }) {
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Blog post');

    const updateData: any = {};
    if (data.title) { updateData.title = data.title; updateData.slug = slugify(data.title); const dup = await prisma.blogPost.findFirst({ where: { slug: updateData.slug, id: { not: id } } }); if (dup) updateData.slug = `${updateData.slug}-${Date.now()}`; }
    if (data.content !== undefined) updateData.content = data.content;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription;
    if (data.seoKeywords !== undefined) updateData.seoKeywords = data.seoKeywords;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED' && !existing.publishedAt) updateData.publishedAt = new Date();
    }

    if (data.tagIds !== undefined) {
      await prisma.blogPostTag.deleteMany({ where: { postId: id } });
      if (data.tagIds.length) await prisma.blogPostTag.createMany({ data: data.tagIds.map(tagId => ({ postId: id, tagId })) });
    }

    const post = await prisma.blogPost.update({ where: { id }, data: updateData, include: { category: true, tags: { include: { tag: true } } } });
    return { ...post, tags: post.tags.map(t => t.tag) };
  }

  async deletePost(id: string) {
    await prisma.blogPost.delete({ where: { id } });
  }
}

export const blogService = new BlogService();
