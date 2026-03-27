import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fakespy.ai' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@fakespy.ai',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
      subscription: {
        create: {
          plan: 'AGENCY',
          status: 'ACTIVE',
        },
      },
    },
  });

  // Create initial usage record for admin
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: admin.id, monthKey } },
    update: {},
    create: { userId: admin.id, monthKey },
  });

  // Create demo user
  const demoPasswordHash = await bcrypt.hash('Demo123!', 12);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@fakespy.ai' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@fakespy.ai',
      passwordHash: demoPasswordHash,
      role: 'USER',
      emailVerified: true,
      subscription: {
        create: {
          plan: 'FREE',
          status: 'ACTIVE',
        },
      },
    },
  });

  await prisma.usage.upsert({
    where: { userId_monthKey: { userId: demo.id, monthKey } },
    update: {},
    create: { userId: demo.id, monthKey },
  });

  console.log('Seed complete:', {
    admin: { id: admin.id, email: admin.email },
    demo: { id: demo.id, email: demo.email },
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
