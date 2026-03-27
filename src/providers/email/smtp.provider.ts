import { createTransport, Transporter } from 'nodemailer';
import { EmailProvider, EmailMessage } from './email.provider.interface';
import { ExternalServiceError } from '../../lib/errors';
import { logger } from '../../lib/logger';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

/**
 * SMTP email provider — sends real emails via SMTP (Mailgun, SendGrid, AWS SES, etc.).
 */
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';
  private transporter: Transporter;
  private from: string;

  constructor(config: SmtpConfig) {
    this.from = config.from;
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async send(message: EmailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      logger.info({ to: message.to, subject: message.subject }, 'Email sent successfully');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ error, to: message.to }, 'Failed to send email');
      throw new ExternalServiceError('SMTP', msg);
    }
  }
}
