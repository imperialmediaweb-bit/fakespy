import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandler } from '../../src/middleware/errorHandler.middleware';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  usage: {
    create: vi.fn(),
    upsert: vi.fn(),
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
    fatal: vi.fn(),
  },
}));

import authRoutes from '../../src/modules/auth/auth.routes';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use(errorHandler);
  return app;
}

describe('Auth Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
  });

  describe('POST /auth/register', () => {
    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ name: '', email: 'bad', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 for duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'StrongPass1' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should return 201 on successful registration', async () => {
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

      const res = await request(app)
        .post('/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'StrongPass1' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@test.com');
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should return 400 for missing fields', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(400);
    });

    it('should return 401 for wrong credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'Wrong1234' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should always return success (prevents email enumeration)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should return 400 for weak password', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'some-token', password: 'weak' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
