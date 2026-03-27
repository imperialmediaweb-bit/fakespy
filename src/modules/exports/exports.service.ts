import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';


export class ExportsService {
  async exportProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
        adGenerations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      project: {
        id: project.id,
        title: project.title,
        brandName: project.brandName,
        niche: project.niche,
        location: project.location,
        targetAudience: project.targetAudience,
        productDescription: project.productDescription,
        competitors: project.competitors,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      analyses: project.analyses.map((a) => ({
        id: a.id,
        status: a.status,
        sourceType: a.sourceType,
        inputSnapshot: a.inputSnapshot,
        normalizedInput: a.normalizedInput,
        inferredInsights: a.inferredInsights,
        strengths: a.strengths,
        weaknesses: a.weaknesses,
        opportunities: a.opportunities,
        messagingAngles: a.messagingAngles,
        disclaimers: a.disclaimers,
        createdAt: a.createdAt,
      })),
      generations: project.adGenerations.map((g) => ({
        id: g.id,
        type: g.type,
        output: g.output,
        tone: g.tone,
        audience: g.audience,
        objective: g.objective,
        createdAt: g.createdAt,
      })),
    };

    // Store export record
    const exportRecord = await prisma.export.create({
      data: {
        userId,
        projectId,
        type: 'JSON',
        metadata: {
          analysisCount: project.analyses.length,
          generationCount: project.adGenerations.length,
        } as any,
      },
    });

    // Usage was already incremented by the middleware (atomic check-and-reserve)

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PROJECT_EXPORTED',
        metadata: { projectId, exportId: exportRecord.id, type: 'JSON' } as any,
      },
    });

    return { export: exportRecord, data: exportData };
  }

  async findByUser(userId: string) {
    return prisma.export.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, title: true, brandName: true } },
      },
    });
  }
}

export const exportsService = new ExportsService();
