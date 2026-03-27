import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted for mock objects referenced in vi.mock factories
const mockStripeInstance = vi.hoisted(() => ({
  customers: {
    create: vi.fn().mockResolvedValue({ id: 'cus_test' }),
  },
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test', id: 'cs_test' }),
    },
  },
  billingPortal: {
    sessions: {
      create: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/test' }),
    },
  },
  subscriptions: {
    retrieve: vi.fn().mockResolvedValue({
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
    }),
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => mockStripeInstance),
}));

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
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

import { BillingService } from '../../src/modules/billing/billing.service';

describe('BillingService', () => {
  let service: BillingService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BillingService();
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for valid user and plan', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        subscription: { stripeCustomerId: 'cus_existing' },
      });
      mockPrisma.subscription.upsert.mockResolvedValue({});
      mockPrisma.auditLog.create.mockResolvedValue({});

      const result = await service.createCheckoutSession('user-1', 'PRO');

      expect(result.url).toBeDefined();
      expect(result.sessionId).toBeDefined();
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createCheckoutSession('bad-user', 'PRO'))
        .rejects.toThrow('User not found');
    });
  });

  describe('getSubscription', () => {
    it('should return FREE plan when no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await service.getSubscription('user-1');

      expect(result.plan).toBe('FREE');
      expect(result.status).toBe('ACTIVE');
    });

    it('should return subscription details when exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        plan: 'PRO',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(),
        cancelAtPeriodEnd: false,
      });

      const result = await service.getSubscription('user-1');
      expect(result.plan).toBe('PRO');
    });
  });

  describe('createPortalSession', () => {
    it('should throw when no stripe customer exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({ stripeCustomerId: null });

      await expect(service.createPortalSession('user-1'))
        .rejects.toThrow('No billing account found');
    });
  });
});
