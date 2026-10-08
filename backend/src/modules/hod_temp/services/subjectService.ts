import { prisma } from '../config/db';
import { NotFoundError } from '../utils/errors';

export class SubjectService {
  async getSubjects(departmentId?: string) {
    const where: any = {};
    if (departmentId) where.department_id = departmentId;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    return subjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      semesterNumber: sub.semester_number,
      status: sub.is_active ? 'ACTIVE' : 'INACTIVE',
    }));
  }

  async getSubjectById(id: string) {
    const sub = await prisma.subject.findUnique({
      where: { id },
    });
    if (!sub) throw new NotFoundError('Subject not found');
    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      semesterNumber: sub.semester_number,
      status: sub.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async createSubject(data: {
    name: string;
    code: string;
    credits: number;
    semesterNumber: number;
    departmentId?: string;
    isActive?: boolean;
  }) {
    let departmentId = data.departmentId;
    if (!departmentId) {
      const dept = await prisma.department.findFirst();
      if (!dept) throw new NotFoundError('Department not found');
      departmentId = dept.id;
    }

    return prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        credits: data.credits,
        semester_number: data.semesterNumber,
        department_id: departmentId,
        is_active: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateSubject(id: string, data: Partial<{ name: string; code: string; credits: number; semesterNumber: number; isActive: boolean }>) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.code) updateData.code = data.code;
    if (data.credits !== undefined) updateData.credits = data.credits;
    if (data.semesterNumber !== undefined) updateData.semester_number = data.semesterNumber;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    return prisma.subject.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteSubject(id: string) {
    return prisma.subject.delete({
      where: { id },
    });
  }
}

export const subjectService = new SubjectService();
