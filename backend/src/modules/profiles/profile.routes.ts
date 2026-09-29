import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { requireTenant, getTenantId } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateProfileSchema } from '../../schemas/profile.schema';
import { updateProfile, getProfileByUserId, calculateProfileCompletion } from '../../services/profile.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/profiles/me
 *
 * Get the current user's profile.
 */
router.get(
  '/me',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await getProfileByUserId(req.user!.id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/profiles/me
 *
 * Update the current user's profile.
 */
router.put(
  '/me',
  authenticateFirebaseUser,
  requireUser,
  validate(updateProfileSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await updateProfile(
        req.user!.id,
        req.body,
        req.user!.id,
        req.ip,
        req.get('User-Agent'),
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/profiles/me/completion
 *
 * Get profile completion status.
 */
router.get(
  '/me/completion',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const completion = await calculateProfileCompletion(req.user!.id);
      sendSuccess(res, completion);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/profiles/:userId
 *
 * View another user's profile (requires permission + tenant).
 */
router.get(
  '/:userId',
  authenticateFirebaseUser,
  requireUser,
  requireTenant(),
  requirePermission('profiles:read'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const profile = await getProfileByUserId(req.params.userId);

      // Additional tenant check on the target profile
      const tenantId = getTenantId(req);
      if (tenantId && profile.user.college && profile.user.college.id !== tenantId) {
        return sendSuccess(res, null);
      }

      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
