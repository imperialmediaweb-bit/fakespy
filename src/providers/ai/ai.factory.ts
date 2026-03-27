import { AiProvider } from './ai.provider.interface';
import { OpenAiProvider } from './openai.provider';
import { config } from '../../config';

type ProviderName = 'openai';

let defaultProvider: AiProvider | null = null;

export function getAiProvider(name?: ProviderName, apiKey?: string): AiProvider {
  const providerName = name || 'openai';

  switch (providerName) {
    case 'openai':
      return new OpenAiProvider(apiKey || config.openai.apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}

export function getDefaultAiProvider(): AiProvider {
  if (!defaultProvider) {
    defaultProvider = getAiProvider();
  }
  return defaultProvider;
}
