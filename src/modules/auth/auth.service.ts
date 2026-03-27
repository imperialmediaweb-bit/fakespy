import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { config } from '../../config';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../../lib/errors';
import { logger } from '../../lib/logger';
import { getEmailProvider } from '../../providers/email/email.factory';

const SALT_ROUNDS = 12;

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export class AuthService {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        emailVerifyToken,
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create initial usage record
    const monthKey = this.getCurrentMonthKey();
    await prisma.usage.create({
      data: { userId: user.id, monthKey },
    });

    const tokens = await this.generateTokens(user.id, user.role);

    await this.logAction(user.id, 'USER_REGISTERED');

    // Send verification email
    const verifyUrl = `${config.frontendUrl}/verify-email?token=${emailVerifyToken}`;
    const emailProvider = getEmailProvider();
    await emailProvider.send({
      to: email.toLowerCase(),
      subject: 'FakeSpy AI – Verify Your Email',
      text: `Welcome to FakeSpy AI!\n\nPlease verify your email by visiting:\n${verifyUrl}`,
      html: `<p>Welcome to FakeSpy AI!</p><p><a href="${verifyUrl}">Click here to verify your email</a>.</p>`,
    });

    logger.info({ userId: user.id }, 'User registered');

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    await this.logAction(user.id, 'USER_LOGIN');

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    await this.logAction(userId, 'USER_LOGOUT');
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, refreshToken: true },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.role);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      logger.info({ email }, 'Password reset requested for non-existent email');
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
    const emailProvider = getEmailProvider();
    await emailProvider.send({
      to: user.email,
      subject: 'FakeSpy AI – Reset Your Password',
      text: `You requested a password reset.\n\nClick the link below to reset your password (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a> (expires in 1 hour).</p><p>If you did not request this, please ignore this email.</p>`,
    });

    await this.logAction(user.id, 'PASSWORD_RESET_REQUESTED');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null, // Invalidate all sessions
      },
    });

    await this.logAction(user.id, 'PASSWORD_RESET_COMPLETED');
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            plan: true,
            status: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
      },
    });

    await this.logAction(user.id, 'EMAIL_VERIFIED');
  }

  private async generateTokens(userId: string, role: string): Promise<TokenPair> {
    const payload: JwtPayload = { userId, role };

    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry as string & { __brand: 'StringValue' },
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry as string & { __brand: 'StringValue' },
    } as jwt.SignOptions);

    // Store refresh token hash in DB for validation
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }

  private async logAction(userId: string, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({
      data: { userId, action, metadata: (metadata || undefined) as any },
    });
  }

  private getCurrentMonthKey(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  }
}

export const authService = new AuthService();
