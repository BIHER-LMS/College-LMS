import { prisma } from '../config/db';
import { HODContext } from '../middleware/authMiddleware';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

export class HODService {
  // ==========================================
  // 1. DASHBOARD & CONTEXT
  // ==========================================
  async getDashboard(hod: HODContext) {
    const departmentId = hod.departmentId;

    // 1. Department info with college
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
          },
        },
        hod: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
      },
    });

    if (!department || !hod.collegeId || department.college_id !== hod.collegeId) {
      throw new NotFoundError('Assigned department could not be found.');
    }

    const dept: any = department;

    // 2. Compute live statistics strictly scoped to HOD department
    const [
      facultyCount,
      studentCount,
      programCount,
      batchCount,
      classCount,
      subjectCount,
    ] = await Promise.all([
      prisma.authedUser.count({
        where: { department_id: departmentId, college_id: hod.collegeId, role: 'FACULTY' },
      }),
      prisma.authedUser.count({
        where: { department_id: departmentId, college_id: hod.collegeId, role: 'STUDENT' },
      }),
      prisma.program.count({
        where: { department_id: departmentId, is_active: true },
      }),
      prisma.batch.count({
        where: {
          program: { department_id: departmentId },
          is_active: true,
        },
      }),
      prisma.class.count({
        where: {
          batch: {
            program: { department_id: departmentId },
          },
          is_active: true,
        },
      }),
      prisma.subject.count({
        where: { department_id: departmentId, is_active: true },
      }),
    ]);

    // 3. Academic Year & Semester
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { college_id: hod.collegeId },
      orderBy: { is_current: 'desc' },
      include: {
        semesters: {
          orderBy: { term_number: 'asc' },
        },
      },
    });

    const currentSemester = currentAcademicYear?.semesters?.[0] || null;

    // 4. Recent classes & faculty overview
    const recentClasses = await prisma.class.findMany({
      where: {
        batch: {
          program: { department_id: departmentId },
        },
      },
      include: {
        batch: {
          include: { program: true },
        },
        faculty: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
      },
      take: 5,
      orderBy: { created_at: 'desc' },
    });

    return {
      department: {
        id: department.id,
        name: department.name,
        code: department.code,
        status: dept.is_active ? 'ACTIVE' : 'INACTIVE',
        college: dept.college,
        hod: dept.hod 
          ? {
              uid: dept.hod.uid,
              name: dept.hod.display_name,
              email: dept.hod.email,
              photoUrl: dept.hod.photo_url,
            }
          : {
              uid: hod.uid,
              name: hod.displayName,
              email: hod.email,
              photoUrl: hod.photoUrl,
            },
      },
      statistics: {
        facultyCount,
        studentCount,
        programCount,
        batchCount,
        classCount,
        subjectCount,
      },
      academicYear: currentAcademicYear
        ? {
            id: currentAcademicYear.id,
            name: currentAcademicYear.name,
            startDate: currentAcademicYear.start_date,
            endDate: currentAcademicYear.end_date,
            isCurrent: currentAcademicYear.is_current,
          }
        : null,
      semester: currentSemester
        ? {
            id: currentSemester.id,
            termNumber: currentSemester.term_number,
            startDate: currentSemester.start_date,
            endDate: currentSemester.end_date,
          }
        : null,
      recentClasses: recentClasses.map((c) => ({
        id: c.id,
        name: c.name,
        currentSemester: c.current_semester,
        programName: c.batch?.program?.name,
        facultyIncharge: c.faculty,
      })),
    };
  }

  // ==========================================
  // 2. DEPARTMENT DETAILS
  // ==========================================
  async getDepartmentDetails(hod: HODContext) {
    const department = await prisma.department.findUnique({
      where: { id: hod.departmentId },
      include: {
        college: true,
        hod: true,
        programs: {
          where: { is_active: true },
          include: {
            batches: {
              include: { classes: true },
            },
          },
        },
        subjects: {
          where: { is_active: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundError('Department not found.');
    }

    const [facultyCount, studentCount] = await Promise.all([
      prisma.authedUser.count({
        where: { department_id: hod.departmentId, role: 'FACULTY' },
      }),
      prisma.authedUser.count({
        where: { department_id: hod.departmentId, role: 'STUDENT' },
      }),
    ]);

    return {
      id: department.id,
      name: department.name,
      code: department.code,
      collegeName: department.college?.name || 'College of Engineering',
      collegeCode: department.college?.code || 'COE',
      status: department.is_active ? 'ACTIVE' : 'INACTIVE',
      hod: department.hod
        ? {
            uid: department.hod.uid,
            name: department.hod.display_name,
            email: department.hod.email,
            photoUrl: department.hod.photo_url,
          }
        : {
            uid: hod.uid,
            name: hod.displayName,
            email: hod.email,
            photoUrl: hod.photoUrl,
          },
      facultyCount,
      studentCount,
      programCount: department.programs.length,
      subjectCount: department.subjects.length,
      program: department.programs.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        durationYears: p.duration_years,
        batchCount: p.batches.length,
      })),
      createdAt: department.created_at,
    };
  }

  // ==========================================
  // 3. FACULTY MANAGEMENT
  // ==========================================
  async getFacultyList(hod: HODContext, search?: string) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const where: any = {
      department_id: hod.departmentId,
      college_id: hod.collegeId,
      role: 'FACULTY',
    };

    if (search) {
      where.OR = [
        { display_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const facultyMembers = await prisma.authedUser.findMany({
      where,
      include: {
        facultyClasses: {
          where: { batch: { program: { department_id: hod.departmentId, department: { college_id: hod.collegeId } } } },
          select: {
            id: true,
            name: true,
            current_semester: true,
            is_active: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            department_id: true,
          },
        },
        facultySubjects: {
          include: {
            subject: true,
            class: true,
          }
        },
      },
      orderBy: { display_name: 'asc' },
    });

    return facultyMembers.map((f: any) => {
      const assignedClasses = f.facultyClasses || [];
      const isClassIncharge = assignedClasses.length > 0;
      
      const subjects = f.facultySubjects ? f.facultySubjects.map((cs: any) => ({
        id: cs.subject.id,
        name: cs.subject.name,
        code: cs.subject.code,
        classId: cs.class.id,
        className: cs.class.name,
      })) : [];

      return {
        id: f.uid,
        uid: f.uid,
        name: f.display_name || 'Faculty Member',
        email: f.email,
        phone: f.register_number || 'N/A',
        designation: 'Assistant Professor',
        departmentId: f.department_id,
        photoUrl: f.photo_url,
        isClassIncharge,
        assignedClasses,
        assignedClassName: assignedClasses[0]?.name,
        subjects,
        status: 'ACTIVE',
        createdAt: f.created_at,
      };
    });
  }

  async getFacultyById(hod: HODContext, facultyUid: string) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const faculty = await prisma.authedUser.findFirst({
      where: {
        uid: facultyUid,
        department_id: hod.departmentId,
        college_id: hod.collegeId,
        role: 'FACULTY',
      },
      include: {
        facultyClasses: {
          where: { batch: { program: { department_id: hod.departmentId, department: { college_id: hod.collegeId } } } },
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
        subject: true,
        facultySubjects: {
          include: {
            subject: true,
            class: true,
          }
        },
      },
    });

    if (!faculty) {
      throw new NotFoundError('Faculty member not found in this department.');
    }

    return {
      uid: faculty.uid,
      name: faculty.display_name || 'Faculty Member',
      email: faculty.email,
      phone: faculty.register_number || 'N/A',
      designation: 'Assistant Professor',
      departmentId: faculty.department_id,
      photoUrl: faculty.photo_url,
      assignedClasses: faculty.facultyClasses.map((c: any) => ({
        id: c.id,
        name: c.name,
        currentSemester: c.current_semester,
        programName: c.batch?.program?.name,
      })),
      isClassIncharge: faculty.facultyClasses.length > 0,
      subjects: faculty.facultySubjects.map((cs: any) => ({
        id: cs.subject.id,
        name: cs.subject.name,
        code: cs.subject.code,
        classId: cs.class.id,
        className: cs.class.name,
      })),
      recentAttendanceSessions: [],
      status: 'ACTIVE',
    };
  }

  // ==========================================
  // 4. PROGRAM MANAGEMENT
  // ==========================================
  async getPrograms(hod: HODContext) {
    const programs = await prisma.program.findMany({
      where: { department_id: hod.departmentId },
      include: {
        batches: {
          include: { classes: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return programs.map((p: any) => ({
      id: p.id,
      name: p.name,
      code: p.type,
      degree: p.type,
      durationYears: p.duration_years,
      departmentId: p.department_id,
      status: p.is_active ? 'ACTIVE' : 'INACTIVE',
      batchCount: p.batches.length,
      classCount: p.batches.reduce((sum: number, b: any) => sum + b.classes.length, 0),
      createdAt: p.created_at,
    }));
  }

  async createProgram(hod: HODContext, data: { name: string; degree?: string; type?: string; durationYears: number }) {
    if (!data.name || !data.durationYears) {
      throw new BadRequestError('Program name and duration (years) are required.');
    }

    const program = await prisma.program.create({
      data: {
        department_id: hod.departmentId,
        name: data.name.trim(),
        type: data.type || data.degree || 'UG',
        duration_years: Number(data.durationYears),
        is_active: true,
      },
    });

    return {
      id: program.id,
      name: program.name,
      degree: program.type,
      durationYears: program.duration_years,
      departmentId: program.department_id,
      status: 'ACTIVE',
      batchCount: 0,
      classCount: 0,
    };
  }

  async updateProgram(hod: HODContext, programId: string, data: { name?: string; degree?: string; type?: string; durationYears?: number; isActive?: boolean; status?: string }) {
    const existing = await prisma.program.findFirst({
      where: { id: programId, department_id: hod.departmentId },
    });

    if (!existing) {
      throw new NotFoundError('Program not found in your department.');
    }

    const updated = await prisma.program.update({
      where: { id: programId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        type: data.type || data.degree || undefined,
        duration_years: data.durationYears !== undefined ? Number(data.durationYears) : undefined,
        is_active: data.isActive !== undefined ? data.isActive : data.status ? data.status === 'ACTIVE' : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      degree: updated.type,
      durationYears: updated.duration_years,
      departmentId: updated.department_id,
      status: updated.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  // ==========================================
  // 5. BATCH MANAGEMENT
  // ==========================================
  async getBatches(hod: HODContext) {
    const batches = await prisma.batch.findMany({
      where: {
        program: { department_id: hod.departmentId },
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        classes: {
          select: {
            id: true,
            name: true,
            current_semester: true,
          },
        },
      },
      orderBy: { start_year: 'desc' },
    });

    return batches.map((b: any) => ({
      id: b.id,
      name: `${b.program?.name || 'Program'} (${b.start_year} - ${b.end_year})`,
      programId: b.program_id,
      programName: b.program?.name,
      startYear: b.start_year,
      endYear: b.end_year,
      status: b.is_active ? 'ACTIVE' : 'INACTIVE',
      classCount: b.classes.length,
      classes: b.classes,
      createdAt: b.created_at,
    }));
  }

  async createBatch(hod: HODContext, data: { programId: string; startYear: number; endYear: number; isActive?: boolean }) {
    if (!data.programId || !data.startYear || !data.endYear) {
      throw new BadRequestError('Program, start year, and end year are required.');
    }

    const program = await prisma.program.findFirst({
      where: { id: data.programId, department_id: hod.departmentId },
    });

    if (!program) {
      throw new ForbiddenError('Selected program does not belong to your department.');
    }

    if (data.endYear <= data.startYear) {
      throw new BadRequestError('End year must be greater than start year.');
    }

    const batch = await prisma.batch.create({
      data: {
        program_id: data.programId,
        start_year: Number(data.startYear),
        end_year: Number(data.endYear),
        is_active: data.isActive !== undefined ? data.isActive : true,
      },
      include: { program: true },
    });

    return {
      id: batch.id,
      name: `${batch.program.name} (${batch.start_year} - ${batch.end_year})`,
      programId: batch.program_id,
      programName: batch.program.name,
      startYear: batch.start_year,
      endYear: batch.end_year,
      status: batch.is_active ? 'ACTIVE' : 'INACTIVE',
      classCount: 0,
    };
  }

  async updateBatch(hod: HODContext, batchId: string, data: { startYear?: number; endYear?: number; isActive?: boolean; status?: string }) {
    const existing = await prisma.batch.findFirst({
      where: {
        id: batchId,
        program: { department_id: hod.departmentId },
      },
    });

    if (!existing) {
      throw new NotFoundError('Batch not found in your department.');
    }

    const updated = await prisma.batch.update({
      where: { id: batchId },
      data: {
        start_year: data.startYear !== undefined ? Number(data.startYear) : undefined,
        end_year: data.endYear !== undefined ? Number(data.endYear) : undefined,
        is_active: data.isActive !== undefined ? data.isActive : data.status ? data.status === 'ACTIVE' : undefined,
      },
      include: { program: true },
    });

    return {
      id: updated.id,
      name: `${updated.program.name} (${updated.start_year} - ${updated.end_year})`,
      programId: updated.program_id,
      programName: updated.program.name,
      startYear: updated.start_year,
      endYear: updated.end_year,
      status: updated.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  // ==========================================
  // 6. CLASS MANAGEMENT & CLASS INCHARGE
  // ==========================================
  async getClasses(hod: HODContext, search?: string) {
    const where: any = {
      batch: {
        program: { department_id: hod.departmentId },
      },
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        batch: {
          include: { program: true },
        },
        faculty: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
        students: {
          where: { role: 'STUDENT', department_id: hod.departmentId, college_id: hod.collegeId },
          select: { uid: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      batchId: c.batch_id,
      batchName: `${c.batch?.program?.name} (${c.batch?.start_year} - ${c.batch?.end_year})`,
      programId: c.batch?.program?.id,
      programName: c.batch?.program?.name,
      currentSemester: c.current_semester || 1,
      facultyId: c.faculty_uid,
      facultyUid: c.faculty_uid,
      facultyIncharge: c.faculty
        ? {
            uid: c.faculty.uid,
            id: c.faculty.uid,
            name: c.faculty.display_name,
            email: c.faculty.email,
            photoUrl: c.faculty.photo_url,
          }
        : null,
      studentCount: c.students.length,
      status: c.is_active ? 'ACTIVE' : 'INACTIVE',
      createdAt: c.created_at,
    }));
  }

  async getClassById(hod: HODContext, classId: string) {
    const classItem = await prisma.class.findFirst({
      where: {
        id: classId,
        batch: {
          program: { department_id: hod.departmentId },
        },
      },
      include: {
        batch: {
          include: { program: true },
        },
        faculty: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
        students: {
          where: { role: 'STUDENT', department_id: hod.departmentId, college_id: hod.collegeId },
          select: {
            uid: true,
            display_name: true,
            email: true,
            register_number: true,
            photo_url: true,
          },
        },
        classSubjects: {
          include: {
            subject: true,
            faculty: {
              select: { uid: true, display_name: true, email: true, photo_url: true }
            }
          }
        }
      },
    });

    if (!classItem) {
      throw new NotFoundError('Class not found in your department.');
    }

    return {
      id: classItem.id,
      name: classItem.name,
      batchId: classItem.batch_id,
      batchName: `${classItem.batch?.program?.name} (${classItem.batch?.start_year} - ${classItem.batch?.end_year})`,
      programName: classItem.batch?.program?.name,
      currentSemester: classItem.current_semester,
      facultyIncharge: classItem.faculty,
      students: classItem.students.map((s: any) => ({
        id: s.uid,
        uid: s.uid,
        name: s.display_name,
        email: s.email,
        registerNumber: s.register_number,
        photoUrl: s.photo_url,
        status: 'ACTIVE',
      })),
      subjects: classItem.classSubjects.map((cs: any) => ({
        id: cs.id,
        subjectId: cs.subject_id,
        subjectName: cs.subject?.name,
        subjectCode: cs.subject?.code,
        facultyUid: cs.faculty_uid,
        faculty: cs.faculty ? {
          uid: cs.faculty.uid,
          name: cs.faculty.display_name,
          email: cs.faculty.email,
          photoUrl: cs.faculty.photo_url,
        } : null
      })),
      studentCount: classItem.students.length,
      status: classItem.is_active ? 'ACTIVE' : 'INACTIVE',
      createdAt: classItem.created_at,
    };
  }

  async createClass(hod: HODContext, data: { batchId: string; name: string; currentSemester?: number; facultyUid?: string; isActive?: boolean }) {
    if (!data.batchId || !data.name) {
      throw new BadRequestError('Batch and Class name are required.');
    }

    const batch = await prisma.batch.findFirst({
      where: {
        id: data.batchId,
        program: { department_id: hod.departmentId },
      },
    });

    if (!batch) {
      throw new ForbiddenError('Selected batch does not belong to your department.');
    }

    if (data.facultyUid) {
      const faculty = await prisma.authedUser.findFirst({
        where: {
          uid: data.facultyUid,
          department_id: hod.departmentId,
          role: 'FACULTY',
        },
      });
      if (!faculty) {
        throw new BadRequestError('Selected faculty member not found in your department.');
      }
    }

    const created = await prisma.class.create({
      data: {
        batch_id: data.batchId,
        name: data.name.trim(),
        current_semester: data.currentSemester ? Number(data.currentSemester) : 1,
        faculty_uid: data.facultyUid || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        batch: { include: { program: true } },
        faculty: true,
      },
    });

    return {
      id: created.id,
      name: created.name,
      batchId: created.batch_id,
      batchName: `${created.batch?.program?.name} (${created.batch?.start_year} - ${created.batch?.end_year})`,
      currentSemester: created.current_semester,
      facultyIncharge: created.faculty,
      status: created.is_active ? 'ACTIVE' : 'INACTIVE',
      studentCount: 0,
    };
  }

  async updateClass(hod: HODContext, classId: string, data: { name?: string; currentSemester?: number; isActive?: boolean; status?: string }) {
    const existing = await prisma.class.findFirst({
      where: {
        id: classId,
        batch: { program: { department_id: hod.departmentId } },
      },
    });

    if (!existing) {
      throw new NotFoundError('Class not found in your department.');
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        current_semester: data.currentSemester !== undefined ? Number(data.currentSemester) : undefined,
        is_active: data.isActive !== undefined ? data.isActive : data.status ? data.status === 'ACTIVE' : undefined,
      },
      include: {
        batch: { include: { program: true } },
        faculty: true,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      currentSemester: updated.current_semester,
      facultyIncharge: updated.faculty,
      status: updated.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async assignClassIncharge(hod: HODContext, classId: string, facultyUid: string | null) {
    const classItem = await prisma.class.findFirst({
      where: {
        id: classId,
        batch: {
          program: { department_id: hod.departmentId },
        },
      },
    });

    if (!classItem) {
      throw new NotFoundError('Class not found in your department.');
    }

    if (facultyUid) {
      const faculty = await prisma.authedUser.findFirst({
        where: {
          uid: facultyUid,
          department_id: hod.departmentId,
          role: 'FACULTY',
        },
      });

      if (!faculty) {
        throw new BadRequestError('Selected faculty member does not exist or does not belong to your department.');
      }

      const existingIncharge = await prisma.class.findFirst({
        where: {
          faculty_uid: facultyUid,
          id: { not: classId },
          is_active: true,
        },
      });

      if (existingIncharge) {
        throw new BadRequestError(
          `Faculty "${faculty.display_name || faculty.email}" is already assigned as Class Incharge of "${existingIncharge.name}". A faculty member can only be incharge of one active class.`
        );
      }
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: { faculty_uid: facultyUid || null },
      include: {
        batch: {
          include: { program: true },
        },
        faculty: {
          select: {
            uid: true,
            display_name: true,
            email: true,
            photo_url: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      facultyUid: updated.faculty_uid,
      facultyIncharge: updated.faculty,
      message: facultyUid
        ? 'Class Incharge assigned successfully.'
        : 'Class Incharge unassigned successfully.',
    };
  }

  async assignSubjectToClass(hod: HODContext, classId: string, subjectId: string, facultyUid?: string) {
    const classItem = await prisma.class.findFirst({
      where: {
        id: classId,
        batch: { program: { department_id: hod.departmentId } }
      }
    });

    if (!classItem) throw new NotFoundError('Class not found in your department.');

    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, department_id: hod.departmentId }
    });

    if (!subject) throw new NotFoundError('Subject not found in your department.');

    if (facultyUid) {
      const faculty = await prisma.authedUser.findFirst({
        where: { uid: facultyUid, department_id: hod.departmentId, role: 'FACULTY' }
      });
      if (!faculty) throw new BadRequestError('Selected faculty member not found in your department.');
    }

    const existing = await prisma.classSubject.findUnique({
      where: {
        class_id_subject_id: { class_id: classId, subject_id: subjectId }
      }
    });

    if (existing) {
      if (facultyUid && existing.faculty_uid !== facultyUid) {
        await prisma.classSubject.update({
          where: { id: existing.id },
          data: { faculty_uid: facultyUid }
        });
        return { message: 'Subject assignment updated.' };
      }
      return { message: 'Subject is already assigned to this class.' };
    }

    const created = await prisma.classSubject.create({
      data: {
        class_id: classId,
        subject_id: subjectId,
        faculty_uid: facultyUid || null
      }
    });

    return { message: 'Subject assigned to class successfully.', id: created.id };
  }

  async assignSubjectTeacher(hod: HODContext, classId: string, subjectId: string, facultyUid: string | null) {
    const classItem = await prisma.class.findFirst({
      where: {
        id: classId,
        batch: { program: { department_id: hod.departmentId } }
      }
    });

    if (!classItem) throw new NotFoundError('Class not found in your department.');

    if (facultyUid) {
      const faculty = await prisma.authedUser.findFirst({
        where: { uid: facultyUid, department_id: hod.departmentId, role: 'FACULTY' }
      });
      if (!faculty) throw new BadRequestError('Selected faculty member not found in your department.');
    }

    const existing = await prisma.classSubject.findUnique({
      where: {
        class_id_subject_id: { class_id: classId, subject_id: subjectId }
      }
    });

    if (!existing) {
      throw new NotFoundError('Subject is not assigned to this class.');
    }

    await prisma.classSubject.update({
      where: { id: existing.id },
      data: { faculty_uid: facultyUid }
    });

    return { message: 'Subject teacher updated successfully.' };
  }

  async assignFacultyToClassesAndSubjects(
    hod: HODContext,
    facultyUid: string,
    classIds: string[],
    subjectIds: string[]
  ) {
    if (!classIds || !classIds.length || !subjectIds || !subjectIds.length) {
      throw new BadRequestError('At least one class and one subject must be selected.');
    }

    const faculty = await prisma.authedUser.findFirst({
      where: { uid: facultyUid, department_id: hod.departmentId, role: 'FACULTY' }
    });
    if (!faculty) throw new NotFoundError('Faculty member not found in your department.');

    // Validate classes belong to department
    const validClasses = await prisma.class.findMany({
      where: {
        id: { in: classIds },
        batch: { program: { department_id: hod.departmentId } }
      }
    });
    if (validClasses.length !== classIds.length) {
      throw new BadRequestError('One or more selected classes were not found in your department.');
    }

    // Validate subjects belong to department
    const validSubjects = await prisma.subject.findMany({
      where: {
        id: { in: subjectIds },
        department_id: hod.departmentId
      }
    });
    if (validSubjects.length !== subjectIds.length) {
      throw new BadRequestError('One or more selected subjects were not found in your department.');
    }

    const assignments = [];
    for (const cId of classIds) {
      for (const sId of subjectIds) {
        const item = await prisma.classSubject.upsert({
          where: {
            class_id_subject_id: { class_id: cId, subject_id: sId }
          },
          update: {
            faculty_uid: facultyUid
          },
          create: {
            class_id: cId,
            subject_id: sId,
            faculty_uid: facultyUid
          }
        });
        assignments.push(item);
      }
    }

    return {
      message: `Assigned ${subjectIds.length} subject(s) across ${classIds.length} class(es) successfully.`,
      count: assignments.length
    };
  }

  async unassignFacultySubject(
    hod: HODContext,
    facultyUid: string,
    classId: string,
    subjectId: string
  ) {
    const existing = await prisma.classSubject.findUnique({
      where: {
        class_id_subject_id: { class_id: classId, subject_id: subjectId }
      }
    });

    if (!existing) {
      throw new NotFoundError('Subject assignment not found.');
    }

    if (existing.faculty_uid !== facultyUid) {
      throw new BadRequestError('This subject is not assigned to this faculty member.');
    }

    await prisma.classSubject.update({
      where: { id: existing.id },
      data: { faculty_uid: null }
    });

    return { message: 'Subject unassigned successfully.' };
  }

  // ==========================================
  // 7. STUDENT MANAGEMENT
  // ==========================================
  async getStudents(hod: HODContext, options?: { classId?: string; search?: string }) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const where: any = {
      department_id: hod.departmentId,
      college_id: hod.collegeId,
      role: 'STUDENT',
      OR: [
        { class_id: null },
        { class: { batch: { program: { department_id: hod.departmentId, department: { college_id: hod.collegeId } } } } },
      ],
    };

    if (options?.classId) {
      where.class_id = options.classId;
    }

    if (options?.search) {
      where.AND = [{ OR: [
        { display_name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { register_number: { contains: options.search, mode: 'insensitive' } },
      ] }];
    }

    const students = await prisma.authedUser.findMany({
      where,
      include: {
        class: {
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
      },
      orderBy: { display_name: 'asc' },
    });

    return students.map((s: any) => ({
      id: s.uid,
      uid: s.uid,
      name: s.display_name || 'Student',
      email: s.email,
      phone: 'N/A',
      registerNumber: s.register_number || 'N/A',
      classId: s.class_id,
      className: s.class?.name || 'Unassigned',
      currentSemester: s.class?.current_semester || 1,
      programName: s.class?.batch?.program?.name || 'N/A',
      photoUrl: s.photo_url,
      status: 'ACTIVE',
      createdAt: s.created_at,
    }));
  }

  async getStudentById(hod: HODContext, studentId: string) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const student = await prisma.authedUser.findFirst({
      where: {
        uid: studentId,
        department_id: hod.departmentId,
        college_id: hod.collegeId,
        role: 'STUDENT',
        // An enrolled student's class must also resolve to the HOD's department.
        OR: [
          { class_id: null },
          { class: { batch: { program: { department_id: hod.departmentId, department: { college_id: hod.collegeId } } } } },
        ],
      },
      include: {
        class: {
          include: {
            batch: {
              include: { program: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found in your department.');
    }

    // Attendance is not loaded by this endpoint. Do not fabricate a percentage.
    const attendancePercentage = null;

    return {
      id: student.uid,
      uid: student.uid,
      name: student.display_name || 'Student',
      email: student.email,
      registerNumber: student.register_number || 'N/A',
      className: student.class?.name || 'Unassigned',
      programName: student.class?.batch?.program?.name || 'N/A',
      photoUrl: student.photo_url,
      status: 'ACTIVE',
      attendancePercentage,
      attendanceRecords: [],
      createdAt: student.created_at,
    };
  }

  // ==========================================
  // 8. SUBJECT MANAGEMENT
  // ==========================================
  async getSubjects(hod: HODContext, semesterNumber?: number) {
    const where: any = {
      department_id: hod.departmentId,
    };

    if (semesterNumber) {
      where.semester_number = Number(semesterNumber);
    }

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: [{ semester_number: 'asc' }, { code: 'asc' }],
    });

    return subjects.map((s: any) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      credits: s.credits || 3,
      semesterNumber: s.semester_number,
      semesterId: s.id,
      departmentId: s.department_id,
      status: s.is_active ? 'ACTIVE' : 'INACTIVE',
      createdAt: s.created_at,
    }));
  }

  async createSubject(hod: HODContext, data: { name: string; code: string; credits?: number; semesterNumber: number; isActive?: boolean }) {
    if (!data.name || !data.code || !data.semesterNumber) {
      throw new BadRequestError('Subject name, code, and semester number are required.');
    }

    const subject = await prisma.subject.create({
      data: {
        department_id: hod.departmentId,
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        credits: data.credits ? Number(data.credits) : 3,
        semester_number: Number(data.semesterNumber),
        is_active: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      semesterNumber: subject.semester_number,
      departmentId: subject.department_id,
      status: subject.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  async updateSubject(hod: HODContext, subjectId: string, data: { name?: string; code?: string; credits?: number; semesterNumber?: number; isActive?: boolean; status?: string }) {
    const existing = await prisma.subject.findFirst({
      where: { id: subjectId, department_id: hod.departmentId },
    });

    if (!existing) {
      throw new NotFoundError('Subject not found in your department.');
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        code: data.code !== undefined ? data.code.trim().toUpperCase() : undefined,
        credits: data.credits !== undefined ? Number(data.credits) : undefined,
        semester_number: data.semesterNumber !== undefined ? Number(data.semesterNumber) : undefined,
        is_active: data.isActive !== undefined ? data.isActive : data.status ? data.status === 'ACTIVE' : undefined,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      code: updated.code,
      credits: updated.credits,
      semesterNumber: updated.semester_number,
      departmentId: updated.department_id,
      status: updated.is_active ? 'ACTIVE' : 'INACTIVE',
    };
  }

  // ==========================================
  // 9. ACADEMIC YEARS & SEMESTERS
  // ==========================================
  async getAcademicYears(hod: HODContext) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const academicYears = await prisma.academicYear.findMany({
      where: { college_id: hod.collegeId },
      include: {
        semesters: {
          orderBy: { term_number: 'asc' },
        },
      },
      orderBy: { start_date: 'desc' },
    });

    return academicYears.map((ay: any) => ({
      id: ay.id,
      name: ay.name,
      startDate: ay.start_date,
      endDate: ay.end_date,
      isCurrent: ay.is_current,
      semesters: ay.semesters.map((s: any) => ({
        id: s.id,
        termNumber: s.term_number,
        startDate: s.start_date,
        endDate: s.end_date,
      })),
      createdAt: ay.created_at,
    }));
  }

  async getSemesters(hod: HODContext) {
    if (!hod.collegeId) throw new ForbiddenError('No college is assigned to this account.');
    const semesters = await prisma.semester.findMany({
      where: { academicYear: { college_id: hod.collegeId } },
      include: {
        academicYear: true,
      },
      orderBy: [{ academicYear: { is_current: 'desc' } }, { term_number: 'asc' }],
    });

    return semesters.map((s: any) => ({
      id: s.id,
      termNumber: s.term_number,
      startDate: s.start_date,
      endDate: s.end_date,
      academicYearId: s.academic_year_id,
      academicYearName: s.academicYear?.name,
      createdAt: s.created_at,
    }));
  }

  // ==========================================
  // 10. HOD PROFILE
  // ==========================================
  async getProfile(hod: HODContext) {
    const user = await prisma.authedUser.findUnique({
      where: { uid: hod.uid },
      include: {
        department: {
          include: { college: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found.');
    }

    const dept = user.department;

    return {
      uid: user.uid,
      id: user.uid,
      name: user.display_name || 'HOD User',
      email: user.email,
      phone: user.register_number || '+91 98765 43210',
      employeeId: user.uid.substring(0, 8).toUpperCase(),
      designation: 'Head of Department',
      departmentId: user.department_id,
      departmentName: dept?.name || 'Department',
      collegeName: dept?.college?.name || 'BIHER',
      photoUrl: user.photo_url,
      role: user.role,
      createdAt: user.created_at,
    };
  }

  async updateProfile(hod: HODContext, data: { name?: string; phone?: string; designation?: string; photoUrl?: string }) {
    const updated = await prisma.authedUser.update({
      where: { uid: hod.uid },
      data: {
        display_name: data.name !== undefined ? data.name.trim() : undefined,
        photo_url: data.photoUrl !== undefined ? data.photoUrl : undefined,
      },
      include: {
        department: {
          include: { college: true },
        },
      },
    });

    const dept = updated.department;

    return {
      uid: updated.uid,
      id: updated.uid,
      name: updated.display_name,
      email: updated.email,
      phone: data.phone || '+91 98765 43210',
      employeeId: updated.uid.substring(0, 8).toUpperCase(),
      designation: data.designation || 'Head of Department',
      departmentId: updated.department_id,
      departmentName: dept?.name || 'Department',
      collegeName: dept?.college?.name || 'BIHER',
      photoUrl: updated.photo_url,
      role: updated.role,
    };
  }

  // ==========================================
  // 11. EXTRA STUBS (Attendance, Curriculum, etc.)
  // ==========================================
  async getAttendanceSummary(hod: HODContext) {
    return {
      departmentAverage: 0,
      totalRecords: 0,
      cohorts: [],
    };
  }

  async getCurriculum(hod: HODContext) {
    return [];
  }

  async getAnnouncements(hod: HODContext) {
    return [];
  }

  async createAnnouncement(hod: HODContext, data: any) {
    return {
      id: `ann-${Date.now()}`,
      title: data.title,
      message: data.message,
      scope: data.scope,
      classification: data.classification,
      authorName: hod.displayName || 'Head of Department',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getAcademicAlerts(hod: HODContext) {
    return [];
  }
}

export const hodService = new HODService();
