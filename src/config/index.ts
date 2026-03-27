import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3000'), 10),
  apiPrefix: optional('API_PREFIX', '/api/v1'),

  database: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiry: optional('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '7d'),
  },

  stripe: {
    secretKey: required('STRIPE_SECRET_KEY'),
    webhookSecret: required('STRIPE_WEBHOOK_SECRET'),
    prices: {
      pro: optional('STRIPE_PRICE_PRO', ''),
      agency: optional('STRIPE_PRICE_AGENCY', ''),
    },
  },

  openai: {
    apiKey: required('OPENAI_API_KEY'),
  },

  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),

  email: {
    host: optional('SMTP_HOST', ''),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('EMAIL_FROM', 'noreply@fakespy.ai'),
  },

  encryptionKey: required('ENCRYPTION_KEY'),

  sentry: {
    dsn: optional('SENTRY_DSN', ''),
  },

  logging: {
    level: optional('LOG_LEVEL', 'info'),
  },
} as const;

export const isProd = config.env === 'production';
export const isDev = config.env === 'development';
export const isTest = config.env === 'test';
