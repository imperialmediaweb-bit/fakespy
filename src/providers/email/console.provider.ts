import { EmailProvider, EmailMessage } from './email.provider.interface';
import { logger } from '../../lib/logger';

/**
 * Console email provider — logs emails instead of sending them.
 * Used in development/test environments or when SMTP is not configured.
 */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console';

  async send(message: EmailMessage): Promise<void> {
    logger.info(
      {
        to: message.to,
        subject: message.subject,
        textLength: message.text.length,
      },
      `[EMAIL] Would send email to ${message.to}: "${message.subject}"`,
    );

    if (process.env.NODE_ENV === 'development') {
      logger.debug({ body: message.text }, '[EMAIL] Email body (dev only)');
    }
  }
}
