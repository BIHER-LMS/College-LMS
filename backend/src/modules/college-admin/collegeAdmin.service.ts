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

export async function createDepartment(collegeId: string, data: { name: string, code: string, hod_uid?: string | null, is_active?: boolean }) {
  const existingName = await prisma.department.findFirst({
    where: { college_id: collegeId, name: data.name }
  });
  if (existingName) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, 'Department name already exists in this college');
  }

  const existingCode = await prisma.department.findFirst({
    where: { college_id: collegeId, code: data.code }
  });
  if (existingCode) {
    throw new AppError(409, ErrorCodes.VALIDATION_ERROR, 'Department code already exists in this college');
  }

  if (data.hod_uid) {
    const hod = await prisma.authedUser.findFirst({
      where: { uid: data.hod_uid, college_id: collegeId, role: 'HOD' }
    });
    if (!hod) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Selected HOD is invalid or does not belong to this college');
    }
  }

  return prisma.$transaction(async (tx) => {
    const department = await tx.department.create({
      data: {
        college_id: collegeId,
        name: data.name,
        code: data.code,
        hod_uid: data.hod_uid || null,
        is_active: data.is_active ?? true
      }
    });

    if (data.hod_uid) {
      await tx.authedUser.update({
        where: { uid: data.hod_uid },
        data: { department_id: department.id }
      });
    }

    return department;
  });
}
