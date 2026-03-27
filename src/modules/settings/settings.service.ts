import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { NotFoundError, UnauthorizedError, ConflictError } from '../../lib/errors';
import { encrypt, decrypt } from '../../utils/encryption';
import { usageService } from '../auth/usage.service';

const SALT_ROUNDS = 12;

export class SettingsService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) throw new NotFoundError('User');

    const usage = await usageService.getUsage(userId);

    return { ...user, usage };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email.toLowerCase(), id: { not: userId } },
      });
      if (existing) {
        throw new ConflictError('Email already in use');
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase(), emailVerified: false }),
      },
      select: { id: true, name: true, email: true, emailVerified: true, updatedAt: true },
    });
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) throw new NotFoundError('User');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: { userId, action: 'PASSWORD_CHANGED' },
    });
  }

  async getApiKeys(userId: string) {
    const keys = await prisma.apiKeySetting.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return keys;
  }

  async createApiKey(userId: string, provider: string, key: string) {
    const encryptedKey = encrypt(key);

    return prisma.apiKeySetting.upsert({
      where: { userId_provider: { userId, provider } },
      create: {
        userId,
        provider,
        encryptedKey,
      },
      update: {
        encryptedKey,
      },
      select: {
        id: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteApiKey(userId: string, keyId: string) {
    const key = await prisma.apiKeySetting.findUnique({ where: { id: keyId } });

    if (!key) throw new NotFoundError('API key');
    if (key.userId !== userId) throw new NotFoundError('API key');

    await prisma.apiKeySetting.delete({ where: { id: keyId } });
  }

  async getDecryptedApiKey(userId: string, provider: string): Promise<string | null> {
    const key = await prisma.apiKeySetting.findUnique({
      where: { userId_provider: { userId, provider } },
    });

    if (!key) return null;

    return decrypt(key.encryptedKey);
  }
}

export const settingsService = new SettingsService();
