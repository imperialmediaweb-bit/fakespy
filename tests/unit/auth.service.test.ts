import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Use vi.hoisted so the mock object is available when vi.mock factory runs
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
  },
  usage: {
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('../../src/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService();
  });

  describe('register', () => {
    it('should throw ConflictError if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(service.register('Test', 'test@test.com', 'Password1'))
        .rejects.toThrow('An account with this email already exists');
    });

    it('should create user with hashed password and FREE subscription', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'USER',
        createdAt: new Date(),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.usage.create.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.register('Test', 'test@test.com', 'Password1');

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            subscription: { create: { plan: 'FREE', status: 'ACTIVE' } },
          }),
        }),
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login('test@test.com', 'Password1'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError if password is wrong', async () => {
      const hash = await bcrypt.hash('CorrectPassword1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'USER',
        name: 'Test',
        createdAt: new Date(),
      });

      await expect(service.login('test@test.com', 'WrongPassword1'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should return tokens on successful login', async () => {
      const hash = await bcrypt.hash('Password1', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        passwordHash: hash,
        role: 'USER',
        name: 'Test',
        createdAt: new Date(),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.login('test@test.com', 'Password1');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
      expect((result.user as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe('forgotPassword', () => {
    it('should not throw for non-existent email (prevents enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.forgotPassword('nobody@test.com')).resolves.not.toThrow();
    });

    it('should set reset token for existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.forgotPassword('test@test.com');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resetToken: expect.any(String),
            resetTokenExpiry: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw for invalid token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      await expect(service.resetPassword('bad-token', 'NewPassword1'))
        .rejects.toThrow('Invalid or expired reset token');
    });

    it('should update password and clear reset token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      await service.resetPassword('valid-token', 'NewPassword1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resetToken: null,
            resetTokenExpiry: null,
            refreshToken: null,
          }),
        }),
      );
    });
  });

  describe('refreshTokens', () => {
    it('should throw for invalid refresh token', async () => {
      await expect(service.refreshTokens('invalid-token'))
        .rejects.toThrow('Invalid or expired refresh token');
    });

    it('should return new tokens for valid refresh token', async () => {
      const token = jwt.sign(
        { userId: 'user-1', role: 'USER' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' } as jwt.SignOptions,
      );

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: 'USER',
        refreshToken: token,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.refreshTokens(token);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
