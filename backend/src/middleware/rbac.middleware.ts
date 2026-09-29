import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';

/**
 * Role-based access middleware.
 *
 * Usage:
 *   router.get('/admin/users', requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), handler)
 *
 * Checks if the authenticated user has AT LEAST ONE of the specified roles.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
    }

    const userRoleNames = req.user.roles.map((r) => r.name);
    const hasRole = allowedRoles.some((role) => userRoleNames.includes(role));

    if (!hasRole) {
      return next(
        new AppError(403, ErrorCodes.INSUFFICIENT_ROLE, 'You do not have the required role for this action'),
      );
    }

    next();
  };
}

/**
 * Permission-based access middleware.
 *
 * Usage:
 *   router.post('/approvals/:id/review', requirePermission('approvals:manage'), handler)
 *
 * Checks if the authenticated user has AT LEAST ONE of the specified permissions
 * through any of their roles.
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
    }

    const userPermissions = new Set(
      req.user.roles.flatMap((r) => r.permissions),
    );

    const hasPermission = requiredPermissions.some((p) => userPermissions.has(p));

    if (!hasPermission) {
      return next(
        new AppError(
          403,
          ErrorCodes.INSUFFICIENT_PERMISSION,
          'You do not have the required permission for this action',
        ),
      );
    }

    next();
  };
}
