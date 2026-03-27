export interface AiCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface AiCompletionResult {
  content: string;
  tokensUsed: number;
  estimatedCost: number;
  model: string;
}

export interface AiProvider {
  readonly name: string;
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;
}
