import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission, requireRole } from '../../middleware/rbac.middleware';
import { requireTenant, getTenantId } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validation.middleware';
import { listUsersQuerySchema } from '../../schemas/user.schema';
import { listUsers, getUserById, updateUserStatus, listRoles } from '../../services/user.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/users
 *
 * List users (tenant-scoped).
 */
router.get(
  '/',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('users:read'),
  validate(listUsersQuerySchema, 'query'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const result = await listUsers(tenantId, req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/users/:id
 *
 * Get a specific user.
 */
router.get(
  '/:id',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('users:read'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const user = await getUserById(req.params.id, tenantId);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /api/users/:id/status
 *
 * Update user account status (suspend, disable, reactivate).
 */
router.patch(
  '/:id/status',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('users:write'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const tenantId = getTenantId(req);
      const result = await updateUserStatus(
        req.params.id,
        status,
        req.user!.id,
        tenantId,
        req.ip,
        req.get('User-Agent'),
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
