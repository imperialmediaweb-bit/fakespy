import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { ValidationError } from '../../lib/errors';
import { getEmailProvider } from '../../providers/email/email.factory';
import { systemSettingsService } from '../admin/systemSettings.service';
import { config } from '../../config';
import { logger } from '../../lib/logger';

const router = Router();

const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many messages. Please try again later.' } },
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(10).max(5000),
  // Honeypot: real users never fill this hidden field.
  website: z.string().max(0).optional(),
});

/**
 * Public contact form. Delivers the message to the support inbox (admin
 * setting SUPPORT_EMAIL, falling back to EMAIL_FROM) via the configured email
 * provider. Without SMTP the message is logged by the console provider.
 */
router.post('/', contactRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
    const { name, email, message } = parsed.data;

    const supportEmail = (await systemSettingsService.getDecrypted('SUPPORT_EMAIL')) || config.email.from;

    await getEmailProvider().send({
      to: supportEmail,
      subject: `[Adxura Contact] ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>`,
    });

    logger.info({ email }, 'Contact message delivered');
    res.json({ success: true, message: 'Message sent' });
  } catch (err) {
    next(err);
  }
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export default router;
