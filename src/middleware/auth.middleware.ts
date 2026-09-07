import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../lib/prisma';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';

interface JwtPayload {
  userId: string;
  role: string;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

    req.userId = payload.userId;
    req.userRole = payload.role;

    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}

/**
 * Requires ADMIN role. The JWT claim is checked first (cheap), then the role is
 * re-read from the database so a demoted or deleted admin loses access
 * immediately rather than for the remaining lifetime of their access token.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.userRole !== 'ADMIN' || !req.userId) {
    return next(new ForbiddenError('Admin access required'));
  }

  prisma.user
    .findUnique({ where: { id: req.userId }, select: { role: true } })
    .then((user) => {
      if (!user || user.role !== 'ADMIN') {
        return next(new ForbiddenError('Admin access required'));
      }
      next();
    })
    .catch(next);
}
