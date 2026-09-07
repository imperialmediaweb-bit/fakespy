import express, { raw } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

// Routes
import healthRoutes from './modules/health/health.routes';
import seoRoutes from './modules/seo/seo.routes';
import authRoutes from './modules/auth/auth.routes';
import projectsRoutes from './modules/projects/projects.routes';
import analysesRoutes from './modules/analyses/analyses.routes';
import generationsRoutes from './modules/generations/generations.routes';
import exportsRoutes from './modules/exports/exports.routes';
import billingRoutes from './modules/billing/billing.routes';
import settingsRoutes from './modules/settings/settings.routes';
import adminRoutes from './modules/admin/admin.routes';
import blogRoutes from './modules/blog/blog.routes';
import adScoreRoutes from './modules/adScore/adScore.routes';
import audienceBuilderRoutes from './modules/audienceBuilder/audienceBuilder.routes';
import adVariationsRoutes from './modules/adVariations/adVariations.routes';
import contactRoutes from './modules/contact/contact.routes';
import { billingController } from './modules/billing/billing.controller';

export function createApp() {
  const app = express();

  // Behind Railway/any reverse proxy: needed so rate limiting keys on the real
  // client IP (X-Forwarded-For) instead of the proxy's address.
  app.set('trust proxy', 1);

  // Security
  // Helmet's default CSP only allows same-origin images, which blocks blog
  // featured images hosted elsewhere. Everything else stays locked down.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'img-src': ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Request logging
  if (config.env !== 'test') {
    app.use(morgan('short'));
  }

  // Stripe webhook needs the raw body for signature verification, so it is
  // registered before the JSON parser and outside the global rate limiter
  // (a throttled webhook would drop paid upgrades).
  app.post(`${config.apiPrefix}/billing/webhook`, raw({ type: 'application/json' }), (req, res, next) =>
    billingController.webhook(req, res, next),
  );

  // Global API rate limit — API only, so page loads / static assets are unaffected.
  app.use(config.apiPrefix, globalRateLimiter);

  // Body parsing for all other routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Health + SEO routes (no prefix)
  app.use('/', healthRoutes);
  app.use('/', seoRoutes);

  // API routes
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/projects`, projectsRoutes);
  app.use(`${config.apiPrefix}/analyses`, analysesRoutes);
  app.use(`${config.apiPrefix}/generations`, generationsRoutes);
  app.use(`${config.apiPrefix}/exports`, exportsRoutes);
  app.use(`${config.apiPrefix}/billing`, billingRoutes);
  app.use(`${config.apiPrefix}/settings`, settingsRoutes);
  app.use(`${config.apiPrefix}/admin`, adminRoutes);
  app.use(`${config.apiPrefix}/blog`, blogRoutes);
  app.use(`${config.apiPrefix}/ad-scores`, adScoreRoutes);
  app.use(`${config.apiPrefix}/audience`, audienceBuilderRoutes);
  app.use(`${config.apiPrefix}/variations`, adVariationsRoutes);
  app.use(`${config.apiPrefix}/contact`, contactRoutes);

  // Serve frontend static files in production
  const frontendPath = path.join(__dirname, '..', 'frontend-dist');
  app.use(express.static(frontendPath));

  // SPA fallback: any non-API route serves index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith(config.apiPrefix) || req.path === '/health' || req.path === '/ready') {
      return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) next();
    });
  });

  // 404 handler (only for API routes now)
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}
