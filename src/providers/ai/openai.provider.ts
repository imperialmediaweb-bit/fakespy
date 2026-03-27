import OpenAI from 'openai';
import { AiProvider, AiCompletionOptions, AiCompletionResult } from './ai.provider.interface';
import { ExternalServiceError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const MODEL = 'gpt-4o';
const COST_PER_INPUT_TOKEN = 0.0025 / 1000;
const COST_PER_OUTPUT_TOKEN = 0.01 / 1000;
const MAX_RETRIES = 3;

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: MODEL,
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          ...(options.responseFormat === 'json' && {
            response_format: { type: 'json_object' },
          }),
        });

        const content = response.choices[0]?.message?.content || '';
        const inputTokens = response.usage?.prompt_tokens || 0;
        const outputTokens = response.usage?.completion_tokens || 0;
        const tokensUsed = inputTokens + outputTokens;
        const estimatedCost =
          inputTokens * COST_PER_INPUT_TOKEN + outputTokens * COST_PER_OUTPUT_TOKEN;

        return {
          content,
          tokensUsed,
          estimatedCost,
          model: MODEL,
        };
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRetryable =
          error instanceof OpenAI.APIError &&
          (error.status === 429 || error.status === 500 || error.status === 503);

        if (!isRetryable || attempt === MAX_RETRIES) {
          logger.error({ error, attempt }, 'OpenAI API call failed');
          break;
        }

        const delay = Math.pow(2, attempt) * 1000;
        logger.warn({ attempt, delay }, 'Retrying OpenAI API call');
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new ExternalServiceError('OpenAI', lastError?.message || 'Unknown error');
  }
}
