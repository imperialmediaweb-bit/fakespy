import { prisma } from '../../lib/prisma';
import { encrypt, decrypt } from '../../utils/encryption';
import { ValidationError } from '../../lib/errors';

export interface ProviderConfig {
  key: string;
  label: string;
  category: string;
  sensitive: boolean;
}

// All configurable provider settings
export const PROVIDER_CONFIGS: ProviderConfig[] = [
  // AI Providers
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', category: 'ai', sensitive: true },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key', category: 'ai', sensitive: true },
  { key: 'GOOGLE_AI_API_KEY', label: 'Google Gemini API Key', category: 'ai', sensitive: true },
  { key: 'AI_DEFAULT_PROVIDER', label: 'Default AI Provider (openai/anthropic/google)', category: 'ai', sensitive: false },

  // Payment Processors
  { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', category: 'payment', sensitive: true },
  { key: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret', category: 'payment', sensitive: true },
  { key: 'STRIPE_PRICE_PRO', label: 'Stripe Pro Plan Price ID', category: 'payment', sensitive: false },
  { key: 'STRIPE_PRICE_AGENCY', label: 'Stripe Agency Plan Price ID', category: 'payment', sensitive: false },
  { key: 'PAYPAL_CLIENT_ID', label: 'PayPal Client ID', category: 'payment', sensitive: true },
  { key: 'PAYPAL_CLIENT_SECRET', label: 'PayPal Client Secret', category: 'payment', sensitive: true },
  { key: 'PAYPAL_WEBHOOK_ID', label: 'PayPal Webhook ID', category: 'payment', sensitive: false },
  { key: 'RAZORPAY_KEY_ID', label: 'Razorpay Key ID', category: 'payment', sensitive: true },
  { key: 'RAZORPAY_KEY_SECRET', label: 'Razorpay Key Secret', category: 'payment', sensitive: true },
  { key: 'PADDLE_API_KEY', label: 'Paddle API Key', category: 'payment', sensitive: true },
  { key: 'PADDLE_WEBHOOK_SECRET', label: 'Paddle Webhook Secret', category: 'payment', sensitive: true },
  { key: 'LEMONSQUEEZY_API_KEY', label: 'LemonSqueezy API Key', category: 'payment', sensitive: true },
  { key: 'LEMONSQUEEZY_WEBHOOK_SECRET', label: 'LemonSqueezy Webhook Secret', category: 'payment', sensitive: true },
  { key: 'PAYMENT_DEFAULT_PROVIDER', label: 'Default Payment Provider (stripe/paypal/razorpay/paddle/lemonsqueezy)', category: 'payment', sensitive: false },

  // Email / SMTP
  { key: 'SMTP_HOST', label: 'SMTP Host', category: 'email', sensitive: false },
  { key: 'SMTP_PORT', label: 'SMTP Port', category: 'email', sensitive: false },
  { key: 'SMTP_USER', label: 'SMTP Username', category: 'email', sensitive: false },
  { key: 'SMTP_PASS', label: 'SMTP Password', category: 'email', sensitive: true },
  { key: 'EMAIL_FROM', label: 'Sender Email Address', category: 'email', sensitive: false },
  { key: 'SENDGRID_API_KEY', label: 'SendGrid API Key', category: 'email', sensitive: true },
  { key: 'MAILGUN_API_KEY', label: 'Mailgun API Key', category: 'email', sensitive: true },
  { key: 'MAILGUN_DOMAIN', label: 'Mailgun Domain', category: 'email', sensitive: false },
  { key: 'EMAIL_DEFAULT_PROVIDER', label: 'Default Email Provider (smtp/sendgrid/mailgun/console)', category: 'email', sensitive: false },

  // General
  { key: 'FRONTEND_URL', label: 'Frontend URL', category: 'general', sensitive: false },
  { key: 'SUPPORT_EMAIL', label: 'Support Email Address', category: 'general', sensitive: false },
  { key: 'PLATFORM_NAME', label: 'Platform Name', category: 'general', sensitive: false },
];

export class SystemSettingsService {
  async getAll() {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    });

    // Mask sensitive values
    return settings.map(s => ({
      id: s.id,
      key: s.key,
      value: s.encrypted ? this.maskValue(s.value) : s.value,
      hasValue: s.value.length > 0,
      encrypted: s.encrypted,
      category: s.category,
      label: s.label,
    }));
  }

  async upsert(key: string, value: string): Promise<void> {
    const config = PROVIDER_CONFIGS.find(c => c.key === key);
    if (!config) throw new Error(`Unknown setting: ${key}`);

    const storedValue = config.sensitive ? encrypt(value) : value;

    await prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        value: storedValue,
        encrypted: config.sensitive,
        category: config.category,
        label: config.label,
      },
      update: {
        value: storedValue,
        encrypted: config.sensitive,
        label: config.label,
      },
    });
  }

  async delete(key: string): Promise<void> {
    if (!PROVIDER_CONFIGS.some(c => c.key === key)) throw new ValidationError(`Unknown setting: ${key}`);
    await prisma.systemSetting.deleteMany({ where: { key } });
  }

  async getDecrypted(key: string): Promise<string | null> {
    const setting = await prisma.systemSetting.findUnique({ where: { key } });
    if (!setting) return null;
    return setting.encrypted ? decrypt(setting.value) : setting.value;
  }

  async getConfigSchema() {
    const settings = await prisma.systemSetting.findMany();
    const settingMap = new Map(settings.map(s => [s.key, s]));

    const categories: Record<string, { key: string; label: string; hasValue: boolean; sensitive: boolean }[]> = {};
    for (const config of PROVIDER_CONFIGS) {
      if (!categories[config.category]) categories[config.category] = [];
      const existing = settingMap.get(config.key);
      categories[config.category].push({
        key: config.key,
        label: config.label,
        hasValue: existing ? existing.value.length > 0 : false,
        sensitive: config.sensitive,
      });
    }

    return categories;
  }

  /** Secrets are never partially revealed — the UI only needs to know a value exists. */
  private maskValue(_encryptedValue: string): string {
    return '••••••••';
  }
}

export const systemSettingsService = new SystemSettingsService();
