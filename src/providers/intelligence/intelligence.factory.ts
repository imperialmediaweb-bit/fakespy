import { IntelligenceProvider } from './intelligence.provider.interface';
import { AiInferenceProvider } from './ai-inference.provider';

type ProviderName = 'ai_inference';

const providers = new Map<string, IntelligenceProvider>();

export function getIntelligenceProvider(name?: ProviderName): IntelligenceProvider {
  const providerName = name || 'ai_inference';

  if (!providers.has(providerName)) {
    switch (providerName) {
      case 'ai_inference':
        providers.set(providerName, new AiInferenceProvider());
        break;
      default:
        throw new Error(`Unsupported intelligence provider: ${providerName}`);
    }
  }

  return providers.get(providerName)!;
}
