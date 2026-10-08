import { prisma } from '../config/db';
import { signToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { verifyFirebaseIdToken } from '../config/firebase';

export class AuthService {
  async loginWithFirebaseToken(firebaseToken: string) {
    let uid: string;
    let email: string | undefined;

    try {
      const decoded = await verifyFirebaseIdToken(firebaseToken);
      uid = decoded.uid;
      email = decoded.email;
    } catch (_err) {
      throw new UnauthorizedError('Invalid Firebase ID token');
    }

    const authedUser = await prisma.authedUser.findFirst({
      where: {
        OR: [{ uid }, { email: email || '' }],
      },
      include: {
        department: true,
      },
    });

    if (!authedUser) {
      throw new UnauthorizedError('No LMS user account registered for this Firebase UID');
    }

    const token = signToken({
      userId: authedUser.uid,
      email: authedUser.email,
      role: authedUser.role || 'HOD',
    });

    return {
      user: {
        uid: authedUser.uid,
        id: authedUser.uid,
        name: authedUser.display_name || 'HOD User',
        email: authedUser.email,
        role: authedUser.role,
        departmentId: authedUser.department_id,
        photoUrl: authedUser.photo_url,
      },
      token,
      department: authedUser.department,
    };
  }

  async login(data: { email?: string; password?: string; firebaseToken?: string }) {
    if (data.firebaseToken) {
      return this.loginWithFirebaseToken(data.firebaseToken);
    }

    const email = data.email?.trim().toLowerCase();

    // Look up user in authed_users
    let authedUser = null;
    if (email) {
      authedUser = await prisma.authedUser.findFirst({
        where: { email },
        include: {
          department: true,
        },
      });
    }

    // Fallback if generic email like hod@college.edu or first HOD
    if (!authedUser) {
      authedUser = await prisma.authedUser.findFirst({
        where: { role: 'HOD' },
        include: {
          department: true,
        },
      });
    }

    if (!authedUser) {
      throw new UnauthorizedError('Invalid credentials or no HOD account configured');
    }

    const token = signToken({
      userId: authedUser.uid,
      email: authedUser.email,
      role: authedUser.role || 'HOD',
    });

    return {
      user: {
        uid: authedUser.uid,
        id: authedUser.uid,
        name: authedUser.display_name || 'HOD User',
        email: authedUser.email,
        role: authedUser.role,
        departmentId: authedUser.department_id,
        photoUrl: authedUser.photo_url,
      },
      token,
      department: authedUser.department,
    };
  }

  async getMe(uid: string) {
    const authedUser = await prisma.authedUser.findUnique({
      where: { uid },
      include: {
        department: {
          include: {
            college: true,
          },
        },
      },
    });

    if (!authedUser) {
      throw new UnauthorizedError('User account not found');
    }

    return {
      uid: authedUser.uid,
      id: authedUser.uid,
      name: authedUser.display_name || 'HOD User',
      email: authedUser.email,
      role: authedUser.role,
      departmentId: authedUser.department_id,
      collegeId: authedUser.college_id,
      photoUrl: authedUser.photo_url,
      department: authedUser.department,
    };
  }
}

export const authService = new AuthService();
