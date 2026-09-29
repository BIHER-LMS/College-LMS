import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError, ErrorCodes } from '../utils/response';

/**
 * Generic Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/onboarding', validate(onboardingSchema), controller)
 *   router.get('/users', validate(listUsersQuerySchema, 'query'), controller)
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed (and potentially transformed) data
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', details);
        return;
      }
      next(error);
    }
  };
}
