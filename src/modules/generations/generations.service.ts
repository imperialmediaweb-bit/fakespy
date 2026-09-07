import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { CreateGenerationInput } from '../../validators/generation.validators';
import { getDefaultAiProvider } from '../../providers/ai/ai.factory';
import { getPromptBuilder } from './prompt-builders';

import { logger } from '../../lib/logger';
import { GenerationType } from '@prisma/client';

export class GenerationsService {
  async create(userId: string, data: CreateGenerationInput) {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    // If analysisId provided, verify it exists and belongs to user
    if (data.analysisId) {
      const analysis = await prisma.analysis.findUnique({
        where: { id: data.analysisId },
      });

      if (!analysis) {
        throw new NotFoundError('Analysis');
      }

      if (analysis.userId !== userId) {
        throw new ForbiddenError('You do not have access to this analysis');
      }
    }

    const promptBuilder = getPromptBuilder(data.type);
    const { systemPrompt, userPrompt } = promptBuilder(data);

    const promptSnapshot = {
      type: data.type,
      brandName: data.brandName,
      niche: data.niche,
      audience: data.audience,
      tone: data.tone,
      objective: data.objective,
      competitorContext: data.competitorContext,
      additionalInstructions: data.additionalInstructions,
      systemPrompt,
      userPrompt,
    };

    const aiProvider = await getDefaultAiProvider();

    const result = await aiProvider.complete({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      maxTokens: 4096,
      responseFormat: 'json',
    });

    let output: Record<string, unknown>;
    try {
      output = JSON.parse(result.content);
    } catch {
      logger.error({ content: result.content }, 'Failed to parse generation response');
      output = { rawContent: result.content, parseError: true };
    }

    const generation = await prisma.adGeneration.create({
      data: {
        projectId: data.projectId,
        userId,
        analysisId: data.analysisId || null,
        type: data.type as GenerationType,
        promptSnapshot: promptSnapshot as any,
        output: output as any,
        tone: data.tone,
        audience: data.audience,
        objective: data.objective,
        tokensUsed: result.tokensUsed,
        estimatedCost: result.estimatedCost,
      },
    });

    // Usage was already incremented by the middleware (atomic check-and-reserve)

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AD_GENERATED',
        metadata: {
          generationId: generation.id,
          type: data.type,
          tokensUsed: result.tokensUsed,
        } as any,
      },
    });

    return generation;
  }

  async findById(generationId: string, userId: string) {
    const generation = await prisma.adGeneration.findUnique({
      where: { id: generationId },
      include: {
        project: { select: { id: true, title: true, brandName: true } },
        analysis: { select: { id: true, status: true } },
      },
    });

    if (!generation) {
      throw new NotFoundError('Ad generation');
    }

    if (generation.userId !== userId) {
      throw new ForbiddenError('You do not have access to this generation');
    }

    return generation;
  }

  async findByProject(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return prisma.adGeneration.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const generationsService = new GenerationsService();
