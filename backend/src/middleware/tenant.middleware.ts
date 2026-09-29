import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';

/**
 * Tenant isolation middleware.
 *
 * Ensures the authenticated user can only access resources
 * belonging to their college/tenant.
 *
 * SUPER_ADMIN users bypass tenant checks (they manage all tenants).
 *
 * Usage:
 *   router.get('/users', requireTenant(), handler)
 *
 * For endpoints with :collegeId param:
 *   router.get('/colleges/:collegeId/users', requireTenant('collegeId'), handler)
 */
export function requireTenant(paramName?: string) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
    }

    // SUPER_ADMIN can access any tenant
    const isSuperAdmin = req.user.roles.some((r) => r.name === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      return next();
    }

    // User must belong to a college
    if (!req.user.collegeId) {
      return next(
        new AppError(403, ErrorCodes.TENANT_MISMATCH, 'User is not associated with any college'),
      );
    }

    // If a specific college param is provided, verify match
    if (paramName) {
      const requestedCollegeId = req.params[paramName];
      if (requestedCollegeId && requestedCollegeId !== req.user.collegeId) {
        return next(
          new AppError(403, ErrorCodes.TENANT_MISMATCH, 'You cannot access resources from another college'),
        );
      }
    }

    next();
  };
}

/**
 * Helper to get the tenant (college) ID for the current request.
 * Returns the user's college ID, or the param if SUPER_ADMIN
 * explicitly specifies one.
 */
export function getTenantId(req: AuthenticatedRequest, paramName?: string): string | null {
  if (!req.user) return null;

  const isSuperAdmin = req.user.roles.some((r) => r.name === 'SUPER_ADMIN');

  if (isSuperAdmin && paramName && req.params[paramName]) {
    return req.params[paramName];
  }

  return req.user.collegeId;
}
