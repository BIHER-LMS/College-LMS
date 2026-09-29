import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Extended Express Request carrying the authenticated LMS user.
 */
export interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
    phone: string | null;
    collegeId: string | null;
    status: string;
    roles: Array<{
      id: string;
      name: string;
      permissions: string[];
    }>;
  };
}

/**
 * Firebase token verification middleware.
 *
 * 1. Read Authorization header (Bearer token)
 * 2. Verify with Firebase Admin SDK
 * 3. Find or FAIL mapping to LMS user
 * 4. Load user roles + permissions
 * 5. Attach to request
 *
 * NEVER trust req.body.userId — identity comes from verified token.
 */
export async function authenticateFirebaseUser(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing or invalid Authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Missing Firebase ID token');
    }

    // Verify with Firebase Admin SDK
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(idToken);
    } catch (firebaseError: unknown) {
      const message = firebaseError instanceof Error ? firebaseError.message : 'Token verification failed';
      logger.warn('Firebase token verification failed', { error: message });
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid or expired Firebase token');
    }

    const firebaseUid = decodedToken.uid;
    req.firebaseUid = firebaseUid;

    // Find LMS user
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      // User has a Firebase account but hasn't onboarded yet
      // This is OK for the onboarding endpoint, so we just
      // set firebaseUid and move on.
      return next();
    }

    // Check account status
    switch (user.status) {
      case 'PENDING':
        throw new AppError(403, ErrorCodes.ACCOUNT_PENDING, 'Account is pending approval');
      case 'REJECTED':
        throw new AppError(403, ErrorCodes.ACCOUNT_REJECTED, 'Account has been rejected');
      case 'SUSPENDED':
        throw new AppError(403, ErrorCodes.ACCOUNT_SUSPENDED, 'Account is suspended');
      case 'DISABLED':
        throw new AppError(403, ErrorCodes.ACCOUNT_DISABLED, 'Account is disabled');
    }

    // Build roles array with permissions
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions.map((rp) => rp.permission.name),
    }));

    req.user = {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      collegeId: user.collegeId,
      status: user.status,
      roles,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware that REQUIRES a fully onboarded LMS user.
 * Use after authenticateFirebaseUser for endpoints that need
 * a database user (i.e. everything except /onboarding).
 */
export function requireUser(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    return next(
      new AppError(403, ErrorCodes.FORBIDDEN, 'User has not completed onboarding'),
    );
  }
  next();
}
