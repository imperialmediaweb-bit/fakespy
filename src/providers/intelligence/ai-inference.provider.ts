import {
  IntelligenceProvider,
  IntelligenceInput,
  IntelligenceResult,
  IntelligenceInsight,
} from './intelligence.provider.interface';
import { getDefaultAiProvider } from '../ai/ai.factory';
import { logger } from '../../lib/logger';

const SYSTEM_PROMPT = `You are an expert marketing strategist and competitive intelligence analyst.
You analyze brands, niches, and competitive landscapes to provide actionable marketing insights.

IMPORTANT RULES:
- You are providing AI-inferred strategic analysis based on the information given.
- You must NOT claim to have scraped or found real competitor ads.
- You must NOT present your analysis as verified external data.
- Clearly frame your insights as strategic inferences based on market patterns and the information provided.
- Be specific and actionable, but honest about the basis of your analysis.

Respond ONLY with valid JSON matching the required schema.`;

function buildUserPrompt(input: IntelligenceInput): string {
  const parts = [
    `Brand: ${input.brandName}`,
    input.niche ? `Niche/Industry: ${input.niche}` : null,
    input.location ? `Location/Market: ${input.location}` : null,
    input.targetAudience ? `Target Audience: ${input.targetAudience}` : null,
    input.productDescription ? `Product/Service Description: ${input.productDescription}` : null,
    input.competitors?.length ? `Known Competitors: ${input.competitors.join(', ')}` : null,
    input.notes ? `Additional Notes: ${input.notes}` : null,
  ].filter(Boolean);

  return `Analyze the following brand and market context:

${parts.join('\n')}

Provide a comprehensive competitive intelligence analysis with the following JSON structure:
{
  "inferredInsights": [
    { "content": "...", "confidence": "high|medium|low" }
  ],
  "strengths": [
    { "content": "...", "confidence": "high|medium|low" }
  ],
  "weaknesses": [
    { "content": "...", "confidence": "high|medium|low" }
  ],
  "opportunities": [
    { "content": "...", "confidence": "high|medium|low" }
  ],
  "messagingAngles": [
    { "content": "...", "confidence": "high|medium|low" }
  ],
  "disclaimers": [
    "All insights are AI-inferred strategic analysis, not scraped real competitor data.",
    "..."
  ]
}

Provide at least 3-5 items for each category. Be specific to this brand and niche.
For messaging angles, provide concrete ad copy directions and hook ideas.`;
}

export class AiInferenceProvider implements IntelligenceProvider {
  readonly name = 'ai_inference';

  async analyze(input: IntelligenceInput): Promise<IntelligenceResult> {
    const aiProvider = await getDefaultAiProvider();

    const result = await aiProvider.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(input),
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(result.content);
    } catch (err) {
      logger.error({ content: result.content }, 'Failed to parse AI intelligence response');
      throw new Error('Failed to parse intelligence analysis response');
    }

    const normalizedInput: Record<string, unknown> = {
      brandName: input.brandName,
      niche: input.niche || null,
      location: input.location || null,
      targetAudience: input.targetAudience || null,
      productDescription: input.productDescription || null,
      competitors: input.competitors || [],
      notes: input.notes || null,
    };

    const mapInsights = (items: Array<{ content: string; confidence: string }>): IntelligenceInsight[] =>
      (items || []).map((item) => ({
        content: item.content,
        origin: 'ai_inference' as const,
        confidence: (['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium') as
          | 'high'
          | 'medium'
          | 'low',
      }));

    const rawInsights = parsed.inferredInsights as Array<{ content: string; confidence: string }> || [];
    const rawStrengths = parsed.strengths as Array<{ content: string; confidence: string }> || [];
    const rawWeaknesses = parsed.weaknesses as Array<{ content: string; confidence: string }> || [];
    const rawOpportunities = parsed.opportunities as Array<{ content: string; confidence: string }> || [];
    const rawAngles = parsed.messagingAngles as Array<{ content: string; confidence: string }> || [];
    const rawDisclaimers = parsed.disclaimers as string[] || [];

    return {
      normalizedInput,
      inferredInsights: mapInsights(rawInsights),
      strengths: mapInsights(rawStrengths),
      weaknesses: mapInsights(rawWeaknesses),
      opportunities: mapInsights(rawOpportunities),
      messagingAngles: mapInsights(rawAngles),
      disclaimers: [
        'All insights are AI-inferred strategic analysis based on the provided information and general market knowledge.',
        'No real competitor ads were scraped or accessed.',
        ...rawDisclaimers,
      ],
      sourceType: 'ai_inference',
    };
  }
}
