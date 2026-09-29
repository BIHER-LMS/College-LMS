import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError, ErrorCodes } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Centralized error handling middleware.
 *
 * MUST be the LAST middleware registered on the Express app.
 *
 * - Converts AppError into structured API responses
 * - Catches unexpected errors and returns 500
 * - Never exposes stack traces in production
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors (expected — validation, auth, etc.)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { code: err.code, stack: err.stack });
    } else {
      logger.warn(err.message, { code: err.code });
    }

    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Unexpected / programming errors
  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  sendError(
    res,
    500,
    ErrorCodes.INTERNAL_ERROR,
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  );
}

/**
 * 404 catch-all — registered before the error handler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, ErrorCodes.NOT_FOUND, `Route ${req.method} ${req.path} not found`));
}
