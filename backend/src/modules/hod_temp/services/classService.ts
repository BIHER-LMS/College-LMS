import { prisma } from '../config/db';
import { NotFoundError, AppError } from '../utils/errors';
import { PaginationMeta } from '../utils/response';

export class ClassService {
  async getClassList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    batchId?: string;
  }) {
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params?.batchId) {
      where.batch_id = params.batchId;
    }
    if (params?.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [total, classes] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          batch: {
            include: {
              program: true,
            },
          },
          faculty: true,
          students: {
            select: { uid: true },
          },
        },
      }),
    ]);

    const formatted = classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      batchId: c.batch_id,
      batchName: `${c.batch?.program?.name} (${c.batch?.start_year}-${c.batch?.end_year})`,
      programName: c.batch?.program?.name,
      currentSemester: c.current_semester || 1,
      facultyUid: c.faculty_uid || undefined,
      facultyName: c.faculty?.display_name || undefined,
      studentCount: c.students?.length || 0,
      status: c.is_active ? 'ACTIVE' : 'INACTIVE',
    }));

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { data: formatted, pagination };
  }

  async getClassById(id: string) {
    const cls = await prisma.class.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
        faculty: true,
        students: {
          select: { uid: true, display_name: true },
        },
      },
    });

    if (!cls) {
      throw new NotFoundError('Class not found');
    }

    const c: any = cls;
    return {
      id: c.id,
      name: c.name,
      batchId: c.batch_id,
      batchName: `${c.batch?.program?.name} (${c.batch?.start_year}-${c.batch?.end_year})`,
      programName: c.batch?.program?.name,
      currentSemester: c.current_semester || 1,
      facultyUid: c.faculty_uid || undefined,
      facultyName: c.faculty?.display_name || undefined,
      studentCount: c.students?.length || 0,
      status: c.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async createClass(data: {
    name: string;
    batchId: string;
    currentSemester?: number;
    facultyUid?: string;
  }) {
    return prisma.class.create({
      data: {
        name: data.name,
        batch_id: data.batchId,
        current_semester: data.currentSemester || 1,
        faculty_uid: data.facultyUid || null,
        is_active: true,
      },
      include: {
        faculty: true,
        batch: { include: { program: true } },
      },
    });
  }

  async updateClass(
    id: string,
    data: {
      name?: string;
      currentSemester?: number;
      facultyUid?: string | null;
      isActive?: boolean;
    }
  ) {
    return prisma.class.update({
      where: { id },
      data: {
        name: data.name,
        current_semester: data.currentSemester,
        faculty_uid: data.facultyUid,
        is_active: data.isActive,
      },
      include: {
        faculty: true,
        batch: { include: { program: true } },
      },
    });
  }

  async deleteClass(id: string) {
    return prisma.class.delete({
      where: { id },
    });
  }

  async assignClassIncharge(classId: string, facultyUid: string) {
    const targetClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        batch: {
          include: { program: true },
        },
      },
    });

    if (!targetClass) {
      throw new NotFoundError(`Class with ID '${classId}' does not exist.`);
    }

    const targetFaculty = await prisma.authedUser.findFirst({
      where: { uid: facultyUid, role: 'FACULTY' },
    });

    if (!targetFaculty) {
      throw new NotFoundError(`Faculty with UID '${facultyUid}' does not exist.`);
    }

    const tc: any = targetClass;
    const departmentId = tc.batch?.program?.department_id;
    if (targetFaculty.department_id !== departmentId) {
      throw new AppError(
        'Selected faculty does not belong to the same department as this class.',
        400,
        'DEPARTMENT_MISMATCH'
      );
    }

    // Remove previous class-incharge assignment
    await prisma.class.updateMany({
      where: { faculty_uid: targetFaculty.uid },
      data: { faculty_uid: null },
    });

    // Assign selected faculty to target class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { faculty_uid: targetFaculty.uid },
      include: {
        batch: {
          include: { program: true },
        },
        faculty: true,
        students: {
          select: { uid: true },
        },
      },
    });

    const uc: any = updatedClass;
    return {
      id: uc.id,
      name: uc.name,
      batchId: uc.batch_id,
      batchName: `${uc.batch?.program?.name} (${uc.batch?.start_year}-${uc.batch?.end_year})`,
      programName: uc.batch?.program?.name,
      currentSemester: uc.current_semester || 1,
      facultyUid: uc.faculty_uid || undefined,
      facultyName: uc.faculty?.display_name || undefined,
      studentCount: uc.students?.length || 0,
      status: uc.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }
}

export const classService = new ClassService();
