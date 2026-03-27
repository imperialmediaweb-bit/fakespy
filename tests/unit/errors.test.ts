import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  PlanLimitError,
  RateLimitError,
  ErrorCode,
} from '../../src/lib/errors';

describe('Error Classes', () => {
  it('ValidationError should have correct status and code', () => {
    const err = new ValidationError('Bad input', { field: ['required'] });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(err.details).toEqual({ field: ['required'] });
    expect(err.message).toBe('Bad input');
  });

  it('UnauthorizedError should have correct status', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('ForbiddenError should have correct status', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('NotFoundError should include resource name', () => {
    const err = new NotFoundError('Project');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Project not found');
  });

  it('PlanLimitError should have correct status and message', () => {
    const err = new PlanLimitError('analyses');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe(ErrorCode.PLAN_LIMIT_EXCEEDED);
    expect(err.message).toContain('analyses');
    expect(err.message).toContain('upgrade');
  });

  it('RateLimitError should have status 429', () => {
    const err = new RateLimitError();
    expect(err.statusCode).toBe(429);
  });

  it('AppError should be instanceof Error', () => {
    const err = new AppError(500, ErrorCode.INTERNAL_ERROR, 'test');
    expect(err instanceof Error).toBe(true);
    expect(err instanceof AppError).toBe(true);
  });
});
