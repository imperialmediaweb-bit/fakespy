import { prisma } from '../../lib/prisma';
import { getCurrentMonthKey } from '../../utils/monthKey';
import { logger } from '../../lib/logger';

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

  /**
   * Releases a usage reservation (e.g., when an operation fails after the
   * middleware already incremented the counter).
   */
  async decrementUsage(userId: string, field: UsageField, amount = 1): Promise<void> {
    const monthKey = getCurrentMonthKey();

    try {
      const usage = await prisma.usage.findUnique({
        where: { userId_monthKey: { userId, monthKey } },
      });

      if (usage && usage[field] > 0) {
        await prisma.usage.update({
          where: { userId_monthKey: { userId, monthKey } },
          data: { [field]: { decrement: Math.min(amount, usage[field]) } },
        });
      }
    } catch (err) {
      logger.error({ userId, field, err }, 'Failed to decrement usage');
    }
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
