import { prisma } from '../../lib/prisma';

export class AdminService {
  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true, subscription: { select: { plan: true, status: true } } },
      }),
      prisma.user.count(),
    ]);
    return { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getSubscriptions(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
      prisma.subscription.count(),
    ]);
    return { subscriptions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUsageStats() {
    const now = new Date();
    const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const [totalUsers, activeSubscriptions, totalProjects, totalAnalyses, totalGenerations, monthlyUsage] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE', plan: { not: 'FREE' } } }),
      prisma.project.count(),
      prisma.analysis.count(),
      prisma.adGeneration.count(),
      prisma.usage.aggregate({ where: { monthKey }, _sum: { analysesUsed: true, generationsUsed: true, exportsUsed: true } }),
    ]);
    return {
      totalUsers, activeSubscriptions, totalProjects, totalAnalyses, totalGenerations, currentMonth: monthKey,
      monthlyUsage: { totalAnalyses: monthlyUsage._sum.analysesUsed || 0, totalGenerations: monthlyUsage._sum.generationsUsed || 0, totalExports: monthlyUsage._sum.exportsUsed || 0 },
    };
  }

  async getProjects(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      prisma.project.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } }, _count: { select: { analyses: true, adGenerations: true } } } }),
      prisma.project.count(),
    ]);
    return { projects, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getAnalyses(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } }, project: { select: { id: true, title: true } } } }),
      prisma.analysis.count(),
    ]);
    return { analyses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getGenerations(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [generations, total] = await Promise.all([
      prisma.adGeneration.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } }, project: { select: { id: true, title: true } } } }),
      prisma.adGeneration.count(),
    ]);
    return { generations, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getExports(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [exports, total] = await Promise.all([
      prisma.export.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true } }, project: { select: { id: true, title: true } } } }),
      prisma.export.count(),
    ]);
    return { exports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, email: true } } } }),
      prisma.auditLog.count(),
    ]);
    return { logs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

export const adminService = new AdminService();
