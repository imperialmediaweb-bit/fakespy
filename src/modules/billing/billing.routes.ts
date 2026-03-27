import { Router, raw } from 'express';
import { billingController } from './billing.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Webhook must receive raw body for signature verification
router.post('/webhook', raw({ type: 'application/json' }), (req, res, next) =>
  billingController.webhook(req, res, next),
);

// Protected routes
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
