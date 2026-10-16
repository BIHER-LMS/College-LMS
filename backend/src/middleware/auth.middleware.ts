import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { logger } from '../utils/logger';
import { memoryCache } from '../lib/cache';

/**
 * Extended Express Request carrying the authenticated LMS user.
 */
export interface AuthenticatedRequest extends Request {
  firebaseUid?: string;
  verifiedEmail?: string;
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
  res: Response,
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
    req.verifiedEmail = decodedToken.email?.trim().toLowerCase();

    // Check bounded in-memory cache for user context
    const cacheKey = `auth_user:${firebaseUid}`;
    let user = memoryCache.get<any>(cacheKey);

    if (!user) {
      // Find LMS user in DB
      user = await prisma.user.findUnique({
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
      // Auto-provision if user exists in authed_users with an assigned role
      const authed = await prisma.authedUser.findUnique({
        where: { uid: firebaseUid },
      });
      if (authed) {
        (req as any).authedUser = authed;
      }
      if (authed && authed.role && authed.role !== 'USER') {
        const matchingRole = prisma.role?.findFirst
          ? await prisma.role.findFirst({
              where: { name: authed.role as any },
              include: { permissions: { include: { permission: true } } },
            })
          : null;

        const legacyUser = prisma.user?.upsert
          ? await prisma.user.upsert({
              where: { firebaseUid },
              create: {
                firebaseUid,
                email: authed.email,
                phone: authed.phone,
                collegeId: authed.college_id,
                status: authed.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING',
              },
              update: {
                email: authed.email,
                phone: authed.phone,
                collegeId: authed.college_id,
                status: authed.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING',
              },
            })
          : null;

        if (matchingRole && legacyUser && prisma.userRole?.upsert) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: legacyUser.id,
                roleId: matchingRole.id,
              },
            },
            create: {
              userId: legacyUser.id,
              roleId: matchingRole.id,
            },
            update: {},
          });
        }

        if (prisma.user?.findUnique) {
          user = await prisma.user.findUnique({
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
        }

        if (!user && authed) {
          user = {
            id: authed.uid,
            firebaseUid: authed.uid,
            email: authed.email,
            phone: authed.phone,
            collegeId: authed.college_id,
            status: authed.approval_status === 'APPROVED' ? 'ACTIVE' : 'PENDING',
            userRoles: [
              {
                role: {
                  name: authed.role,
                  permissions: [],
                },
              },
            ],
          } as any;
        }
      }
    }

      if (user) {
        memoryCache.set(cacheKey, user, 45);
      }
    }

    if (!user) {
      // User has a Firebase account but hasn't onboarded yet
      // This is OK for the onboarding endpoint, so we just
      // set firebaseUid and move on.
      return next();
    }

    const isAuthRoute =
      req.path === '/sync' ||
      req.path === '/onboarding';

    if (!isAuthRoute) {
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
    }

    // Build roles array with permissions
    const roles = user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      permissions: ur.role.permissions.map((rp: any) => rp.permission.name),
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

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
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
