import { prisma } from '../config/db';

export class AcademicYearService {
  async getAcademicYears() {
    const list = await prisma.academicYear.findMany({
      orderBy: { start_date: 'desc' },
      include: { semesters: true },
    });

    return list.map((ay) => ({
      id: ay.id,
      name: ay.name,
      startDate: ay.start_date.toISOString().split('T')[0],
      endDate: ay.end_date.toISOString().split('T')[0],
      isCurrent: ay.is_current,
    }));
  }

  async createAcademicYear(data: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
    collegeId?: string;
  }) {
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { is_current: true },
        data: { is_current: false },
      });
    }

    // Need a college_id; find the first college if not provided
    let collegeId = data.collegeId;
    if (!collegeId) {
      const college = await prisma.college.findFirst();
      if (!college) throw new Error('No college found. Please create a college first.');
      collegeId = college.id;
    }

    const ay = await prisma.academicYear.create({
      data: {
        name: data.name,
        start_date: new Date(data.startDate),
        end_date: new Date(data.endDate),
        is_current: !!data.isCurrent,
        college_id: collegeId,
      },
    });

    return {
      id: ay.id,
      name: ay.name,
      startDate: ay.start_date.toISOString().split('T')[0],
      endDate: ay.end_date.toISOString().split('T')[0],
      isCurrent: ay.is_current,
    };
  }

  async getSemesters(academicYearId?: string) {
    const where: any = {};
    if (academicYearId) where.academic_year_id = academicYearId;

    const list = await prisma.semester.findMany({
      where,
      orderBy: { term_number: 'asc' },
    });

    return list.map((sem) => ({
      id: sem.id,
      termNumber: sem.term_number,
      startDate: sem.start_date.toISOString().split('T')[0],
      endDate: sem.end_date.toISOString().split('T')[0],
      academicYearId: sem.academic_year_id,
    }));
  }

  async createSemester(data: {
    termNumber: number;
    startDate: string;
    endDate: string;
    academicYearId: string;
  }) {
    const sem = await prisma.semester.create({
      data: {
        term_number: data.termNumber,
        start_date: new Date(data.startDate),
        end_date: new Date(data.endDate),
        academic_year_id: data.academicYearId,
      },
    });

    return {
      id: sem.id,
      termNumber: sem.term_number,
      startDate: sem.start_date.toISOString().split('T')[0],
      endDate: sem.end_date.toISOString().split('T')[0],
      academicYearId: sem.academic_year_id,
    };
  }
}

export const academicYearService = new AcademicYearService();
