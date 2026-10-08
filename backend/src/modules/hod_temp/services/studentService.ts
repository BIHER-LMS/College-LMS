import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';
import { PaginationMeta } from '../utils/response';

export class StudentService {
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
  }) {
    const page = params?.page ? Math.max(1, params.page) : 1;
    const limit = params?.limit ? Math.max(1, params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = { role: 'STUDENT' };
    if (params?.classId) {
      where.class_id = params.classId;
    }
    if (params?.search) {
      where.OR = [
        { display_name: { contains: params.search, mode: 'insensitive' } },
        { register_number: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.authedUser.count({ where }),
      prisma.authedUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { display_name: 'asc' },
        include: {
          class: {
            include: {
              batch: {
                include: {
                  program: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const formatted = students.map((s) => ({
      id: s.uid,
      registerNumber: s.register_number,
      name: s.display_name,
      email: s.email,
      phone: '',
      programName: s.class?.batch?.program?.name,
      batchName: s.class?.batch ? `${s.class.batch.start_year}-${s.class.batch.end_year}` : undefined,
      className: s.class?.name,
      status: 'ACTIVE',
    }));

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };

    return { data: formatted, pagination };
  }

  async getStudentById(id: string) {
    const s = await prisma.authedUser.findUnique({
      where: { uid: id },
      include: {
        class: {
          include: {
            batch: {
              include: {
                program: true,
              },
            },
          },
        },
      },
    });

    if (!s || s.role !== 'STUDENT') throw new NotFoundError('Student not found');

    return {
      id: s.uid,
      registerNumber: s.register_number,
      name: s.display_name,
      email: s.email,
      phone: '',
      programName: s.class?.batch?.program?.name,
      batchName: s.class?.batch ? `${s.class.batch.start_year}-${s.class.batch.end_year}` : undefined,
      className: s.class?.name,
      status: 'ACTIVE',
    };
  }

  async createStudent(data: {
    registerNumber: string;
    name: string;
    email: string;
    phone?: string;
    classId: string;
    status?: string;
  }) {
    return prisma.authedUser.create({
      data: {
        uid: data.registerNumber,
        register_number: data.registerNumber,
        display_name: data.name,
        email: data.email,
        class_id: data.classId,
        role: 'STUDENT',
      },
    });
  }

  async updateStudent(id: string, data: Partial<{ name: string; email: string; phone: string; classId: string; status: string }>) {
    const updateData: any = {};
    if (data.name) updateData.display_name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.classId) updateData.class_id = data.classId;

    return prisma.authedUser.update({
      where: { uid: id },
      data: updateData,
    });
  }

  async deleteStudent(id: string) {
    return prisma.authedUser.delete({
      where: { uid: id },
    });
  }
}

export const studentService = new StudentService();
