import { prisma } from '../../lib/prisma';
import { getDefaultAiProvider } from '../../providers/ai/ai.factory';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const VARIATION_STYLES = ['short', 'emotional', 'direct_response', 'premium', 'urgency'] as const;
type VariationStyle = typeof VARIATION_STYLES[number];

const STYLE_PROMPTS: Record<VariationStyle, string> = {
  short: 'Create a shorter, punchier version. Maximum 2-3 sentences. Keep the core message.',
  emotional: 'Rewrite with strong emotional appeal. Use storytelling, empathy, and emotional triggers.',
  direct_response: 'Rewrite as a direct response ad. Include a clear offer, urgency, and a strong specific CTA.',
  premium: 'Rewrite in a premium, luxury tone. Emphasize exclusivity, quality, and sophistication.',
  urgency: 'Rewrite with high urgency. Add time pressure, scarcity, and fear of missing out.',
};

export class AdVariationsService {
  async generateVariation(userId: string, generationId: string, style: string) {
    if (!VARIATION_STYLES.includes(style as VariationStyle)) {
      throw new Error(`Invalid style. Must be one of: ${VARIATION_STYLES.join(', ')}`);
    }

    const generation = await prisma.adGeneration.findUnique({ where: { id: generationId } });
    if (!generation) throw new NotFoundError('Ad generation');
    if (generation.userId !== userId) throw new ForbiddenError('Access denied');

    const originalContent = JSON.stringify(generation.output, null, 2);
    const stylePrompt = STYLE_PROMPTS[style as VariationStyle];

    const aiProvider = getDefaultAiProvider();
    const result = await aiProvider.complete({
      systemPrompt: `You are an expert ad copywriter. You create variations of existing ads. Respond with valid JSON matching the same structure as the original.`,
      userPrompt: `Original ${generation.type.replace(/_/g, ' ')} ad:\n${originalContent}\n\nInstruction: ${stylePrompt}\n\nRespond with the same JSON structure but rewritten in the requested style.`,
      temperature: 0.8,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    let output: any;
    try { output = JSON.parse(result.content); } catch { output = { rawContent: result.content }; }

    return prisma.adVariation.create({
      data: { generationId, userId, style, output, tokensUsed: result.tokensUsed },
    });
  }

  async listByGeneration(generationId: string) {
    return prisma.adVariation.findMany({ where: { generationId }, orderBy: { createdAt: 'desc' } });
  }

  async generateAll(userId: string, generationId: string) {
    const results = [];
    for (const style of VARIATION_STYLES) {
      const existing = await prisma.adVariation.findFirst({ where: { generationId, style } });
      if (existing) { results.push(existing); continue; }
      const variation = await this.generateVariation(userId, generationId, style);
      results.push(variation);
    }
    return results;
  }

  getAvailableStyles() {
    return VARIATION_STYLES.map(s => ({ value: s, label: s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), description: STYLE_PROMPTS[s] }));
  }
}

export const adVariationsService = new AdVariationsService();
