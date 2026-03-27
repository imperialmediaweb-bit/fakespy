import { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';
import { ValidationError } from '../../lib/errors';
import { z } from 'zod';

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'AGENCY']),
});

export class BillingController {
  async createCheckoutSession(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid plan', parsed.error.flatten().fieldErrors);
      }

      const result = await billingService.createCheckoutSession(req.userId!, parsed.data.plan);

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async createPortalSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.createPortalSession(req.userId!);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await billingService.getSubscription(req.userId!);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        throw new ValidationError('Missing stripe-signature header');
      }

      await billingService.handleWebhook(req.body, signature);

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
}

export const billingController = new BillingController();
