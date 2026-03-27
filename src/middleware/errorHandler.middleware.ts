import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn(
      {
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    const errorResponse: Record<string, unknown> = {
      code: err.code,
      message: err.message,
    };
    if (err.details) {
      errorResponse.details = err.details;
    }

    return res.status(err.statusCode).json({
      success: false,
      error: errorResponse,
    });
  }

  // Prisma known errors
  if ((err as unknown as Record<string, unknown>).code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: {
        code: ErrorCode.CONFLICT,
        message: 'A record with this value already exists',
      },
    });
  }

  if ((err as unknown as Record<string, unknown>).code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'Record not found',
      },
    });
  }

  // Unexpected errors - don't leak details in production
  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      stack: err.stack,
    },
    'Unhandled error',
  );

  const isProd = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: isProd ? 'An unexpected error occurred' : err.message,
      ...(!isProd && { stack: err.stack }),
    },
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      code: ErrorCode.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
