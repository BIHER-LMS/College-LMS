import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { createAuditLog } from './audit.service';

/**
 * User management service (admin operations).
 */

export async function listUsers(
  collegeId: string | null,
  options: { status?: string; role?: string; search?: string; page: number; limit: number },
) {
  const where: Record<string, unknown> = {};

  if (collegeId) {
    where.collegeId = collegeId;
  }
  if (options.status) {
    where.status = options.status;
  }
  if (options.search) {
    where.OR = [
      { email: { contains: options.search, mode: 'insensitive' } },
      { profile: { firstName: { contains: options.search, mode: 'insensitive' } } },
      { profile: { lastName: { contains: options.search, mode: 'insensitive' } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        college: { select: { id: true, name: true, code: true } },
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            department: true,
            designation: true,
            profilePhotoUrl: true,
          },
        },
        userRoles: {
          include: { role: { select: { id: true, name: true, displayName: true } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

export async function getUserById(userId: string, collegeId: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      college: true,
      profile: true,
      userRoles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'User not found');
  }

  // Tenant check
  if (collegeId && user.collegeId !== collegeId) {
    throw new AppError(403, ErrorCodes.TENANT_MISMATCH, 'Access denied');
  }

  return user;
}

export async function updateUserStatus(
  userId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED',
  actorId: string,
  collegeId: string | null,
  ipAddress?: string,
  userAgent?: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'User not found');
  }

  if (collegeId && user.collegeId !== collegeId) {
    throw new AppError(403, ErrorCodes.TENANT_MISMATCH, 'Cannot modify users from another college');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  const actionMap: Record<string, 'ACCOUNT_SUSPENDED' | 'ACCOUNT_DISABLED' | 'ACCOUNT_REACTIVATED'> = {
    SUSPENDED: 'ACCOUNT_SUSPENDED',
    DISABLED: 'ACCOUNT_DISABLED',
    ACTIVE: 'ACCOUNT_REACTIVATED',
  };

  await createAuditLog({
    action: actionMap[status],
    actorId,
    subjectId: userId,
    collegeId: user.collegeId ?? undefined,
    ipAddress,
    userAgent,
    metadata: { previousStatus: user.status, newStatus: status },
  });

  return updated;
}

/**
 * List all roles.
 */
export async function listRoles() {
  return prisma.role.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });
}
