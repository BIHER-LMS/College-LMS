import prisma from '../config/database';
import { AuditAction } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Audit logging service.
 *
 * NEVER log raw passwords, Firebase tokens, or PII
 * that isn't necessary for the audit record.
 */
export interface AuditLogInput {
  action: AuditAction;
  actorId?: string;
  subjectId?: string;
  collegeId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId ?? null,
        subjectId: input.subjectId ?? null,
        collegeId: input.collegeId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        metadata: input.metadata ? (input.metadata as any) : undefined,
      },
    });
  } catch (error) {
    // Audit logging should never break the main request flow
    logger.error('Failed to create audit log', {
      action: input.action,
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}

export async function getAuditLogs(
  collegeId: string | null,
  options: { page: number; limit: number; action?: AuditAction },
) {
  const where: Record<string, unknown> = {};

  if (collegeId) {
    where.collegeId = collegeId;
  }
  if (options.action) {
    where.action = options.action;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      include: {
        actor: { select: { id: true, email: true } },
        subject: { select: { id: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
    },
  };
}
