import prisma from '../config/database';
import { RoleName } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { createAuditLog } from './audit.service';
import { calculateProfileCompletion } from './profile.service';

/**
 * Roles that allow self-registration (the user picks the role during onboarding).
 * Privileged roles CANNOT be self-assigned.
 */
const SELF_REGISTRABLE_ROLES: RoleName[] = [
  'STUDENT',
  'FACULTY',
  'TRAINER',
  'HOD',
  'TPO',
  'COLLEGE_ADMIN',
];

/**
 * Roles that require approval before the account becomes ACTIVE.
 * Students may be auto-approved based on college policy.
 */
const ROLES_REQUIRING_APPROVAL: RoleName[] = [
  'FACULTY',
  'TRAINER',
  'HOD',
  'TPO',
  'COLLEGE_ADMIN',
];

export interface OnboardingData {
  firebaseUid: string;
  email: string;
  collegeId: string;
  requestedRole: RoleName;
  phone?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Onboard a new user after Firebase authentication.
 */
export async function onboardUser(data: OnboardingData) {
  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { firebaseUid: data.firebaseUid },
  });
  if (existingUser) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'User has already been onboarded');
  }

  // Also check email uniqueness
  const emailExists = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (emailExists) {
    throw new AppError(409, ErrorCodes.CONFLICT, 'Email is already associated with another account');
  }

  // 2. Validate college
  const college = await prisma.college.findUnique({
    where: { id: data.collegeId },
  });
  if (!college || !college.isActive) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid or inactive college');
  }

  // 3. Validate role
  if (!SELF_REGISTRABLE_ROLES.includes(data.requestedRole)) {
    throw new AppError(
      403,
      ErrorCodes.FORBIDDEN,
      `Role ${data.requestedRole} cannot be self-assigned`,
    );
  }

  const role = await prisma.role.findUnique({
    where: { name: data.requestedRole },
  });
  if (!role || !role.isActive) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Invalid or inactive role');
  }

  // 4. Determine account status
  const requiresApproval = ROLES_REQUIRING_APPROVAL.includes(data.requestedRole);
  const accountStatus = requiresApproval ? 'PENDING' : 'ACTIVE';

  // 5. Create user + profile + role assignment + approval (if needed)
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firebaseUid: data.firebaseUid,
        email: data.email,
        phone: data.phone ?? null,
        collegeId: data.collegeId,
        status: accountStatus,
      },
    });

    // Create profile
    await tx.profile.create({
      data: {
        userId: newUser.id,
        profileCompletionPercentage: 0,
      },
    });

    // Assign role
    await tx.userRole.create({
      data: {
        userId: newUser.id,
        roleId: role.id,
      },
    });

    // Create approval request if needed
    if (requiresApproval) {
      await tx.accountApproval.create({
        data: {
          userId: newUser.id,
          requestedRole: data.requestedRole,
          requestedCollege: data.collegeId,
          status: 'PENDING',
        },
      });
    }

    return newUser;
  });

  // 6. Audit log (outside transaction — should not break onboarding)
  await createAuditLog({
    action: 'ACCOUNT_CREATED',
    subjectId: user.id,
    collegeId: data.collegeId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    metadata: {
      requestedRole: data.requestedRole,
      requiresApproval,
      accountStatus,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      status: user.status,
      collegeId: user.collegeId,
    },
    requiresApproval,
  };
}

/**
 * Get the current user's full profile for GET /api/auth/me.
 */
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      college: { select: { id: true, name: true, code: true } },
      profile: true,
      userRoles: {
        include: {
          role: {
            select: { id: true, name: true, displayName: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'User not found');
  }

  // Calculate profile completion
  const completion = await calculateProfileCompletion(userId);

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    status: user.status,
    college: user.college,
    profile: user.profile,
    roles: user.userRoles.map((ur) => ur.role),
    profileCompletion: completion,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
