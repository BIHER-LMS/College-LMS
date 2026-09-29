import prisma from '../config/database';
import { ApprovalStatus } from '@prisma/client';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { createAuditLog } from './audit.service';

/**
 * List approval requests scoped to a tenant.
 */
export async function listApprovals(
  collegeId: string | null,
  options: { status?: ApprovalStatus; page: number; limit: number },
) {
  const where: Record<string, unknown> = {};

  if (collegeId) {
    where.requestedCollege = collegeId;
  }
  if (options.status) {
    where.status = options.status;
  }

  const [approvals, total] = await Promise.all([
    prisma.accountApproval.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      include: {
        user: {
          select: { id: true, email: true, phone: true, status: true },
        },
        college: {
          select: { id: true, name: true, code: true },
        },
      },
    }),
    prisma.accountApproval.count({ where }),
  ]);

  return {
    approvals,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}

/**
 * Get a single approval request.
 */
export async function getApproval(approvalId: string, collegeId: string | null) {
  const approval = await prisma.accountApproval.findUnique({
    where: { id: approvalId },
    include: {
      user: {
        select: { id: true, email: true, phone: true, status: true },
        include: {
          profile: true,
        },
      } as any,
      college: { select: { id: true, name: true, code: true } },
    },
  });

  if (!approval) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Approval request not found');
  }

  // Tenant check
  if (collegeId && approval.requestedCollege !== collegeId) {
    throw new AppError(403, ErrorCodes.TENANT_MISMATCH, 'Access denied');
  }

  return approval;
}

/**
 * Review (approve or reject) an account approval request.
 */
export async function reviewApproval(
  approvalId: string,
  reviewerId: string,
  reviewerCollegeId: string | null,
  data: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string; notes?: string },
  ipAddress?: string,
  userAgent?: string,
) {
  const approval = await prisma.accountApproval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Approval request not found');
  }

  // Tenant check
  if (reviewerCollegeId && approval.requestedCollege !== reviewerCollegeId) {
    throw new AppError(403, ErrorCodes.TENANT_MISMATCH, 'Cannot review approvals from another college');
  }

  if (approval.status !== 'PENDING') {
    throw new AppError(409, ErrorCodes.CONFLICT, `Approval has already been ${approval.status.toLowerCase()}`);
  }

  // Perform review in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update approval
    const updated = await tx.accountApproval.update({
      where: { id: approvalId },
      data: {
        status: data.status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectionReason: data.rejectionReason ?? null,
        notes: data.notes ?? null,
      },
    });

    // Update user status
    if (data.status === 'APPROVED') {
      await tx.user.update({
        where: { id: approval.userId },
        data: { status: 'ACTIVE' },
      });
    } else {
      await tx.user.update({
        where: { id: approval.userId },
        data: { status: 'REJECTED' },
      });
    }

    return updated;
  });

  // Audit log
  const auditAction = data.status === 'APPROVED' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_REJECTED';
  await createAuditLog({
    action: auditAction,
    actorId: reviewerId,
    subjectId: approval.userId,
    collegeId: approval.requestedCollege,
    ipAddress,
    userAgent,
    metadata: {
      approvalId,
      requestedRole: approval.requestedRole,
      rejectionReason: data.rejectionReason,
    },
  });

  return result;
}
