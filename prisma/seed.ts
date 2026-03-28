import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const hash = async (pw: string) => bcrypt.hash(pw, 12);

  // ── Admin ──
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adxura.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@adxura.com',
      passwordHash: await hash('Admin123!'),
      role: 'ADMIN',
      emailVerified: true,
      subscription: { create: { plan: 'AGENCY', status: 'ACTIVE' } },
    },
  });
  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: admin.id, monthKey } },
    update: {},
    create: { userId: admin.id, monthKey, analysesUsed: 12, generationsUsed: 45, exportsUsed: 8 },
  });

  // ── Demo Free User ──
  const demoFree = await prisma.user.upsert({
    where: { email: 'demo@adxura.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@adxura.com',
      passwordHash: await hash('Demo123!'),
      role: 'USER',
      emailVerified: true,
      subscription: { create: { plan: 'FREE', status: 'ACTIVE' } },
    },
  });
  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: demoFree.id, monthKey } },
    update: {},
    create: { userId: demoFree.id, monthKey, analysesUsed: 1, generationsUsed: 3, exportsUsed: 0 },
  });

  // ── Demo Pro User ──
  const demoPro = await prisma.user.upsert({
    where: { email: 'pro@adxura.com' },
    update: {},
    create: {
      name: 'Sarah Mitchell',
      email: 'pro@adxura.com',
      passwordHash: await hash('Pro12345!'),
      role: 'USER',
      emailVerified: true,
      subscription: { create: { plan: 'PRO', status: 'ACTIVE' } },
    },
  });
  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: demoPro.id, monthKey } },
    update: {},
    create: { userId: demoPro.id, monthKey, analysesUsed: 8, generationsUsed: 32, exportsUsed: 5 },
  });

  // Create a sample project for the Pro user
  const proProject = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: demoPro.id,
      title: 'Summer Campaign 2026',
      brandName: 'GlowSkin Beauty',
      niche: 'Skincare & Beauty',
      location: 'United States',
      targetAudience: 'Women aged 25-40 interested in natural skincare',
      productDescription: 'Premium organic skincare line featuring vitamin C serums and hyaluronic acid moisturizers.',
      competitors: ['The Ordinary', 'CeraVe', 'Drunk Elephant'],
    },
  });

  // ── Demo Agency User ──
  const demoAgency = await prisma.user.upsert({
    where: { email: 'agency@adxura.com' },
    update: {},
    create: {
      name: 'Alex Rivera',
      email: 'agency@adxura.com',
      passwordHash: await hash('Agency123!'),
      role: 'USER',
      emailVerified: true,
      subscription: { create: { plan: 'AGENCY', status: 'ACTIVE' } },
    },
  });
  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: demoAgency.id, monthKey } },
    update: {},
    create: { userId: demoAgency.id, monthKey, analysesUsed: 47, generationsUsed: 189, exportsUsed: 22 },
  });

  // Create sample projects for the Agency user (multiple clients)
  const agencyProjects = [
    { id: '00000000-0000-0000-0000-000000000010', title: 'FitnessPro Launch', brandName: 'FitnessPro', niche: 'Fitness & Wellness', location: 'US & Canada', targetAudience: 'Active adults 20-45', productDescription: 'Fitness app with personalized workout plans.', competitors: ['MyFitnessPal', 'Nike Training Club', 'Peloton'] },
    { id: '00000000-0000-0000-0000-000000000011', title: 'TechFlow Q2 Ads', brandName: 'TechFlow', niche: 'SaaS / Project Management', location: 'Global', targetAudience: 'Engineering teams at mid-size companies', productDescription: 'Project management tool built for software teams.', competitors: ['Jira', 'Linear', 'Asana'] },
    { id: '00000000-0000-0000-0000-000000000012', title: 'PetPals Rebrand', brandName: 'PetPals', niche: 'Pet Care E-commerce', location: 'United Kingdom', targetAudience: 'Pet owners aged 25-55', productDescription: 'Premium pet food and accessories subscription box.', competitors: ['BarkBox', 'Chewy', 'Tails.com'] },
  ];

  for (const p of agencyProjects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, userId: demoAgency.id },
    });
  }

  console.log('Seed complete:');
  console.log('  Admin:       admin@adxura.com / Admin123!');
  console.log('  Free User:   demo@adxura.com / Demo123!');
  console.log('  Pro User:    pro@adxura.com / Pro12345!');
  console.log('  Agency User: agency@adxura.com / Agency123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
