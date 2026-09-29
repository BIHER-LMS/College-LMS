import { Router, Request, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission, requireRole } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createCollegeSchema, updateCollegeSchema } from '../../schemas/college.schema';
import { listColleges, getCollegeById, createCollege, updateCollege } from '../../services/college.service';
import { sendSuccess } from '../../utils/response';

const router = Router();

/**
 * GET /api/colleges
 *
 * List all active colleges.
 * Public endpoint (needed for onboarding college selection).
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await listColleges({ page, limit });
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/colleges/:id
 *
 * Get a specific college.
 */
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const college = await getCollegeById(req.params.id);
      sendSuccess(res, college);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/colleges
 *
 * Create a new college (Super Admin only).
 */
router.post(
  '/',
  authenticateFirebaseUser,
  requireUser,
  requireRole('SUPER_ADMIN'),
  requirePermission('colleges:write'),
  validate(createCollegeSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const college = await createCollege(req.body);
      sendSuccess(res, college, 201);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PUT /api/colleges/:id
 *
 * Update a college (Super Admin only).
 */
router.put(
  '/:id',
  authenticateFirebaseUser,
  requireUser,
  requireRole('SUPER_ADMIN'),
  requirePermission('colleges:write'),
  validate(updateCollegeSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const college = await updateCollege(req.params.id, req.body);
      sendSuccess(res, college);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
