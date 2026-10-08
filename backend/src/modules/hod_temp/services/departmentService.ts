import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';

export class DepartmentService {
  async getDepartment(id?: string) {
    let department: any = null;
    if (id) {
      department = await prisma.department.findUnique({
        where: { id },
        include: {
          college: true,
          hod: true,
        },
      });
    }

    if (!department) {
      department = await prisma.department.findFirst({
        include: {
          college: true,
          hod: true,
        },
      });
    }

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    const facultyCount = await prisma.authedUser.count({
      where: { department_id: department.id, role: 'FACULTY' },
    });
    const programCount = await prisma.program.count({
      where: { department_id: department.id },
    });
    const studentCount = await prisma.authedUser.count({
      where: { department_id: department.id, role: 'STUDENT' },
    });
    const subjectCount = await prisma.subject.count({
      where: { department_id: department.id },
    });

    const hodName = department.hod?.display_name || 'Head of Department';

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      collegeName: department.college?.name || 'College',
      hodName,
      status: department.is_active ? 'ACTIVE' : 'INACTIVE',
      facultyCount,
      studentCount,
      programCount,
      subjectCount,
    };
  }

  async updateDepartment(id: string, data: { name?: string; code?: string }) {
    const department = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
      },
    });
    return department;
  }
}

export const departmentService = new DepartmentService();
