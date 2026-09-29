import prisma from '../config/database';
import { AppError } from '../utils/errors';
import { ErrorCodes } from '../utils/response';
import { createAuditLog } from './audit.service';
import crypto from 'crypto';

/**
 * Create a session record for a user.
 *
 * We store a hashed reference of the token — NEVER the full Firebase ID token.
 */
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  idToken?: string,
) {
  // Store only a hash of the token for reference (never the full token)
  const tokenRef = idToken
    ? crypto.createHash('sha256').update(idToken).digest('hex').substring(0, 16)
    : null;

  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      firebaseToken: tokenRef,
      isActive: true,
    },
  });

  await createAuditLog({
    action: 'LOGIN',
    actorId: userId,
    subjectId: userId,
    ipAddress,
    userAgent,
    metadata: { sessionId: session.id },
  });

  return session;
}

/**
 * List active sessions for a user.
 */
export async function listSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId, isActive: true },
    orderBy: { lastActiveAt: 'desc' },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      isActive: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });
}

/**
 * Revoke a session.
 */
export async function revokeSession(
  sessionId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'Session not found');
  }

  // Users can only revoke their own sessions
  if (session.userId !== userId) {
    throw new AppError(403, ErrorCodes.FORBIDDEN, 'Cannot revoke another user\'s session');
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      revokedAt: new Date(),
    },
  });

  await createAuditLog({
    action: 'SESSION_REVOKED',
    actorId: userId,
    subjectId: userId,
    ipAddress,
    userAgent,
    metadata: { sessionId },
  });

  return updated;
}

/**
 * Record a password change event (the actual change happens in Firebase).
 */
export async function recordPasswordChange(
  userId: string,
  ipAddress?: string,
  userAgent?: string,
) {
  await createAuditLog({
    action: 'PASSWORD_CHANGED',
    actorId: userId,
    subjectId: userId,
    ipAddress,
    userAgent,
  });
}
