import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
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

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}
