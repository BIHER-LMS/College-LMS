import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { requireTenant, getTenantId } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validation.middleware';
import { reviewApprovalSchema, listApprovalsQuerySchema } from '../../schemas/approval.schema';
import { listApprovals, getApproval, reviewApproval } from '../../services/approval.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/approvals
 *
 * List approval requests (tenant-scoped).
 */
router.get(
  '/',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('approvals:read'),
  validate(listApprovalsQuerySchema, 'query'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const result = await listApprovals(tenantId, req.query as any);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/approvals/:id
 *
 * Get a specific approval request.
 */
router.get(
  '/:id',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('approvals:read'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const approval = await getApproval(req.params.id, tenantId);
      sendSuccess(res, approval);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/approvals/:id/review
 *
 * Approve or reject an account.
 */
router.post(
  '/:id/review',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('approvals:manage'),
  validate(reviewApprovalSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const result = await reviewApproval(
        req.params.id,
        req.user!.id,
        tenantId,
        req.body,
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
