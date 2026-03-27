import Stripe from 'stripe';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { NotFoundError, AppError, ErrorCode } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { Plan, SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-10-28.acacia' as Stripe.LatestApiVersion,
});

const PLAN_PRICE_MAP: Record<string, string> = {
  PRO: config.stripe.prices.pro,
  AGENCY: config.stripe.prices.agency,
};

export class BillingService {
  async createCheckoutSession(userId: string, plan: 'PRO' | 'AGENCY') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const priceId = PLAN_PRICE_MAP[plan];
    if (!priceId) {
      throw new AppError(400, ErrorCode.BAD_REQUEST, `No price configured for plan: ${plan}`);
    }

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: 'FREE',
          status: 'ACTIVE',
          stripeCustomerId: customerId,
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/billing/cancel`,
      metadata: { userId, plan },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CHECKOUT_SESSION_CREATED',
        metadata: { plan, sessionId: session.id } as any,
      },
    });

    return { url: session.url, sessionId: session.id };
  }

  async createPortalSession(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      throw new AppError(400, ErrorCode.BAD_REQUEST, 'No billing account found. Please subscribe first.');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${config.frontendUrl}/settings/billing`,
    });

    return { url: session.url };
  }

  async getSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
    } catch (err) {
      logger.error({ err }, 'Stripe webhook signature verification failed');
      throw new AppError(400, ErrorCode.BAD_REQUEST, 'Invalid webhook signature');
    }

    logger.info({ type: event.type, id: event.id }, 'Processing Stripe webhook');

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info({ type: event.type }, 'Unhandled Stripe event type');
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as Plan | undefined;

    if (!userId || !plan) {
      logger.error({ session: session.id }, 'Missing userId or plan in checkout metadata');
      return;
    }

    const stripeSubscriptionId = session.subscription as string;

    const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
      update: {
        plan,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId,
        currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'SUBSCRIPTION_ACTIVATED',
        metadata: { plan, stripeSubscriptionId } as any,
      },
    });

    logger.info({ userId, plan }, 'Subscription activated');
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const sub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!sub) {
      logger.warn({ subscriptionId: subscription.id }, 'No local subscription found for Stripe subscription');
      return;
    }

    const statusMap: Record<string, SubscriptionStatus> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      trialing: 'TRIALING',
      incomplete: 'INCOMPLETE',
      incomplete_expired: 'INCOMPLETE_EXPIRED',
      unpaid: 'UNPAID',
    };

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: statusMap[subscription.status] || 'ACTIVE',
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    logger.info({ userId: sub.userId, status: subscription.status }, 'Subscription updated');
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const sub = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!sub) return;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        plan: 'FREE',
        status: 'CANCELED',
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: sub.userId,
        action: 'SUBSCRIPTION_CANCELED',
        metadata: { previousPlan: sub.plan } as any,
      },
    });

    logger.info({ userId: sub.userId }, 'Subscription canceled, reverted to FREE');
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;

    const sub = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!sub) return;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'PAST_DUE' },
    });

    await prisma.auditLog.create({
      data: {
        userId: sub.userId,
        action: 'PAYMENT_FAILED',
        metadata: { invoiceId: invoice.id } as any,
      },
    });

    logger.warn({ userId: sub.userId }, 'Payment failed');
  }
}

export const billingService = new BillingService();
