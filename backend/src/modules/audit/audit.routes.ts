import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { requireTenant, getTenantId } from '../../middleware/tenant.middleware';
import { getAuditLogs } from '../../services/audit.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/audit
 *
 * List audit logs (tenant-scoped).
 */
router.get(
  '/',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('audit:read'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const action = req.query.action as string | undefined;

      const result = await getAuditLogs(tenantId, {
        page,
        limit,
        action: action as any,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
