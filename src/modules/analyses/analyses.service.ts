import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { CreateAnalysisInput } from '../../validators/analysis.validators';
import { getIntelligenceProvider } from '../../providers/intelligence/intelligence.factory';
import { usageService } from '../auth/usage.service';
import { logger } from '../../lib/logger';

export class AnalysesService {
  /**
   * Analyses run in-process; a restart or an AI hang can leave rows stuck in
   * PENDING/PROCESSING. Mark anything older than `maxAgeMinutes` as FAILED and
   * release the reserved quota so the user can retry.
   */
  async failStale(maxAgeMinutes = 15): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000);
    const stale = await prisma.analysis.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] }, updatedAt: { lt: cutoff } },
      select: { id: true, userId: true },
    });
    if (stale.length === 0) return 0;

    await prisma.analysis.updateMany({
      where: { id: { in: stale.map(s => s.id) } },
      data: { status: 'FAILED', errorMessage: `Timed out after ${maxAgeMinutes} minutes` },
    });
    for (const s of stale) {
      await usageService.decrementUsage(s.userId, 'analysesUsed');
    }
    logger.warn({ count: stale.length }, 'Marked stale analyses as FAILED');
    return stale.length;
  }

  /** Paginated list of the user's analyses across all projects. */
  async findAllByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { project: { select: { id: true, title: true, brandName: true } } },
      }),
      prisma.analysis.count({ where: { userId } }),
    ]);
    return { analyses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async create(userId: string, data: CreateAnalysisInput) {
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

    const inputSnapshot = {
      brandName: data.brandName,
      niche: data.niche,
      location: data.location,
      targetAudience: data.targetAudience,
      productDescription: data.productDescription,
      competitors: data.competitors || [],
      notes: data.notes,
    };

    // Create analysis in pending state
    const analysis = await prisma.analysis.create({
      data: {
        projectId: data.projectId,
        userId,
        status: 'PENDING',
        sourceType: 'ai_inference',
        inputSnapshot,
      },
    });

    // Run analysis asynchronously (in-process for now, queue-ready)
    this.runAnalysis(analysis.id, inputSnapshot).catch((err) => {
      logger.error({ analysisId: analysis.id, err }, 'Analysis failed');
    });

    return analysis;
  }

  private async runAnalysis(analysisId: string, input: Record<string, unknown>) {
    try {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'PROCESSING' },
      });

      const provider = getIntelligenceProvider();
      const result = await provider.analyze({
        brandName: input.brandName as string,
        niche: input.niche as string | undefined,
        location: input.location as string | undefined,
        targetAudience: input.targetAudience as string | undefined,
        productDescription: input.productDescription as string | undefined,
        competitors: input.competitors as string[] | undefined,
        notes: input.notes as string | undefined,
      });

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          sourceType: result.sourceType,
          normalizedInput: result.normalizedInput as any,
          inferredInsights: result.inferredInsights as any,
          strengths: result.strengths as any,
          weaknesses: result.weaknesses as any,
          opportunities: result.opportunities as any,
          messagingAngles: result.messagingAngles as any,
          disclaimers: result.disclaimers as any,
        },
      });

      // Usage was already incremented by the middleware (atomic check-and-reserve)

      logger.info({ analysisId }, 'Analysis completed successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'FAILED',
          errorMessage: message,
        },
      });

      // Release the usage reservation since the operation failed
      const failedAnalysis = await prisma.analysis.findUnique({
        where: { id: analysisId },
        select: { userId: true },
      });
      if (failedAnalysis) {
        await usageService.decrementUsage(failedAnalysis.userId, 'analysesUsed');
      }

      logger.error({ analysisId, error }, 'Analysis processing failed');
    }
  }

  async findById(analysisId: string, userId: string) {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        project: { select: { id: true, title: true, brandName: true } },
      },
    });

    if (!analysis) {
      throw new NotFoundError('Analysis');
    }

    if (analysis.userId !== userId) {
      throw new ForbiddenError('You do not have access to this analysis');
    }

    return analysis;
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

    return prisma.analysis.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async rerun(analysisId: string, userId: string) {
    const original = await prisma.analysis.findUnique({
      where: { id: analysisId },
    });

    if (!original) {
      throw new NotFoundError('Analysis');
    }

    if (original.userId !== userId) {
      throw new ForbiddenError('You do not have access to this analysis');
    }

    const inputSnapshot = original.inputSnapshot as Record<string, unknown>;

    const newAnalysis = await prisma.analysis.create({
      data: {
        projectId: original.projectId,
        userId,
        status: 'PENDING',
        sourceType: 'ai_inference',
        inputSnapshot: inputSnapshot as any,
      },
    });

    this.runAnalysis(newAnalysis.id, inputSnapshot).catch((err) => {
      logger.error({ analysisId: newAnalysis.id, err }, 'Rerun analysis failed');
    });

    return newAnalysis;
  }
}

export const analysesService = new AnalysesService();
