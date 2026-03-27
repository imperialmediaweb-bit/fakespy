export interface IntelligenceInput {
  brandName: string;
  niche?: string;
  location?: string;
  targetAudience?: string;
  productDescription?: string;
  competitors?: string[];
  notes?: string;
}

export interface IntelligenceInsight {
  content: string;
  origin: 'user_input' | 'ai_inference' | 'system_derived' | 'external_provider';
  confidence: 'high' | 'medium' | 'low';
}

export interface IntelligenceResult {
  normalizedInput: Record<string, unknown>;
  inferredInsights: IntelligenceInsight[];
  strengths: IntelligenceInsight[];
  weaknesses: IntelligenceInsight[];
  opportunities: IntelligenceInsight[];
  messagingAngles: IntelligenceInsight[];
  disclaimers: string[];
  sourceType: string;
}

export interface IntelligenceProvider {
  readonly name: string;
  analyze(input: IntelligenceInput): Promise<IntelligenceResult>;
}
