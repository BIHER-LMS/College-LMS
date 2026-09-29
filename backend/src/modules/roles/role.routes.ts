import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { requireTenant, getTenantId } from '../../middleware/tenant.middleware';
import { listRoles } from '../../services/user.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/roles
 *
 * List all available roles with their permissions.
 */
router.get(
  '/',
  authenticateFirebaseUser,
  requireUser,
  requirePermission('roles:read'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const roles = await listRoles();
      sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
