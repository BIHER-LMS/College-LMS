import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';

export class ProgramService {
  async getPrograms(departmentId?: string) {
    const where: any = {};
    if (departmentId) where.department_id = departmentId;

    return prisma.program.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getProgramById(id: string) {
    const program = await prisma.program.findUnique({
      where: { id },
      include: { batches: true },
    });
    if (!program) throw new NotFoundError('Program not found');
    return program;
  }

  async createProgram(data: {
    name: string;
    type?: string;
    durationYears: number;
    departmentId?: string;
  }) {
    let department_id = data.departmentId;
    if (!department_id) {
      const dept = await prisma.department.findFirst();
      if (!dept) throw new NotFoundError('Department not found');
      department_id = dept.id;
    }

    return prisma.program.create({
      data: {
        name: data.name,
        type: data.type || 'UG',
        duration_years: data.durationYears,
        department_id,
      },
    });
  }

  async updateProgram(id: string, data: Partial<{ name: string; type: string; duration_years: number; is_active: boolean }>) {
    return prisma.program.update({
      where: { id },
      data,
    });
  }

  async deleteProgram(id: string) {
    return prisma.program.delete({
      where: { id },
    });
  }
}

export const programService = new ProgramService();
