import { Router, Response, NextFunction } from 'express';
import { authenticateFirebaseUser, requireUser, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { onboardingSchema } from '../../schemas/auth.schema';
import { onboardUser, getCurrentUser } from '../../services/auth.service';
import { createSession, revokeSession, recordPasswordChange } from '../../services/session.service';
import { createAuditLog } from '../../services/audit.service';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../utils/errors';
import { ErrorCodes } from '../../utils/response';
import prisma from '../../config/database';

const router = Router();

/**
 * POST /api/auth/onboarding
 *
 * Application-level registration after Firebase authentication.
 * Creates the LMS user, profile, role assignment, and approval request.
 */
router.post(
  '/onboarding',
  authenticateFirebaseUser,
  validate(onboardingSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.firebaseUid) {
        throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Firebase authentication required');
      }

      // Get email from Firebase token (already verified)
      const firebaseUser = await (await import('../../config/firebase')).firebaseAuth.getUser(req.firebaseUid);

      const result = await onboardUser({
        firebaseUid: req.firebaseUid,
        email: firebaseUser.email || req.body.email,
        collegeId: req.body.collegeId,
        requestedRole: req.body.requestedRole,
        phone: req.body.phone,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/auth/me
 *
 * Get the current authenticated user's full profile.
 */
router.get(
  '/me',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await getCurrentUser(req.user!.id);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/logout
 *
 * Records a logout event. Optionally revokes a specific session.
 */
router.post(
  '/logout',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.body;

      if (sessionId) {
        await revokeSession(sessionId, req.user!.id, req.ip, req.get('User-Agent'));
      }

      await createAuditLog({
        action: 'LOGOUT',
        actorId: req.user!.id,
        subjectId: req.user!.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/refresh
 *
 * Records a token refresh event and creates/updates a session.
 * Actual token refresh happens on Firebase client side.
 */
router.post(
  '/refresh',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const session = await createSession(
        req.user!.id,
        req.ip,
        req.get('User-Agent'),
      );

      sendSuccess(res, { sessionId: session.id });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/password-changed
 *
 * Records a password change event (actual change happens in Firebase).
 */
router.post(
  '/password-changed',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await recordPasswordChange(req.user!.id, req.ip, req.get('User-Agent'));
      sendSuccess(res, { message: 'Password change recorded' });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/auth/sessions
 *
 * List the current user's active sessions.
 */
router.get(
  '/sessions',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { listSessions } = await import('../../services/session.service');
      const sessions = await listSessions(req.user!.id);
      sendSuccess(res, sessions);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /api/auth/sessions/:id
 *
 * Revoke a specific session.
 */
router.delete(
  '/sessions/:id',
  authenticateFirebaseUser,
  requireUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await revokeSession(
        req.params.id,
        req.user!.id,
        req.ip,
        req.get('User-Agent'),
      );
      sendSuccess(res, { message: 'Session revoked' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
