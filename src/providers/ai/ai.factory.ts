import { AiProvider } from './ai.provider.interface';
import { OpenAiProvider } from './openai.provider';
import { config } from '../../config';
import { prisma } from '../../lib/prisma';
import { decrypt } from '../../utils/encryption';
import { logger } from '../../lib/logger';

type ProviderName = 'openai';

async function resolveApiKey(settingKey: string, envFallback: string): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: settingKey } });
    if (setting && setting.value) {
      const resolved = setting.encrypted ? decrypt(setting.value) : setting.value;
      if (resolved && resolved.length > 10 && !resolved.includes('placeholder')) {
        return resolved;
      }
    }
  } catch (err) {
    logger.warn({ settingKey }, 'Failed to read API key from DB, using env fallback');
  }
  return envFallback;
}

export function getAiProvider(name?: ProviderName, apiKey?: string): AiProvider {
  const providerName = name || 'openai';
  switch (providerName) {
    case 'openai':
      return new OpenAiProvider(apiKey || config.openai.apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}

export async function getDefaultAiProvider(): Promise<AiProvider> {
  const apiKey = await resolveApiKey('OPENAI_API_KEY', config.openai.apiKey);
  return new OpenAiProvider(apiKey);
}
