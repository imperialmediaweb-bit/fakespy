import { prisma } from '../../lib/prisma';
import { getCurrentMonthKey } from '../../utils/monthKey';

type UsageField = 'analysesUsed' | 'generationsUsed' | 'exportsUsed';

export class UsageService {
  async incrementUsage(userId: string, field: UsageField, amount = 1): Promise<void> {
    const monthKey = getCurrentMonthKey();

    await prisma.usage.upsert({
      where: { userId_monthKey: { userId, monthKey } },
      create: {
        userId,
        monthKey,
        [field]: amount,
      },
      update: {
        [field]: { increment: amount },
      },
    });
  }

  async getUsage(userId: string) {
    const monthKey = getCurrentMonthKey();

    return prisma.usage.upsert({
      where: { userId_monthKey: { userId, monthKey } },
      create: { userId, monthKey },
      update: {},
    });
  }
}

export const usageService = new UsageService();
