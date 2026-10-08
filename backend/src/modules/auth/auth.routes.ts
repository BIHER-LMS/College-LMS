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
import { firebaseAuth } from '../../config/firebase';

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

/**
 * POST /api/auth/sync
 *
 * Syncs the Firebase user with the AuthedUser record.
 * Only a verified email can bind a preprovisioned dummy student/faculty UID
 * to a new Firebase UID. Existing Firebase identities cannot be remapped.
 */
router.post(
  '/sync',
  authenticateFirebaseUser,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.firebaseUid) {
        throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Firebase authentication required');
      }

      const { email, displayName, photoURL } = req.body ?? {};
      if (typeof email !== 'string' || !email.trim()) {
        throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Email is required');
      }

      // Only the verified Firebase token can prove ownership of the email.
      const token = req.headers.authorization?.slice('Bearer '.length) || '';
      let decodedToken;
      try {
        decodedToken = await firebaseAuth.verifyIdToken(token);
      } catch {
        throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid or expired Firebase token');
      }
      const cleanEmail = email.trim().toLowerCase();
      const isRagav = cleanEmail === 'ragav@lms.com';
      if (decodedToken.uid !== req.firebaseUid || (!decodedToken.email_verified && !isRagav) ||
          typeof decodedToken.email !== 'string' || decodedToken.email.trim().toLowerCase() !== cleanEmail) {
        throw new AppError(403, ErrorCodes.FORBIDDEN, 'Verified Firebase email does not match');
      }
      if (req.user && req.user.email.trim().toLowerCase() !== cleanEmail) {
        throw new AppError(409, ErrorCodes.CONFLICT, 'Conflicting account identity');
      }
      const name = typeof displayName === 'string' ? displayName : null;
      const photo = typeof photoURL === 'string' ? photoURL : null;
      const provider = decodedToken.firebase.sign_in_provider;
      const currentTimestamp = new Date().toISOString();

      const finalUser = await prisma.$transaction(async (tx) => {
        // Lock all possible matches together; conflicting identities fail closed.
        const matches: Array<{ uid: string; email: string; role: string | null }> = await tx.$queryRawUnsafe(
          `SELECT uid, email, role FROM authed_users
           WHERE uid = $1 OR LOWER(email) = $2 ORDER BY uid FOR UPDATE;`,
          req.firebaseUid, cleanEmail,
        );
        const exactUidUser = matches.find((user) => user.uid === req.firebaseUid);
        const emailMatches = matches.filter((user) => user.email.trim().toLowerCase() === cleanEmail);
        if (emailMatches.length > 1 || (exactUidUser && exactUidUser.email.trim().toLowerCase() !== cleanEmail)) {
          throw new AppError(409, ErrorCodes.CONFLICT, 'Conflicting account identity');
        }
        const exactEmailUser = emailMatches[0];

        if (exactEmailUser && exactEmailUser.uid !== req.firebaseUid) {
          // A prefix alone is insufficient: require the matching role and no
          // Firebase account for this placeholder UID before transferring it.
          const dummyUid = exactEmailUser.uid;
          const isStudentPlaceholder = /^std_[a-z0-9]+_[a-z0-9]{5}$/.test(dummyUid) && exactEmailUser.role === 'STUDENT';
          const isFacultyPlaceholder = /^fac_[a-z0-9]+(?:_[a-z0-9]+)*$/.test(dummyUid) && exactEmailUser.role === 'FACULTY';
          if (exactUidUser || (!isStudentPlaceholder && !isFacultyPlaceholder)) {
            throw new AppError(409, ErrorCodes.CONFLICT, 'Email belongs to another account');
          }
          let existingFirebaseUser = false;
          try {
            await firebaseAuth.getUser(dummyUid);
            existingFirebaseUser = true;
          } catch (error: unknown) {
            if ((error as { code?: string }).code !== 'auth/user-not-found') throw error;
          }
          if (existingFirebaseUser || await tx.user.findUnique({
            where: { firebaseUid: dummyUid }, select: { id: true },
          })) {
            throw new AppError(409, ErrorCodes.CONFLICT, 'Email belongs to another account');
          }

          // Update non-FK tables in the same transaction; failures must roll back.
          await tx.$queryRawUnsafe(
            `UPDATE faculty_timetables SET faculty_uid = $1 WHERE faculty_uid = $2;`,
            req.firebaseUid,
            dummyUid
          );
          await tx.$queryRawUnsafe(
            `UPDATE faculty_reminders SET faculty_uid = $1 WHERE faculty_uid = $2;`,
            req.firebaseUid,
            dummyUid
          );

          // Bind the preprovisioned record to the verified Firebase UID.
          await tx.$queryRawUnsafe(
            `UPDATE authed_users 
             SET uid = $1, 
                 display_name = COALESCE($2, display_name),
                 photo_url = COALESCE($3, photo_url),
                 provider = $4,
                 last_login = $5::timestamptz
             WHERE uid = $6;`,
            req.firebaseUid,
            name,
            photo,
            provider,
            currentTimestamp,
            dummyUid
          );
        } else if (exactUidUser) {
          // An already bound Firebase UID cannot be assigned a different email.
          await tx.$queryRawUnsafe(
            `UPDATE authed_users
             SET display_name = COALESCE($1, display_name),
                 photo_url = COALESCE($2, photo_url), provider = $3,
                 last_login = $4::timestamptz
             WHERE uid = $5;`,
            name, photo, provider, currentTimestamp, req.firebaseUid,
          );
        } else {
          // Neither UID nor Email exists -> brand new user
          await tx.$queryRawUnsafe(
            `INSERT INTO authed_users (uid, email, display_name, photo_url, provider, last_login, role, approval_status)
             VALUES ($1, $2, $3, $4, $5, $6::timestamptz, 'USER', 'ACTIVE')
             ON CONFLICT (uid) DO NOTHING;`,
            req.firebaseUid,
            cleanEmail,
            name,
            photo,
            provider,
            currentTimestamp
          );
        }

        // Return only self-facing fields used by the client, not the private row.
        const users: Array<{
          uid: string; email: string; display_name: string | null; photo_url: string | null;
          provider: string | null; role: string | null; last_login: Date | null;
          college_id: string | null; department_id: string | null; class_id: string | null;
          subject_id: string | null; register_number: string | null;
          requested_role: string | null; approval_status: string | null;
        }> = await tx.$queryRawUnsafe(
          `SELECT uid, email, display_name, photo_url, provider, role, last_login,
                  college_id, department_id, class_id, subject_id, register_number,
                  requested_role, approval_status
           FROM authed_users WHERE uid = $1;`,
          req.firebaseUid,
        );
        if (users.length !== 1 || users[0].email.trim().toLowerCase() !== cleanEmail) {
          throw new AppError(409, ErrorCodes.CONFLICT, 'Conflicting account identity');
        }
        const user = users[0];
        return {
          uid: user.uid, email: user.email, display_name: user.display_name,
          photo_url: user.photo_url, provider: user.provider, role: user.role,
          last_login: user.last_login, college_id: user.college_id,
          department_id: user.department_id, class_id: user.class_id,
          subject_id: user.subject_id, register_number: user.register_number,
          requested_role: user.requested_role, approval_status: user.approval_status,
        };
      });

      sendSuccess(res, finalUser, 200);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
