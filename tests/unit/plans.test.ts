import { describe, it, expect } from 'vitest';
import { PlanType, getPlanLimits, PLAN_LIMITS } from '../../src/config/plans';

describe('Plan Limits', () => {
  it('should return correct limits for FREE plan', () => {
    const limits = getPlanLimits(PlanType.FREE);
    expect(limits.analysesPerMonth).toBe(3);
    expect(limits.generationsPerMonth).toBe(10);
    expect(limits.exportsPerMonth).toBe(5);
    expect(limits.maxProjects).toBe(3);
  });

  it('should return correct limits for PRO plan', () => {
    const limits = getPlanLimits(PlanType.PRO);
    expect(limits.analysesPerMonth).toBe(30);
    expect(limits.generationsPerMonth).toBe(100);
    expect(limits.exportsPerMonth).toBe(50);
    expect(limits.maxProjects).toBe(25);
  });

  it('should return correct limits for AGENCY plan', () => {
    const limits = getPlanLimits(PlanType.AGENCY);
    expect(limits.analysesPerMonth).toBe(200);
    expect(limits.generationsPerMonth).toBe(1000);
    expect(limits.exportsPerMonth).toBe(500);
    expect(limits.maxProjects).toBe(-1); // unlimited
  });

  it('should have all plans defined', () => {
    expect(Object.keys(PLAN_LIMITS)).toHaveLength(3);
    expect(PLAN_LIMITS).toHaveProperty(PlanType.FREE);
    expect(PLAN_LIMITS).toHaveProperty(PlanType.PRO);
    expect(PLAN_LIMITS).toHaveProperty(PlanType.AGENCY);
  });
});
