import prisma from '../config/database';
import { RoleName } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { UpdateProfileInput } from '../schemas/profile.schema';
import { createAuditLog } from './audit.service';

/**
 * Role-specific required fields for profile completion calculation.
 *
 * The design is a configuration map — not hard-coded logic in controllers.
 * Add new roles or fields here without touching other code.
 */
const ROLE_REQUIRED_FIELDS: Record<RoleName, string[]> = {
  STUDENT: ['firstName', 'lastName', 'department', 'studentId', 'enrollmentYear', 'phone'],
  FACULTY: ['firstName', 'lastName', 'department', 'employeeId', 'designation', 'phone'],
  TRAINER: ['firstName', 'lastName', 'designation', 'phone'],
  HOD: ['firstName', 'lastName', 'department', 'employeeId', 'phone'],
  TPO: ['firstName', 'lastName', 'employeeId', 'designation', 'phone'],
  COLLEGE_ADMIN: ['firstName', 'lastName', 'phone'],
  SUPERINTENDENT: ['firstName', 'lastName', 'phone'],
  SUPER_ADMIN: ['firstName', 'lastName'],
};

/**
 * Calculate profile completion percentage and return missing fields.
 */
export async function calculateProfileCompletion(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user || !user.profile) {
    return { percentage: 0, completed: false, missingFields: [] as string[] };
  }

  // Determine required fields based on the user's primary role
  const primaryRole = user.userRoles[0]?.role.name as RoleName | undefined;
  const requiredFields = primaryRole
    ? ROLE_REQUIRED_FIELDS[primaryRole] ?? ROLE_REQUIRED_FIELDS.STUDENT
    : ROLE_REQUIRED_FIELDS.STUDENT;

  const profile = user.profile as Record<string, unknown>;
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = profile[field];
    if (value === null || value === undefined || value === '') {
      missingFields.push(field);
    }
  }

  const totalFields = requiredFields.length;
  const completedFields = totalFields - missingFields.length;
  const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

  // Persist the percentage
  await prisma.profile.update({
    where: { userId },
    data: { profileCompletionPercentage: percentage },
  });

  return {
    percentage,
    completed: percentage === 100,
    missingFields,
  };
}

/**
 * Update the user's profile.
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileInput,
  actorId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Profile not found');
  }

  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    },
  });

  // Recalculate completion
  const completion = await calculateProfileCompletion(userId);

  // Audit
  await createAuditLog({
    action: 'PROFILE_UPDATED',
    actorId,
    subjectId: userId,
    ipAddress,
    userAgent,
    metadata: { updatedFields: Object.keys(data) },
  });

  return { profile: updated, completion };
}

/**
 * Get profile by user ID.
 */
export async function getProfileByUserId(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          college: { select: { id: true, name: true, code: true } },
          userRoles: {
            include: {
              role: { select: { id: true, name: true, displayName: true } },
            },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Profile not found');
  }

  return profile;
}
