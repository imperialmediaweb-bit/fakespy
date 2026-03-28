import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

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

// One-time seed endpoint for demo accounts
router.all('/seed', async (req: Request, res: Response) => {
  const secret = req.headers['x-seed-secret'] || req.query.secret;
  if (secret !== process.env.JWT_ACCESS_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const hash = async (pw: string) => bcrypt.hash(pw, 12);

    const accounts = [
      { email: 'admin@adxura.com', name: 'Admin', password: 'Admin123!', role: 'ADMIN' as const, plan: 'AGENCY' as const, usage: { analysesUsed: 12, generationsUsed: 45, exportsUsed: 8 } },
      { email: 'demo@adxura.com', name: 'Demo User', password: 'Demo123!', role: 'USER' as const, plan: 'FREE' as const, usage: { analysesUsed: 1, generationsUsed: 3, exportsUsed: 0 } },
      { email: 'pro@adxura.com', name: 'Sarah Mitchell', password: 'Pro12345!', role: 'USER' as const, plan: 'PRO' as const, usage: { analysesUsed: 8, generationsUsed: 32, exportsUsed: 5 } },
      { email: 'agency@adxura.com', name: 'Alex Rivera', password: 'Agency123!', role: 'USER' as const, plan: 'AGENCY' as const, usage: { analysesUsed: 47, generationsUsed: 189, exportsUsed: 22 } },
    ];

    const created = [];
    for (const acc of accounts) {
      const user = await prisma.user.upsert({
        where: { email: acc.email },
        update: {},
        create: {
          name: acc.name,
          email: acc.email,
          passwordHash: await hash(acc.password),
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

    res.json({ success: true, message: 'Seed complete', accounts: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
