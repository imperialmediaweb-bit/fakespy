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

import { authenticate, requireAdmin } from '../../src/middleware/auth.middleware';

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
    it('should reject non-admin users', () => {
      const req = { userRole: 'USER' } as Request;

      requireAdmin(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 }),
      );
    });

    it('should allow admin users', () => {
      const req = { userRole: 'ADMIN' } as Request;

      requireAdmin(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
