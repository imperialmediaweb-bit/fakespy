import { prisma } from '../../lib/prisma';
import { getDefaultAiProvider } from '../../providers/ai/ai.factory';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { logger } from '../../lib/logger';
import { usageService } from '../auth/usage.service';

const SCORING_SYSTEM_PROMPT = `You are an expert advertising analyst. You score ads on 4 dimensions (1-100 each).
Respond ONLY with valid JSON:
{
  "clarityScore": <1-100>,
  "emotionalImpact": <1-100>,
  "ctrPotential": <1-100>,
  "conversionStrength": <1-100>,
  "overallScore": <1-100>,
  "suggestions": ["improvement 1", "improvement 2", "improvement 3"]
}

Scoring criteria:
- clarityScore: How clear is the message? Is the value proposition immediately obvious?
- emotionalImpact: Does it evoke an emotional response? Does it connect with the audience?
- ctrPotential: Would someone click on this? Is the hook compelling?
- conversionStrength: Would this drive the desired action? Is the CTA effective?
- overallScore: Weighted average considering all dimensions.
- suggestions: 3-5 specific, actionable improvements.`;

export class AdScoreService {
  async scoreGeneration(userId: string, generationId: string) {
    const generation = await prisma.adGeneration.findUnique({ where: { id: generationId } });
    if (!generation) throw new NotFoundError('Ad generation');
    if (generation.userId !== userId) throw new ForbiddenError('Access denied');

    // Already scored: return cached result and release the quota the middleware reserved,
    // since no AI call is made.
    const existing = await prisma.adScore.findUnique({ where: { generationId } });
    if (existing) {
      await usageService.decrementUsage(userId, 'generationsUsed');
      return existing;
    }

    const adContent = JSON.stringify(generation.output, null, 2);
    const userPrompt = `Score this ${generation.type.replace(/_/g, ' ')} ad:\n\n${adContent}\n\nContext:\n- Tone: ${generation.tone || 'not specified'}\n- Audience: ${generation.audience || 'not specified'}\n- Objective: ${generation.objective || 'not specified'}`;

    const aiProvider = await getDefaultAiProvider();
    const result = await aiProvider.complete({
      systemPrompt: SCORING_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1024,
      responseFormat: 'json',
    });

    let scores: any;
    try {
      scores = JSON.parse(result.content);
    } catch {
      logger.error({ content: result.content }, 'Failed to parse ad score response');
      scores = { clarityScore: 50, emotionalImpact: 50, ctrPotential: 50, conversionStrength: 50, overallScore: 50, suggestions: ['Unable to parse detailed scoring. Please re-score.'] };
    }

    const clamp = (v: number) => Math.min(100, Math.max(1, Math.round(v)));

    return prisma.adScore.create({
      data: {
        generationId,
        clarityScore: clamp(scores.clarityScore),
        emotionalImpact: clamp(scores.emotionalImpact),
        ctrPotential: clamp(scores.ctrPotential),
        conversionStrength: clamp(scores.conversionStrength),
        overallScore: clamp(scores.overallScore),
        suggestions: scores.suggestions || [],
      },
    });
  }

  async getScore(userId: string, generationId: string) {
    const generation = await prisma.adGeneration.findUnique({ where: { id: generationId }, select: { userId: true } });
    if (!generation) throw new NotFoundError('Ad generation');
    if (generation.userId !== userId) throw new ForbiddenError('Access denied');
    return prisma.adScore.findUnique({ where: { generationId } });
  }
}

export const adScoreService = new AdScoreService();
