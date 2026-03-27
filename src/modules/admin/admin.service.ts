import { prisma } from '../../lib/prisma';

export class AdminService {
  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          subscription: {
            select: { plan: true, status: true },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSubscriptions(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.subscription.count(),
    ]);

    return {
      subscriptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUsageStats() {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    const [totalUsers, activeSubscriptions, monthlyUsage] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
      prisma.usage.aggregate({
        where: { monthKey },
        _sum: {
          analysesUsed: true,
          generationsUsed: true,
          exportsUsed: true,
        },
      }),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      currentMonth: monthKey,
      monthlyUsage: {
        totalAnalyses: monthlyUsage._sum.analysesUsed || 0,
        totalGenerations: monthlyUsage._sum.generationsUsed || 0,
        totalExports: monthlyUsage._sum.exportsUsed || 0,
      },
    };
  }
}

export const adminService = new AdminService();
