export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  AGENCY = 'AGENCY',
}

export interface PlanLimits {
  analysesPerMonth: number;
  generationsPerMonth: number;
  exportsPerMonth: number;
  maxProjects: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.FREE]: {
    analysesPerMonth: 3,
    generationsPerMonth: 10,
    exportsPerMonth: 5,
    maxProjects: 3,
  },
  [PlanType.PRO]: {
    analysesPerMonth: 30,
    generationsPerMonth: 100,
    exportsPerMonth: 50,
    maxProjects: 25,
  },
  [PlanType.AGENCY]: {
    analysesPerMonth: 200,
    generationsPerMonth: 1000,
    exportsPerMonth: 500,
    maxProjects: -1, // unlimited
  },
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS[PlanType.FREE];
}
