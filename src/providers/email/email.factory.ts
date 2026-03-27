import { EmailProvider } from './email.provider.interface';
import { ConsoleEmailProvider } from './console.provider';
import { SmtpEmailProvider } from './smtp.provider';
import { config } from '../../config';

let provider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!provider) {
    const isSmtpConfigured =
      config.email.host && config.email.user && config.email.pass;

    if (isSmtpConfigured) {
      provider = new SmtpEmailProvider({
        host: config.email.host,
        port: config.email.port,
        user: config.email.user,
        pass: config.email.pass,
        from: config.email.from,
      });
    } else {
      provider = new ConsoleEmailProvider();
    }
  }

  return provider;
}
