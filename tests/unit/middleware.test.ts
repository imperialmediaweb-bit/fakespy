import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Need to mock config before importing middleware
vi.mock('../../src/config', () => ({
  config: {
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
  },
}));

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
}));
vi.mock('../../src/lib/prisma', () => ({ prisma: mockPrisma }));

import { authenticate, requireAdmin } from '../../src/middleware/auth.middleware';

/** requireAdmin resolves asynchronously; wait for next() to be invoked. */
const nextCalled = (fn: ReturnType<typeof vi.fn>) =>
  vi.waitFor(() => { expect(fn).toHaveBeenCalled(); });

describe('Auth Middleware', () => {
  const mockRes = {} as Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = vi.fn();
  });

  describe('authenticate', () => {
    it('should reject request without Authorization header', () => {
      const req = { headers: {} } as Request;

      authenticate(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });

    it('should reject request with invalid token', () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' },
      } as Request;

      authenticate(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });

    it('should set userId and role for valid token', () => {
      const token = jwt.sign(
        { userId: 'user-1', role: 'USER' },
        process.env.JWT_ACCESS_SECRET!,
      );

      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as Request;

      authenticate(req, mockRes, mockNext);

      expect(req.userId).toBe('user-1');
      expect(req.userRole).toBe('USER');
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should reject non-admin users without hitting the database', async () => {
      const req = { userId: 'user-1', userRole: 'USER' } as Request;

      requireAdmin(req, mockRes, mockNext);
      await nextCalled(mockNext as ReturnType<typeof vi.fn>);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('should allow admin users whose DB role is still ADMIN', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'ADMIN' });
      const req = { userId: 'admin-1', userRole: 'ADMIN' } as Request;

      requireAdmin(req, mockRes, mockNext);
      await nextCalled(mockNext as ReturnType<typeof vi.fn>);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject a token with ADMIN claim when the user was demoted', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'USER' });
      const req = { userId: 'admin-1', userRole: 'ADMIN' } as Request;

      requireAdmin(req, mockRes, mockNext);
      await nextCalled(mockNext as ReturnType<typeof vi.fn>);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });
  });
});
