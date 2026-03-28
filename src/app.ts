import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { globalRateLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

import { authenticate } from './middleware/auth.middleware';

// Routes
import healthRoutes from './modules/health/health.routes';
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
import { analysesController } from './modules/analyses/analyses.controller';
import { generationsController } from './modules/generations/generations.controller';

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // Rate limiting
  app.use(globalRateLimiter);

  // Request logging
  if (config.env !== 'test') {
    app.use(morgan('short'));
  }

  // Body parsing - billing webhook needs raw body, so register it before json parser
  // Billing routes handle their own body parsing for webhook
  app.use(`${config.apiPrefix}/billing`, billingRoutes);

  // Standard body parsing for all other routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Health routes (no prefix)
  app.use('/', healthRoutes);

  // API routes
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/projects`, projectsRoutes);
  app.use(`${config.apiPrefix}/analyses`, analysesRoutes);
  app.use(`${config.apiPrefix}/generations`, generationsRoutes);
  app.use(`${config.apiPrefix}/exports`, exportsRoutes);
  app.use(`${config.apiPrefix}/settings`, settingsRoutes);
  app.use(`${config.apiPrefix}/admin`, adminRoutes);
  app.use(`${config.apiPrefix}/blog`, blogRoutes);
  app.use(`${config.apiPrefix}/ad-scores`, adScoreRoutes);
  app.use(`${config.apiPrefix}/audience`, audienceBuilderRoutes);
  app.use(`${config.apiPrefix}/variations`, adVariationsRoutes);

  // Project-scoped sub-routes
  app.get(
    `${config.apiPrefix}/projects/:id/analyses`,
    authenticate as express.RequestHandler,
    (req, res, next) => analysesController.findByProject(req, res, next),
  );

  app.get(
    `${config.apiPrefix}/projects/:id/generations`,
    authenticate as express.RequestHandler,
    (req, res, next) => generationsController.findByProject(req, res, next),
  );

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
