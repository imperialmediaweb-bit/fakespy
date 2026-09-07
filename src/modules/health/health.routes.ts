import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'not ready',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * One-time seed endpoint for demo accounts.
 * Guarded by a dedicated SEED_SECRET (never the JWT signing secret — a URL
 * query param ends up in access logs, and leaking the JWT secret would allow
 * forging tokens for any account). If SEED_SECRET is unset, the endpoint is
 * disabled entirely.
 */
router.all('/seed', async (req: Request, res: Response) => {
  const configured = process.env.SEED_SECRET;
  const provided = (req.headers['x-seed-secret'] as string | undefined) || (req.query.secret as string | undefined);

  if (!configured) {
    return res.status(404).json({ error: 'Seed endpoint disabled. Set SEED_SECRET to enable.' });
  }
  const a = Buffer.from(String(provided || ''));
  const b = Buffer.from(configured);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const hash = async (pw: string) => bcrypt.hash(pw, 12);

    // The admin password is never a published constant: it comes from
    // SEED_ADMIN_PASSWORD or is generated and returned exactly once. Re-running
    // the seed rotates the admin password; demo (USER-role) accounts keep theirs.
    const generatedAdminPassword = process.env.SEED_ADMIN_PASSWORD ? undefined : crypto.randomBytes(12).toString('base64url');
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || generatedAdminPassword!;

    const accounts = [
      { email: 'admin@adxura.com', name: 'Admin', password: adminPassword, role: 'ADMIN' as const, plan: 'AGENCY' as const, usage: { analysesUsed: 12, generationsUsed: 45, exportsUsed: 8 } },
      { email: 'demo@adxura.com', name: 'Demo User', password: 'Demo123!', role: 'USER' as const, plan: 'FREE' as const, usage: { analysesUsed: 1, generationsUsed: 3, exportsUsed: 0 } },
      { email: 'pro@adxura.com', name: 'Sarah Mitchell', password: 'Pro12345!', role: 'USER' as const, plan: 'PRO' as const, usage: { analysesUsed: 8, generationsUsed: 32, exportsUsed: 5 } },
      { email: 'agency@adxura.com', name: 'Alex Rivera', password: 'Agency123!', role: 'USER' as const, plan: 'AGENCY' as const, usage: { analysesUsed: 47, generationsUsed: 189, exportsUsed: 22 } },
    ];

    const created = [];
    for (const acc of accounts) {
      const passwordHash = await hash(acc.password);
      const user = await prisma.user.upsert({
        where: { email: acc.email },
        update: acc.role === 'ADMIN' ? { passwordHash, role: 'ADMIN' } : {},
        create: {
          name: acc.name,
          email: acc.email,
          passwordHash,
          role: acc.role,
          emailVerified: true,
          subscription: { create: { plan: acc.plan, status: 'ACTIVE' } },
        },
      });
      await prisma.usage.upsert({
        where: { userId_monthKey: { userId: user.id, monthKey } },
        update: {},
        create: { userId: user.id, monthKey, ...acc.usage },
      });
      created.push({ email: acc.email, plan: acc.plan, role: acc.role });
    }

    // Sample projects for agency user
    const agencyUser = await prisma.user.findUnique({ where: { email: 'agency@adxura.com' } });
    if (agencyUser) {
      const projects = [
        { title: 'FitnessPro Launch', brandName: 'FitnessPro', niche: 'Fitness & Wellness', competitors: ['MyFitnessPal', 'Nike Training Club'] },
        { title: 'TechFlow Q2 Ads', brandName: 'TechFlow', niche: 'SaaS / Project Management', competitors: ['Jira', 'Linear', 'Asana'] },
        { title: 'PetPals Rebrand', brandName: 'PetPals', niche: 'Pet Care E-commerce', competitors: ['BarkBox', 'Chewy'] },
      ];
      for (const p of projects) {
        const exists = await prisma.project.findFirst({ where: { userId: agencyUser.id, title: p.title } });
        if (!exists) {
          await prisma.project.create({ data: { ...p, userId: agencyUser.id } });
        }
      }
    }

    // Sample project for pro user
    const proUser = await prisma.user.findUnique({ where: { email: 'pro@adxura.com' } });
    if (proUser) {
      const exists = await prisma.project.findFirst({ where: { userId: proUser.id, title: 'Summer Campaign 2026' } });
      if (!exists) {
        await prisma.project.create({
          data: {
            userId: proUser.id,
            title: 'Summer Campaign 2026',
            brandName: 'GlowSkin Beauty',
            niche: 'Skincare & Beauty',
            location: 'United States',
            targetAudience: 'Women aged 25-40 interested in natural skincare',
            productDescription: 'Premium organic skincare line featuring vitamin C serums and hyaluronic acid moisturizers.',
            competitors: ['The Ordinary', 'CeraVe', 'Drunk Elephant'],
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Seed complete',
      accounts: created,
      ...(generatedAdminPassword && {
        adminPassword: generatedAdminPassword,
        note: 'Store this admin password now — it is shown only once. Set SEED_ADMIN_PASSWORD to choose it yourself.',
      }),
    });
  } catch (err) {
    logger.error({ err }, 'Seed failed');
    res.status(500).json({ error: 'Seed failed' });
  }
});

export default router;
