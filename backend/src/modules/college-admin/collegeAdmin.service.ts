import prisma from '../../config/database';
import { AppError } from '../../utils/errors';
import { ErrorCodes } from '../../utils/response';

export async function getCollegeProfile(collegeId: string) {
  const college = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!college) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'College not found');
  }
  return college;
}

export async function updateCollegeProfile(userId: string, collegeId: string, data: Record<string, unknown>) {
  const college = await prisma.college.findUnique({ where: { id: collegeId } });
  if (!college) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, 'College not found');
  }

  return prisma.$transaction(async (tx) => {
    const updatedCollege = await tx.college.update({
      where: { id: collegeId },
      data,
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        action: 'PROFILE_UPDATED',
        actorId: userId,
        collegeId: collegeId,
        metadata: {
          entity: 'College',
          entityId: collegeId,
          fieldsUpdated: Object.keys(data),
        },
      },
    });

    return updatedCollege;
  });
}
