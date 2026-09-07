import { Router } from 'express';
import { billingController } from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';

// NOTE: the Stripe webhook is registered directly in app.ts (before the JSON
// body parser) because it must receive the raw request body.

const router = Router();

router.post('/create-checkout-session', authenticate, (req, res, next) =>
  billingController.createCheckoutSession(req, res, next),
);
router.post('/create-portal-session', authenticate, (req, res, next) =>
  billingController.createPortalSession(req, res, next),
);
router.get('/subscription', authenticate, (req, res, next) =>
  billingController.getSubscription(req, res, next),
);

export default router;
