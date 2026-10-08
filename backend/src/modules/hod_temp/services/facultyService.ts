import { prisma } from '../config/db';
import type { HODContext } from '../middleware/authMiddleware';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { PaginationMeta } from '../utils/response';

export class FacultyService {
  // A department ID supplied in a query/body is not an authorization scope.
  // Callers must pass the HOD context produced by authenticated middleware.
  private async scopedDepartment(hod?: HODContext) {
    if (!hod?.uid || hod.role !== 'HOD' || !hod.departmentId || !hod.collegeId) {
      throw new ForbiddenError('Verified HOD department context is required');
    }
    const department = await prisma.department.findFirst({
      where: { id: hod.departmentId, college_id: hod.collegeId, is_active: true },
    });
    if (!department) throw new ForbiddenError('No valid department is assigned to this account');
    return department;
  }

  async getFacultyList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    departmentId?: string;
  }, hod?: HODContext) {
    await this.scopedDepartment(hod);
    if (params?.departmentId && params.departmentId !== hod!.departmentId) {
      throw new ForbiddenError('Faculty department is outside your scope');
    }
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = { role: 'FACULTY', department_id: hod!.departmentId, college_id: hod!.collegeId };
    if (params?.departmentId) {
      where.department_id = params.departmentId;
    }
    if (params?.search) {
      where.OR = [
        { display_name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, facultyList] = await Promise.all([
      prisma.authedUser.count({ where }),
      prisma.authedUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { display_name: 'asc' },
        include: {
          facultyClasses: {
            where: { batch: { program: { department_id: hod!.departmentId, department: { college_id: hod!.collegeId! } } } },
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const formatted = facultyList.map((f: any) => {
      const assignedClass = f.facultyClasses?.[0];
      return {
        uid: f.uid,
        id: f.uid,
        name: f.display_name || 'Faculty',
        email: f.email,
        phone: f.register_number || '',
        designation: 'Assistant Professor',
        departmentId: f.department_id,
        isClassIncharge: !!assignedClass,
        assignedClassName: assignedClass?.name,
        status: 'ACTIVE',
      };
    });

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { data: formatted, pagination };
  }

  async getFacultyById(id: string, hod?: HODContext) {
    await this.scopedDepartment(hod);
    const faculty = await prisma.authedUser.findFirst({
      where: { uid: id, role: 'FACULTY', department_id: hod!.departmentId, college_id: hod!.collegeId },
      include: {
        facultyClasses: { where: { batch: { program: { department_id: hod!.departmentId, department: { college_id: hod!.collegeId! } } } } },
        department: true,
      },
    });

    if (!faculty) {
      throw new NotFoundError('Faculty member not found');
    }

    const assignedClass = faculty.facultyClasses?.[0];
    return {
      uid: faculty.uid,
      id: faculty.uid,
      name: faculty.display_name || 'Faculty',
      email: faculty.email,
      phone: faculty.register_number || '',
      designation: 'Assistant Professor',
      departmentId: faculty.department_id,
      departmentName: faculty.department?.name || 'Department',
      isClassIncharge: !!assignedClass,
      assignedClassName: assignedClass?.name,
      status: 'ACTIVE',
    };
  }

  async createFaculty(_data: {
    name: string;
    email: string;
    phone?: string;
    designation?: string;
    departmentId?: string;
  }) {
    // A fabricated UID cannot be bound to a verified Firebase account.
    throw new ForbiddenError('Faculty accounts must be provisioned through verified onboarding');
  }

  async updateFaculty(
    _id: string,
    _data: {
      name?: string;
      email?: string;
      phone?: string;
    }
  ) {
    throw new ForbiddenError('Faculty profile changes require a scoped account-management workflow');
  }

  async getPendingApplications(departmentId: string, hod?: HODContext) {
    const dept = await this.scopedDepartment(hod);
    if (departmentId !== dept.id) throw new ForbiddenError('Faculty department is outside your scope');

    const list = await prisma.authedUser.findMany({
      where: {
        department_id: dept.id,
        college_id: dept.college_id,
        requested_role: 'FACULTY',
        approval_status: { in: ['PENDING', 'pending'] },
        role: { in: ['USER', 'PENDING_FACULTY'] },
      },
      include: {
        department: true,
        college: true,
      },
      orderBy: { created_at: 'desc' },
    });
    
    return list.map((f: any) => ({
      uid: f.uid,
      name: f.display_name || 'Applicant',
      email: f.email,
      phone: f.phone || '',
      registerNumber: f.register_number || '',
      departmentId: f.department_id,
      departmentName: f.department?.name || dept?.name || 'Department',
      departmentCode: f.department?.code || dept?.code || '',
      collegeId: f.college_id,
      collegeName: f.college?.name || '',
      requestedRole: f.requested_role || 'FACULTY',
      photoUrl: f.photo_url || null,
      status: 'PENDING',
      appliedAt: f.created_at || new Date().toISOString(),
    }));
  }

  async approveApplication(
    id: string,
    data: {
      action: 'APPROVE' | 'REJECT';
      subjectId?: string;
      classId?: string;
    },
    hod?: HODContext
  ) {
    const dept = await this.scopedDepartment(hod);
    if (data.action !== 'APPROVE' && data.action !== 'REJECT') {
      throw new BadRequestError('Invalid review action');
    }
    const subjectId = data.subjectId?.trim() || undefined;
    const classId = data.classId?.trim() || undefined;

    // Guard the target and every referenced row within the same transaction.
    return prisma.$transaction(async (tx) => {
      const scope = { department_id: dept.id, college_id: dept.college_id };
      const pending = {
        uid: id,
        ...scope,
        requested_role: 'FACULTY',
        approval_status: { in: ['PENDING', 'pending'] },
        role: { in: ['USER', 'PENDING_FACULTY'] },
      };
      const faculty = await tx.authedUser.findFirst({ where: pending });
      if (!faculty) throw new NotFoundError('Pending faculty application not found in your department');

      const classScope = {
        batch: { program: { department_id: dept.id, department: { college_id: dept.college_id } } },
      };
      if (data.action === 'APPROVE') {
        // Also validate retained assignments when the reviewer supplies no replacement.
        const assignedSubjectId = subjectId || faculty.subject_id;
        if (assignedSubjectId && !await tx.subject.findFirst({
          where: { id: assignedSubjectId, department_id: dept.id, department: { college_id: dept.college_id } },
        })) throw new ForbiddenError('Subject does not belong to your department');
        if (classId && !await tx.class.findFirst({ where: { id: classId, ...classScope } })) {
          throw new ForbiddenError('Class does not belong to your department');
        }
        if (await tx.class.findFirst({
          where: { faculty_uid: id, NOT: classScope },
        })) throw new ForbiddenError('Faculty has an assignment outside your department');
      }

      // Never reconcile by email: only the exact Firebase UID may be updated.
      const dbUser = await tx.user.findUnique({ where: { firebaseUid: id } });
      if (dbUser) {
        if (dbUser.collegeId !== dept.college_id || dbUser.status !== 'PENDING') {
          throw new ForbiddenError('Conflicting legacy account assignment');
        }
        const request = await tx.accountApproval.findFirst({
          where: { userId: dbUser.id, requestedRole: 'FACULTY', requestedCollege: dept.college_id, status: 'PENDING' },
        });
        if (!request) throw new ForbiddenError('No matching pending faculty request');
      }

      const changed = await tx.authedUser.updateMany({
        where: pending,
        data: data.action === 'APPROVE'
          ? { role: 'FACULTY', approval_status: 'APPROVED', subject_id: subjectId }
          : { approval_status: 'REJECTED' },
      });
      if (changed.count !== 1) throw new NotFoundError('Pending faculty application no longer available');

      if (data.action === 'APPROVE' && classId) {
        await tx.class.updateMany({
          where: { faculty_uid: id, ...classScope },
          data: { faculty_uid: null },
        });
        const assigned = await tx.class.updateMany({
          where: { id: classId, ...classScope },
          data: { faculty_uid: id },
        });
        if (assigned.count !== 1) throw new ForbiddenError('Class no longer belongs to your department');
      }

      if (dbUser) {
        const reviewedAt = new Date();
        const reviewed = await tx.accountApproval.updateMany({
          where: { userId: dbUser.id, requestedRole: 'FACULTY', requestedCollege: dept.college_id, status: 'PENDING' },
          data: {
            status: data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            reviewedAt,
            reviewedBy: hod!.uid,
          },
        });
        if (!reviewed.count) throw new ForbiddenError('No matching pending faculty request');
        const legacyUpdated = await tx.user.updateMany({
          where: { id: dbUser.id, collegeId: dept.college_id, status: 'PENDING' },
          data: { status: data.action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' },
        });
        if (legacyUpdated.count !== 1) throw new ForbiddenError('Legacy account no longer pending');
      }
      return tx.authedUser.findUniqueOrThrow({ where: { uid: id } });
    });
  }

  async deleteFaculty(_id: string) {
    throw new ForbiddenError('Faculty deletion requires a scoped account-management workflow');
  }
}

export const facultyService = new FacultyService();
