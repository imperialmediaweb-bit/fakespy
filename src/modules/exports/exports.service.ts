import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';

export class ExportsService {
  async exportProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        analyses: { orderBy: { createdAt: 'desc' } },
        adGenerations: {
          orderBy: { createdAt: 'desc' },
          include: {
            adScore: true,
            adVariations: true,
          },
        },
        audienceProfiles: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError('You do not have access to this project');

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportType: 'full_project_report',
      project: {
        id: project.id, title: project.title, brandName: project.brandName,
        niche: project.niche, location: project.location, targetAudience: project.targetAudience,
        productDescription: project.productDescription, competitors: project.competitors,
        createdAt: project.createdAt, updatedAt: project.updatedAt,
      },
      analyses: project.analyses.map(a => ({
        id: a.id, status: a.status, sourceType: a.sourceType,
        inputSnapshot: a.inputSnapshot, normalizedInput: a.normalizedInput,
        inferredInsights: a.inferredInsights, strengths: a.strengths,
        weaknesses: a.weaknesses, opportunities: a.opportunities,
        messagingAngles: a.messagingAngles, disclaimers: a.disclaimers, createdAt: a.createdAt,
      })),
      generations: project.adGenerations.map(g => ({
        id: g.id, type: g.type, output: g.output,
        tone: g.tone, audience: g.audience, objective: g.objective,
        tokensUsed: g.tokensUsed, estimatedCost: g.estimatedCost,
        createdAt: g.createdAt,
        score: g.adScore ? {
          clarityScore: g.adScore.clarityScore, emotionalImpact: g.adScore.emotionalImpact,
          ctrPotential: g.adScore.ctrPotential, conversionStrength: g.adScore.conversionStrength,
          overallScore: g.adScore.overallScore, suggestions: g.adScore.suggestions,
        } : null,
        variations: g.adVariations.map(v => ({
          style: v.style, output: v.output, tokensUsed: v.tokensUsed, createdAt: v.createdAt,
        })),
      })),
      audienceProfiles: project.audienceProfiles.map(ap => ({
        id: ap.id, name: ap.name, avatar: ap.avatar,
        painPoints: ap.painPoints, desires: ap.desires, objections: ap.objections,
        buyingTriggers: ap.buyingTriggers, demographics: ap.demographics,
        interests: ap.interests, createdAt: ap.createdAt,
      })),
      summary: {
        totalAnalyses: project.analyses.length,
        completedAnalyses: project.analyses.filter(a => a.status === 'COMPLETED').length,
        totalGenerations: project.adGenerations.length,
        totalVariations: project.adGenerations.reduce((sum, g) => sum + g.adVariations.length, 0),
        scoredGenerations: project.adGenerations.filter(g => g.adScore).length,
        audienceProfiles: project.audienceProfiles.length,
      },
    };

    const exportRecord = await prisma.export.create({
      data: {
        userId, projectId, type: 'JSON',
        metadata: { ...exportData.summary, exportType: 'full_project_report' } as any,
      },
    });

    await prisma.auditLog.create({
      data: { userId, action: 'PROJECT_EXPORTED', metadata: { projectId, exportId: exportRecord.id, type: 'JSON' } as any },
    });

    return { export: exportRecord, data: exportData };
  }

  async findByUser(userId: string) {
    return prisma.export.findMany({
      where: { userId }, orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, title: true, brandName: true } } },
    });
  }
}

export const exportsService = new ExportsService();
