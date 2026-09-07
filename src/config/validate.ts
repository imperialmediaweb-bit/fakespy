import { config, isProd } from './index';
import { logger } from '../lib/logger';

/**
 * Validates configuration at startup and warns about missing optional values
 * that could cause runtime failures.
 */
export function validateConfig(): void {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Stripe price IDs required for billing to work
  if (!config.stripe.prices.pro) {
    warnings.push('STRIPE_PRICE_PRO is not set — Pro plan checkout will fail');
  }
  if (!config.stripe.prices.agency) {
    warnings.push('STRIPE_PRICE_AGENCY is not set — Agency plan checkout will fail');
  }

  // Email provider check
  if (!config.email.host || !config.email.user || !config.email.pass) {
    warnings.push('SMTP not configured — emails will be logged to console instead of sent');
  }

  // OpenAI key can come from env OR admin panel (system_settings table)
  if (!config.openai.apiKey || config.openai.apiKey.includes('placeholder')) {
    warnings.push('OPENAI_API_KEY not set in env — AI features require a key set in Admin → System Settings');
  }

  // Encryption key must be exactly 64 hex chars
  if (config.encryptionKey.length !== 64 || !/^[0-9a-fA-F]+$/.test(config.encryptionKey)) {
    errors.push('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  // Reject placeholder secrets everywhere except the test runner. A deploy that
  // forgets NODE_ENV=production must not silently boot with default secrets.
  if (config.env !== 'test') {
    if (!config.jwt.accessSecret || config.jwt.accessSecret.includes('change-me') || config.jwt.accessSecret.length < 32) {
      errors.push('JWT_ACCESS_SECRET is missing, a placeholder, or shorter than 32 chars — generate one with: openssl rand -hex 32');
    }
    if (!config.jwt.refreshSecret || config.jwt.refreshSecret.includes('change-me') || config.jwt.refreshSecret.length < 32) {
      errors.push('JWT_REFRESH_SECRET is missing, a placeholder, or shorter than 32 chars — generate one with: openssl rand -hex 32');
    }
    if (config.jwt.accessSecret && config.jwt.accessSecret === config.jwt.refreshSecret) {
      errors.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }
    if (config.encryptionKey === '0'.repeat(64)) {
      errors.push('ENCRYPTION_KEY is all zeros — generate a real key with: openssl rand -hex 32');
    }
  }

  // Sentry DSN recommended for production
  if (isProd && !config.sentry.dsn) {
    warnings.push('SENTRY_DSN is not set — error tracking is disabled');
  }

  // Log warnings
  for (const w of warnings) {
    logger.warn(`[CONFIG] ${w}`);
  }

  // Log errors and exit if critical
  if (errors.length > 0) {
    for (const e of errors) {
      logger.error(`[CONFIG] ${e}`);
    }
    throw new Error(`Configuration validation failed: ${errors.join('; ')}`);
  }
}
