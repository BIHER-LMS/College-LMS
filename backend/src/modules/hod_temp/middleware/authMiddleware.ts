import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { prisma } from '../config/db';
import { verifyFirebaseIdToken } from '../config/firebase';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: string;
  departmentId: string | null;
  collegeId: string | null;
}

export interface HODContext extends AuthenticatedUser {
  departmentId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  hod?: HODContext;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new UnauthorizedError('Authentication token is missing');

    let decodedFirebase;
    try {
      decodedFirebase = await verifyFirebaseIdToken(token);
      if (!decodedFirebase.uid) throw new Error('Missing Firebase UID');
    } catch {
      throw new UnauthorizedError('Invalid or expired Firebase ID token');
    }

    // Email must never be used to remap a verified UID to a different account.
    const authedUser = await prisma.authedUser.findUnique({
      where: { uid: decodedFirebase.uid },
    });
    if (!authedUser) {
      throw new UnauthorizedError('No LMS account associated with this authenticated identity');
    }

    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: decodedFirebase.uid },
      include: { userRoles: { include: { role: true } } },
    });
    const role = authedUser.role?.toUpperCase();
    if (!['ACTIVE', 'APPROVED'].includes(authedUser.approval_status?.toUpperCase() || '') ||
        !role || !authedUser.college_id ||
        (dbUser && (dbUser.status !== 'ACTIVE' || dbUser.collegeId !== authedUser.college_id ||
          dbUser.userRoles.length !== 1 || !dbUser.userRoles[0].role.isActive ||
          dbUser.userRoles[0].role.name !== role))) {
      throw new ForbiddenError('Account is not approved or has an inconsistent assignment');
    }

    req.user = {
      uid: decodedFirebase.uid,
      email: decodedFirebase.email || authedUser.email,
      displayName: authedUser.display_name,
      photoUrl: authedUser.photo_url,
      role,
      departmentId: authedUser.department_id,
      collegeId: authedUser.college_id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireHOD(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const role = (req.user.role || '').toUpperCase();
    if (role !== 'HOD' && role !== 'ADMIN' && role !== 'COLLEGE_ADMIN') {
      throw new ForbiddenError('Access denied: HOD role required');
    }

    if (!req.user.collegeId) {
      throw new ForbiddenError('No college is assigned to this account');
    }

    // Explicit assignment wins. Only an HOD can use the hod_uid association;
    // never infer an assignment from an arbitrary/first department.
    const assignedDepartments = !req.user.departmentId && role === 'HOD'
      ? await prisma.department.findMany({
          where: { hod_uid: req.user.uid, college_id: req.user.collegeId },
          take: 2, // More than one assignment is ambiguous; never pick the first.
        })
      : [];
    const department = req.user.departmentId
      ? await prisma.department.findUnique({ where: { id: req.user.departmentId } })
      : assignedDepartments.length === 1 ? assignedDepartments[0] : null;

    if (!department || department.college_id !== req.user.collegeId || department.is_active === false ||
        (role === 'HOD' && department.hod_uid && department.hod_uid !== req.user.uid)) {
      throw new ForbiddenError('No valid department is assigned to this account');
    }

    req.hod = {
      ...req.user,
      departmentId: department.id,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export const requireHODOrAdmin = [requireAuth, requireHOD];
