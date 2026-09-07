import { prisma } from '../../lib/prisma';
import { getDefaultAiProvider } from '../../providers/ai/ai.factory';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const SYSTEM_PROMPT = `You are an expert audience research strategist. You create detailed ideal customer profiles for ad targeting.
Respond ONLY with valid JSON:
{
  "avatar": { "name": "...", "age": "...", "occupation": "...", "income": "...", "lifestyle": "...", "goals": "..." },
  "painPoints": ["pain 1", "pain 2", "pain 3", "pain 4", "pain 5"],
  "desires": ["desire 1", "desire 2", "desire 3", "desire 4", "desire 5"],
  "objections": ["objection 1", "objection 2", "objection 3"],
  "buyingTriggers": ["trigger 1", "trigger 2", "trigger 3"],
  "demographics": { "ageRange": "...", "gender": "...", "income": "...", "education": "...", "location": "..." },
  "interests": ["interest 1", "interest 2", "interest 3", "interest 4", "interest 5", "interest 6", "interest 7", "interest 8"]
}
Be specific and actionable. Interests should be usable for Facebook/Google ad targeting.`;

export class AudienceBuilderService {
  async generate(userId: string, projectId: string, name: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError('Access denied');

    const userPrompt = `Create an ideal customer profile for:
Brand: ${project.brandName}
${project.niche ? `Niche: ${project.niche}` : ''}
${project.targetAudience ? `Target Audience: ${project.targetAudience}` : ''}
${project.productDescription ? `Product: ${project.productDescription}` : ''}
${project.competitors?.length ? `Competitors: ${project.competitors.join(', ')}` : ''}
Profile Name: ${name}`;

    const aiProvider = await getDefaultAiProvider();
    const result = await aiProvider.complete({ systemPrompt: SYSTEM_PROMPT, userPrompt, temperature: 0.7, maxTokens: 2048, responseFormat: 'json' });

    let parsed: any;
    try { parsed = JSON.parse(result.content); } catch { logger.error('Failed to parse audience profile'); parsed = { avatar: {}, painPoints: [], desires: [], objections: [], buyingTriggers: [], demographics: {}, interests: [] }; }

    return prisma.audienceProfile.create({
      data: {
        projectId, userId, name,
        avatar: parsed.avatar || {},
        painPoints: parsed.painPoints || [],
        desires: parsed.desires || [],
        objections: parsed.objections || [],
        buyingTriggers: parsed.buyingTriggers || [],
        demographics: parsed.demographics || {},
        interests: parsed.interests || [],
      },
    });
  }

  async listByProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Project');
    if (project.userId !== userId) throw new ForbiddenError('Access denied');
    return prisma.audienceProfile.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async getById(userId: string, id: string) {
    const profile = await prisma.audienceProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundError('Audience profile');
    if (profile.userId !== userId) throw new ForbiddenError('Access denied');
    return profile;
  }

  async delete(userId: string, id: string) {
    const profile = await prisma.audienceProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundError('Audience profile');
    if (profile.userId !== userId) throw new ForbiddenError('Access denied');
    await prisma.audienceProfile.delete({ where: { id } });
  }
}

export const audienceBuilderService = new AudienceBuilderService();
