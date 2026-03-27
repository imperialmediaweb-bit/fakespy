import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { PlanLimitError, UnauthorizedError } from '../lib/errors';
import { getPlanLimits, PlanType } from '../config/plans';
import { getCurrentMonthKey } from '../utils/monthKey';
import { Plan } from '@prisma/client';

type UsageField = 'analysesUsed' | 'generationsUsed' | 'exportsUsed';

function mapResourceToField(resource: string): UsageField {
  switch (resource) {
    case 'analyses': return 'analysesUsed';
    case 'generations': return 'generationsUsed';
    case 'exports': return 'exportsUsed';
    default: throw new Error(`Unknown resource type: ${resource}`);
  }
}

function mapResourceToLimit(resource: string): keyof ReturnType<typeof getPlanLimits> {
  switch (resource) {
    case 'analyses': return 'analysesPerMonth';
    case 'generations': return 'generationsPerMonth';
    case 'exports': return 'exportsPerMonth';
    default: throw new Error(`Unknown resource type: ${resource}`);
  }
}

export function enforceLimit(resource: 'analyses' | 'generations' | 'exports') {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      const plan = (subscription?.plan || 'FREE') as PlanType;
      const limits = getPlanLimits(plan);
      const limitValue = limits[mapResourceToLimit(resource)];

      // -1 means unlimited
      if (limitValue === -1) {
        req.userPlan = plan as unknown as Plan;
        return next();
      }

      const monthKey = getCurrentMonthKey();
      const usage = await prisma.usage.upsert({
        where: { userId_monthKey: { userId, monthKey } },
        create: { userId, monthKey },
        update: {},
      });

      const usedField = mapResourceToField(resource);
      const currentUsage = usage[usedField];

      if (currentUsage >= limitValue) {
        throw new PlanLimitError(resource);
      }

      req.userPlan = plan as unknown as Plan;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function enforceProjectLimit() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      const plan = (subscription?.plan || 'FREE') as PlanType;
      const limits = getPlanLimits(plan);

      if (limits.maxProjects === -1) {
        return next();
      }

      const projectCount = await prisma.project.count({ where: { userId } });

      if (projectCount >= limits.maxProjects) {
        throw new PlanLimitError('projects');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
