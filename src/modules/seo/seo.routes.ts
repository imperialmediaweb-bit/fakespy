import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { config } from '../../config';

const router = Router();

const PUBLIC_PATHS: { path: string; priority: string; changefreq: string }[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/features', priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/faq', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
}

/**
 * Dynamic sitemap: static marketing pages plus every published blog post.
 * Cached by the browser/CDN for an hour; blog publishes show up on next crawl.
 */
router.get('/sitemap.xml', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const base = config.frontendUrl.replace(/\/$/, '');
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 5000, // sitemap protocol caps a single file at 50k URLs; keep well under
    });

    const staticEntries = PUBLIC_PATHS.map(
      (p) => `  <url><loc>${escapeXml(base + p.path)}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    );
    const postEntries = posts.map(
      (p) => `  <url><loc>${escapeXml(`${base}/blog/${p.slug}`)}</loc><lastmod>${(p.updatedAt || p.publishedAt || new Date()).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...postEntries].join('\n')}\n</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;
