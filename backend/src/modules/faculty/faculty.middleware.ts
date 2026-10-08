import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../../config/firebase';
import prisma from '../../config/database';
import { AuthenticatedUserContext } from './faculty.types';

declare global {
  namespace Express {
    interface Request {
      facultyUser?: AuthenticatedUserContext;
    }
  }
}

export async function facultyAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Firebase ID token required' });
      return;
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(token);
      if (!decodedToken.uid) throw new Error('Missing Firebase UID');
    } catch {
      res.status(401).json({ error: 'Unauthorized: Invalid Firebase ID token' });
      return;
    }

    const authedUser = await prisma.authedUser.findUnique({
      where: { uid: decodedToken.uid },
      include: { department: true },
    });
    if (!authedUser) {
      res.status(401).json({ error: 'Unauthorized: User not registered in database' });
      return;
    }

    // Both account systems may coexist. Neither may override a disabled or
    // conflicting assignment in the other system.
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { userRoles: { include: { role: true } } },
    });
    const role = authedUser.role?.toUpperCase();
    if (!['ACTIVE', 'APPROVED'].includes(authedUser.approval_status?.toUpperCase() || '') ||
        !role || !authedUser.college_id || !authedUser.department_id ||
        !authedUser.department || authedUser.department.college_id !== authedUser.college_id ||
        authedUser.department.is_active === false ||
        (dbUser && (dbUser.status !== 'ACTIVE' || dbUser.collegeId !== authedUser.college_id ||
          dbUser.userRoles.length !== 1 || !dbUser.userRoles[0].role.isActive ||
          dbUser.userRoles[0].role.name !== role))) {
      res.status(403).json({ error: 'Forbidden: Account is not approved or has an inconsistent assignment' });
      return;
    }

    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email || authedUser.email,
      role,
      department_id: authedUser.department_id,
      college_id: authedUser.college_id,
      display_name: authedUser.display_name,
      photo_url: authedUser.photo_url,
    };
    req.facultyUser = (req as any).user;

    next();
  } catch (error) {
    console.error('Faculty Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}

export function requireFaculty(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user || (req as any).facultyUser;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  const role = (user.role || '').toUpperCase();
  const allowed = ['FACULTY', 'HOD', 'ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];

  if (!allowed.includes(role)) {
    res.status(403).json({ error: 'Forbidden: Access restricted to Faculty and authorized academic staff' });
    return;
  }

  next();
}
