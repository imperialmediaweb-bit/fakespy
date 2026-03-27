import { prisma } from '../../lib/prisma';
import { NotFoundError, ForbiddenError } from '../../lib/errors';
import { CreateProjectInput, UpdateProjectInput } from '../../validators/project.validators';

export class ProjectsService {
  async create(userId: string, data: CreateProjectInput) {
    return prisma.project.create({
      data: {
        userId,
        title: data.title,
        brandName: data.brandName,
        niche: data.niche,
        location: data.location,
        targetAudience: data.targetAudience,
        productDescription: data.productDescription,
        competitors: data.competitors || [],
        inputData: (data.inputData || undefined) as any,
      },
    });
  }

  async findAllByUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { analyses: true, adGenerations: true },
          },
        },
      }),
      prisma.project.count({ where: { userId } }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        adGenerations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { analyses: true, adGenerations: true, exports: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return project;
  }

  async update(projectId: string, userId: string, data: UpdateProjectInput) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.brandName !== undefined) updateData.brandName = data.brandName;
    if (data.niche !== undefined) updateData.niche = data.niche;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
    if (data.productDescription !== undefined) updateData.productDescription = data.productDescription;
    if (data.competitors !== undefined) updateData.competitors = data.competitors;
    if (data.inputData !== undefined) updateData.inputData = data.inputData;

    return prisma.project.update({
      where: { id: projectId },
      data: updateData as any,
    });
  }

  async delete(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }

    await prisma.project.delete({ where: { id: projectId } });
  }
}

export const projectsService = new ProjectsService();
