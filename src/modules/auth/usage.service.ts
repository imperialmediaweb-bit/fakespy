import { prisma } from '../../lib/prisma';
import { getCurrentMonthKey } from '../../utils/monthKey';
import { logger } from '../../lib/logger';
import { PlanLimitError } from '../../lib/errors';
import { getPlanLimits, PlanType } from '../../config/plans';

type UsageField = 'analysesUsed' | 'generationsUsed' | 'exportsUsed';
type UsageResource = 'analyses' | 'generations' | 'exports';

const RESOURCE_FIELD: Record<UsageResource, UsageField> = {
  analyses: 'analysesUsed',
  generations: 'generationsUsed',
  exports: 'exportsUsed',
};
const RESOURCE_LIMIT: Record<UsageResource, 'analysesPerMonth' | 'generationsPerMonth' | 'exportsPerMonth'> = {
  analyses: 'analysesPerMonth',
  generations: 'generationsPerMonth',
  exports: 'exportsPerMonth',
};

export class UsageService {
  /**
   * Atomically reserves one unit of quota for a resource, mirroring
   * `enforceLimit` middleware, for services that perform several AI calls
   * inside a single request. Throws PlanLimitError when the plan is exhausted.
   */
  async reserveQuota(userId: string, resource: UsageResource): Promise<void> {
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    const plan = (subscription?.plan || 'FREE') as PlanType;
    const limitValue = getPlanLimits(plan)[RESOURCE_LIMIT[resource]];
    if (limitValue === -1) return;

    const monthKey = getCurrentMonthKey();
    const field = RESOURCE_FIELD[resource];
    const usage = await prisma.usage.upsert({
      where: { userId_monthKey: { userId, monthKey } },
      create: { userId, monthKey, [field]: 1 },
      update: { [field]: { increment: 1 } },
    });

    if (usage[field] > limitValue) {
      await prisma.usage.update({
        where: { userId_monthKey: { userId, monthKey } },
        data: { [field]: { decrement: 1 } },
      });
      throw new PlanLimitError(resource);
    }
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
