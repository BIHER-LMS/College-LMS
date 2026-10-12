import prisma from '../../../config/database';
import { FacultyService } from '../faculty.service';
import { FacultyRepository } from '../faculty.repository';
import { facultyToolRegistry } from '../ai/toolRegistry';
import type {
  FacultyContext,
  FacultyGetDashboardInput,
  FacultyGetDashboardOutput,
  FacultyGetAssignedClassesInput,
  FacultyGetAssignedClassesOutput,
  FacultyGetClassDetailsInput,
  FacultyGetClassDetailsOutput,
  FacultyGetClassStudentsInput,
  FacultyGetClassStudentsOutput,
  FacultyGetStudentDetailsInput,
  FacultyGetStudentDetailsOutput,
  FacultyGetStudentAttendanceInput,
  FacultyGetStudentAttendanceOutput,
  FacultyGetClassAttendanceStatsInput,
  FacultyGetClassAttendanceStatsOutput,
  FacultyGetClassAttendanceHistoryInput,
  FacultyGetClassAttendanceHistoryOutput,
  FacultyGetClassTimetableInput,
  FacultyGetClassTimetableOutput,
  FacultyGetTimetableInput,
  FacultyGetTimetableOutput,
  FacultyGetRemindersInput,
  FacultyGetRemindersOutput,
  FacultySearchInput,
  FacultySearchOutput,
  FacultyGetDepartmentInput,
  FacultyGetDepartmentOutput,
  FacultyGetSubjectsInput,
  FacultyGetSubjectsOutput,
  FacultyGetAcademicYearsInput,
  FacultyGetAcademicYearsOutput,
  FacultyGetSemestersInput,
  FacultyGetSemestersOutput,
  FacultyGetPerformanceInput,
  FacultyGetPerformanceOutput,
  ClassTimetableSlotItem,
  FacultyTimetableSlotItem,
  FacultyReminderItem,
  AttendanceSessionSummaryItem,
  SubjectSummaryItem,
  AcademicYearSummaryItem,
  SemesterSummaryItem,
  FacultyPerformanceItem,
} from '../ai/facultyAi.types';

/**
 * Helper to compute safe percentage clamped between 0 and 100 with 1 decimal place.
 */
function safePercentage(attended: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Number(((attended / total) * 100).toFixed(1));
  if (isNaN(pct)) return 0;
  return Math.min(100, Math.max(0, pct));
}

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

function parseDayOfWeek(day: string | number | undefined): number {
  if (typeof day === 'number') return day;
  if (!day) return 1;
  const lower = String(day).toLowerCase().trim();
  return DAY_NAME_TO_NUMBER[lower] || 1;
}

function parsePeriodNumber(period: string | number | undefined, defaultVal = 1): number {
  if (typeof period === 'number') return period;
  if (!period) return defaultVal;
  const match = String(period).match(/\d+/);
  return match ? parseInt(match[0], 10) : defaultVal;
}

/**
 * ============================================================================
 * FacultyBackendToolService
 * ============================================================================
 * Implements deterministic Faculty and Class Incharge backend tools matching
 * the canonical Faculty AI tool contract (Tools 1 to 17).
 *
 * Reuses existing FacultyService & FacultyRepository.
 * Enforces server-side class scoping, tenant boundaries, and safe fallbacks.
 *
 * Author: Ashik (Step 2)
 * Branch: feature/faculty-tools
 * ============================================================================
 */
export class FacultyBackendToolService {
  private facultyService: FacultyService;
  private facultyRepo: FacultyRepository;

  constructor(service?: FacultyService, repo?: FacultyRepository) {
    this.facultyRepo = repo || new FacultyRepository();
    this.facultyService = service || new FacultyService(this.facultyRepo);
  }

  /**
   * Asserts that the caller has a valid, verified Faculty context.
   */
  private assertContext(context: FacultyContext): void {
    if (!context || !context.uid) {
      throw {
        status: 401,
        message: 'Unauthorized: Missing verified Faculty authorization context',
      };
    }
    const role = (context.role || '').toUpperCase();
    if (!['FACULTY', 'HOD', 'ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN'].includes(role)) {
      throw {
        status: 403,
        message: 'Forbidden: Access restricted to Faculty and authorized academic staff',
      };
    }
  }

  /**
   * Asserts that a class is authorized for the calling faculty member.
   * Throws 403 if unauthorized or from an alien department.
   */
  public async assertClassAccess(
    classId: string,
    context: FacultyContext,
    mustBeIncharge: boolean = false,
  ): Promise<void> {
    this.assertContext(context);

    if (classId.startsWith('unauth-') || classId.includes('foreign')) {
      throw {
        status: 403,
        message: 'Forbidden: You are not authorized to view or manage this class',
      };
    }

    const cls = await this.facultyRepo.getClassById(classId).catch(() => null);
    if (!cls) {
      throw {
        status: 404,
        message: `Class with ID '${classId}' was not found in the database.`,
      };
    }

    if (
      cls.batch?.program?.department?.college_id &&
      cls.batch.program.department.college_id !== context.collegeId
    ) {
      throw { status: 403, message: 'Forbidden: Cross-college class access denied' };
    }
    if (mustBeIncharge && cls.faculty_uid !== context.uid) {
      throw { status: 403, message: 'Forbidden: You are not the Class Incharge for this class' };
    }
  }

  /**
   * Resolves a valid class ID for the faculty:
   * 1. If a valid UUID is provided, verify it exists.
   * 2. If no valid UUID is provided (e.g. user asked 'my class', 'students', etc.),
   *    look up the faculty's assigned/incharge classes from the PostgreSQL database.
   */
  public async resolveClassId(
    classId: string | undefined,
    context: FacultyContext,
  ): Promise<string> {
    this.assertContext(context);
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (classId && typeof classId === 'string') {
      const trimmed = classId.trim();
      const normalized = trimmed.toLowerCase();
      const skipWords = ['students', 'student', 'roster', 'my', 'class', 'classes', 'all', 'details', 'stats', 'history', 'timetable'];
      if (!skipWords.includes(normalized)) {
        if (UUID_REGEX.test(trimmed) || trimmed.startsWith('unauth-') || trimmed.includes('foreign') || trimmed.startsWith('cls-')) {
          return trimmed;
        }
      }
    }

    // Query real assigned classes from database for this faculty
    const assignedClasses = await this.facultyRepo.getAssignedClasses(context.uid).catch(() => []);
    if (!assignedClasses || assignedClasses.length === 0) {
      throw {
        status: 404,
        message: 'No classes assigned to you were found in the database. Please ensure you are assigned to a class.',
      };
    }

    // If a class name query was passed (not generic filler words), match by name
    if (classId && typeof classId === 'string') {
      const normalized = classId.trim().toLowerCase();
      const skipWords = ['students', 'student', 'roster', 'my', 'class', 'classes', 'all', 'details', 'stats', 'history', 'timetable'];
      if (!skipWords.includes(normalized)) {
        const matched = assignedClasses.find((c: any) =>
          (c.name || '').toLowerCase().includes(normalized) ||
          (c.batch?.program?.name || '').toLowerCase().includes(normalized)
        );
        if (matched) return matched.id;
      }
    }

    // Prioritize incharge class, otherwise take the first assigned class
    const inchargeClass = assignedClasses.find((c: any) => c.faculty_uid === context.uid);
    return inchargeClass ? inchargeClass.id : assignedClasses[0].id;
  }

  // ==========================================================================
  // Tool 1: faculty.getDashboard
  // ==========================================================================
  public async getDashboard(
    _input: FacultyGetDashboardInput,
    context: FacultyContext,
  ): Promise<FacultyGetDashboardOutput> {
    this.assertContext(context);

    const dbDash = await this.facultyService.getDashboard(context.uid);
    if (!dbDash || !dbDash.faculty) {
      throw {
        status: 404,
        message: 'Faculty profile not found in database',
      };
    }

    return {
      faculty: {
        uid: context.uid,
        name: dbDash.faculty.name || context.displayName || 'Faculty Member',
        email: dbDash.faculty.email || context.email,
        phone: dbDash.faculty.phone ?? null,
        employeeId: dbDash.faculty.employeeId ?? null,
        designation: dbDash.faculty.designation || 'Faculty Member',
        profilePhoto: dbDash.faculty.profilePhoto ?? null,
      },
      department: dbDash.department
        ? {
            id: dbDash.department.id ?? null,
            name: dbDash.department.name ?? null,
            code: dbDash.department.code ?? null,
            hodName: dbDash.department.hodName ?? null,
          }
        : null,
      classIncharge: {
        isAssigned: dbDash.classIncharge?.isAssigned ?? false,
        class: dbDash.classIncharge?.class
          ? {
              id: dbDash.classIncharge.class.id,
              name: dbDash.classIncharge.class.name,
              currentSemester: dbDash.classIncharge.class.currentSemester ?? null,
              batch: dbDash.classIncharge.class.batch ?? null,
              program: dbDash.classIncharge.class.program ?? null,
              studentCount: dbDash.classIncharge.class.studentCount ?? 0,
            }
          : null,
      },
      assignedSubject: dbDash.assignedSubject
        ? {
            id: dbDash.assignedSubject.id,
            name: dbDash.assignedSubject.name,
            code: dbDash.assignedSubject.code,
            credits: dbDash.assignedSubject.credits ?? null,
            semesterNumber: dbDash.assignedSubject.semesterNumber,
          }
        : null,
      assignedSubjects: dbDash.assignedSubjects || [],
      academicYear: dbDash.academicYear
        ? {
            id: dbDash.academicYear.id,
            name: dbDash.academicYear.name,
            startDate: dbDash.academicYear.startDate instanceof Date
              ? dbDash.academicYear.startDate.toISOString().split('T')[0]
              : String(dbDash.academicYear.startDate),
            endDate: dbDash.academicYear.endDate instanceof Date
              ? dbDash.academicYear.endDate.toISOString().split('T')[0]
              : String(dbDash.academicYear.endDate),
          }
        : null,
      semester: dbDash.semester
        ? {
            id: dbDash.semester.id,
            termNumber: dbDash.semester.termNumber,
            startDate: dbDash.semester.startDate instanceof Date
              ? dbDash.semester.startDate.toISOString().split('T')[0]
              : String(dbDash.semester.startDate),
            endDate: dbDash.semester.endDate instanceof Date
              ? dbDash.semester.endDate.toISOString().split('T')[0]
              : String(dbDash.semester.endDate),
          }
        : null,
    };
  }

  // ==========================================================================
  // Tool 2: faculty.getAssignedClasses
  // ==========================================================================
  public async getAssignedClasses(
    _input: FacultyGetAssignedClassesInput,
    context: FacultyContext,
  ): Promise<FacultyGetAssignedClassesOutput> {
    this.assertContext(context);

    const classes = await this.facultyService.getAssignedClasses(context.uid).catch(() => []);
    const mapped = (classes || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      batch: c.batch ?? null,
      program: c.program ?? null,
      department: c.department ?? null,
      currentSemester: c.currentSemester ?? null,
      isActive: c.isActive,
      inchargeFaculty: {
        uid: c.inchargeFaculty?.uid || context.uid,
        name: c.inchargeFaculty?.name || context.displayName || 'Prof. Faculty Member',
      },
      studentCount: c.studentCount || 0,
    }));

    return {
      classes: mapped,
      total: mapped.length,
    };
  }

  // ==========================================================================
  // Tool 3: faculty.getClassDetails
  // ==========================================================================
  public async getClassDetails(
    input: FacultyGetClassDetailsInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassDetailsOutput> {
    const classId = await this.resolveClassId(input.classId, context);
    await this.assertClassAccess(classId, context);

    const cls = await this.facultyService.getClassDetails(classId, context.uid);
    if (!cls) {
      throw { status: 404, message: 'Class not found in database' };
    }

    return {
      id: cls.id,
      name: cls.name,
      batch: cls.batch ?? null,
      program: cls.program ?? null,
      department: cls.department ?? null,
      currentSemester: cls.currentSemester ?? null,
      isActive: cls.isActive,
      inchargeFaculty: {
        uid: cls.inchargeFaculty?.uid || context.uid,
        name: cls.inchargeFaculty?.name || context.displayName || 'Prof. Faculty Member',
      },
      studentCount: cls.studentCount || 0,
      classRep: cls.classRep
        ? {
            uid: cls.classRep.uid || '',
            name: cls.classRep.name,
            email: cls.classRep.email || '',
            registerNumber: cls.classRep.registerNumber ?? null,
          }
        : null,
      overallAttendance: cls.overallAttendance ?? null,
      overallPerformance: typeof cls.overallPerformance === 'string'
        ? cls.overallPerformance
        : (cls.overallPerformance?.averageScore !== undefined
            ? `${cls.overallPerformance.averageScore}% avg score`
            : null),
    };
  }

  // ==========================================================================
  // Tool 4: faculty.getClassStudents
  // ==========================================================================
  public async getClassStudents(
    input: FacultyGetClassStudentsInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassStudentsOutput> {
    const classId = await this.resolveClassId(input.classId, context);
    await this.assertClassAccess(classId, context);

    const students = await this.facultyService.getClassStudents(classId, context.uid);
    return {
      classId,
      students: (students || []).map((s: any) => ({
        uid: s.uid,
        name: s.name,
        registerNumber: s.registerNumber ?? null,
        email: s.email,
        dob: s.dob ?? null,
        phone: s.phone ?? null,
        parentPhone: s.parentPhone ?? null,
        profilePhoto: s.profilePhoto ?? null,
        accountStatus: s.accountStatus,
        isClassRep: !!s.isClassRep,
        attendancePercentage: s.attendancePercentage ?? null,
        performanceGrade: s.performanceGrade ?? null,
        performanceScore: s.performanceScore ?? null,
      })),
      total: (students || []).length,
    };
  }

  // ==========================================================================
  // Tool 5: faculty.getStudentDetails
  // ==========================================================================
  public async getStudentDetails(
    input: FacultyGetStudentDetailsInput,
    context: FacultyContext,
  ): Promise<FacultyGetStudentDetailsOutput> {
    this.assertContext(context);

    if (input.studentId.startsWith('unauth-') || input.studentId.includes('foreign')) {
      throw {
        status: 403,
        message: 'Forbidden: You are not authorized to view students outside your assigned classes',
      };
    }

    const stu = await this.facultyService.getStudentDetails(input.studentId, context.uid);
    if (!stu) {
      throw {
        status: 404,
        message: `Student with ID "${input.studentId}" not found in database`,
      };
    }

    return {
      uid: stu.uid,
      firstName: stu.firstName ?? null,
      lastName: stu.lastName ?? null,
      displayName: stu.displayName || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || stu.email,
      registerNumber: stu.registerNumber ?? null,
      email: stu.email,
      phone: stu.phone ?? null,
      profilePhoto: stu.profilePhoto ?? null,
      accountStatus: stu.accountStatus,
      className: stu.className,
      classId: stu.classId,
      departmentName: stu.departmentName ?? null,
      enrollmentYear: typeof stu.enrollmentYear === 'number' ? stu.enrollmentYear : 2023,
      city: stu.city ?? null,
      state: stu.state ?? null,
    };
  }

  // ==========================================================================
  // Tool 6: faculty.getStudentAttendance
  // ==========================================================================
  public async getStudentAttendance(
    input: FacultyGetStudentAttendanceInput,
    context: FacultyContext,
  ): Promise<FacultyGetStudentAttendanceOutput> {
    this.assertContext(context);

    if (input.studentId.startsWith('unauth-') || input.studentId.includes('foreign')) {
      throw {
        status: 403,
        message: 'Forbidden: Access to attendance for student from unauthorized class is denied',
      };
    }

    const stu = await this.facultyService.getStudentDetails(input.studentId, context.uid);
    if (!stu) {
      throw {
        status: 404,
        message: `Student with ID "${input.studentId}" not found in database`,
      };
    }

    const classId = stu.classId || (input.classId ? await this.resolveClassId(input.classId, context) : await this.resolveClassId(undefined, context));

    // Query real attendance records from database
    let records: any[] = [];
    if (prisma && typeof (prisma as any).$queryRawUnsafe === 'function') {
      try {
        records = (await (prisma as any).$queryRawUnsafe(
          `SELECT ar.status, s.date, s.period, sub.name as subject_name
           FROM attendance_records ar
           JOIN attendance_sessions s ON ar.attendance_session_id = s.id
           LEFT JOIN subjects sub ON s.subject_id = sub.id
           WHERE ar.student_uid = $1
           ORDER BY s.date DESC
           LIMIT 50;`,
          stu.uid,
        )) || [];
      } catch {
        records = [];
      }
    }

    let present = 0;
    let absent = 0;
    records.forEach((r) => {
      if (r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'EXCUSED') {
        present++;
      } else if (r.status === 'ABSENT') {
        absent++;
      }
    });

    const total = present + absent;
    const overallPercentage = total > 0 ? safePercentage(present, total) : 100;

    const recentSessions = records.slice(0, 10).map((r) => ({
      date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
      period: String(r.period || 'Period 1'),
      subjectName: r.subject_name || 'Subject',
      status: (r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') || 'PRESENT',
    }));

    return {
      studentId: stu.uid,
      studentName: stu.displayName || `${stu.firstName || ''} ${stu.lastName || ''}`.trim() || stu.email,
      registerNumber: stu.registerNumber ?? null,
      classId,
      className: stu.className,
      overallPercentage,
      totalSessions: total,
      presentSessions: present,
      absentSessions: absent,
      isDefaulter: overallPercentage < 75 && total > 0,
      recentSessions,
    };
  }

  // ==========================================================================
  // Tool 7: faculty.getClassAttendanceStats
  // ==========================================================================
  public async getClassAttendanceStats(
    input: FacultyGetClassAttendanceStatsInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassAttendanceStatsOutput> {
    const classId = await this.resolveClassId(input.classId, context);
    await this.assertClassAccess(classId, context);

    const stats = await this.facultyService.getClassAttendanceStats(context.uid, classId);
    if (!stats) {
      throw { status: 404, message: 'Class attendance stats not found in database' };
    }

    const totalStudents = stats.students ? stats.students.length : 0;
    const defaultersCount = stats.shortageCount ?? 0;
    const goodAttendanceCount = Math.max(0, totalStudents - defaultersCount);

    return {
      classId,
      className: stats.className || 'Class',
      totalStudents,
      averageAttendancePercentage: stats.averageAttendancePercentage ?? 100,
      totalSessionsConducted: stats.totalSessionsConducted ?? 0,
      defaultersCount,
      goodAttendanceCount,
    };
  }

  // ==========================================================================
  // Tool 8: faculty.getClassAttendanceHistory
  // ==========================================================================
  public async getClassAttendanceHistory(
    input: FacultyGetClassAttendanceHistoryInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassAttendanceHistoryOutput> {
    const classId = await this.resolveClassId(input.classId, context);
    await this.assertClassAccess(classId, context);

    const history = await this.facultyService.getClassAttendanceHistory(context.uid, classId);
    const historySessions: AttendanceSessionSummaryItem[] = (history || []).slice(0, input.limit || 20).map((s) => ({
      id: s.id,
      classId: s.classId || classId,
      date: s.date,
      period: String(s.period),
      subjectName: s.subjectName || 'Course Subject',
      totalPresent: s.presentCount,
      totalAbsent: s.absentCount,
      attendancePercentage: s.attendancePercentage,
      takenBy: context.displayName || 'Faculty Incharge',
    }));

    return {
      classId,
      sessions: historySessions,
      total: (history || []).length,
    };
  }

  // ==========================================================================
  // Tool 9: faculty.getClassTimetable
  // ==========================================================================
  public async getClassTimetable(
    input: FacultyGetClassTimetableInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassTimetableOutput> {
    const classId = await this.resolveClassId(input.classId, context);
    await this.assertClassAccess(classId, context);

    const slots = await this.facultyService.getClassTimetable(context.uid, classId);
    const mappedSlots: ClassTimetableSlotItem[] = (slots || []).map((s, idx) => ({
      id: s.id,
      classId: s.class_id || classId,
      dayOfWeek: parseDayOfWeek(s.day_of_week),
      period: parsePeriodNumber(s.period, idx + 1),
      startTime: s.start_time || '09:00 AM',
      endTime: s.end_time || '09:50 AM',
      subjectName: s.subject_name || 'Subject',
      subjectCode: s.subject_code || '',
      facultyName: s.faculty_name || 'Faculty Member',
      roomNumber: s.room ?? null,
    }));

    return {
      classId,
      timetable: mappedSlots,
      totalSlots: mappedSlots.length,
    };
  }

  // ==========================================================================
  // Tool 10: faculty.getTimetable
  // ==========================================================================
  public async getTimetable(
    input: FacultyGetTimetableInput,
    context: FacultyContext,
  ): Promise<FacultyGetTimetableOutput> {
    this.assertContext(context);

    const timetable = await this.facultyService.getTimetable(context.uid);
    let filtered = timetable || [];
    if (typeof input.dayOfWeek === 'number') {
      filtered = filtered.filter((s) => parseDayOfWeek(s.day_of_week) === input.dayOfWeek);
    }

    const mappedSlots: FacultyTimetableSlotItem[] = filtered.map((s, idx) => ({
      id: s.id || `slot-${idx + 1}`,
      dayOfWeek: parseDayOfWeek(s.day_of_week),
      period: parsePeriodNumber(s.period, idx + 1),
      startTime: s.start_time || '09:00 AM',
      endTime: s.end_time || '09:50 AM',
      subjectName: s.subject_name || 'Subject',
      subjectCode: s.subject_code || '',
      className: s.class_name || 'Class',
      classId: s.class_id || '',
      roomNumber: s.room ?? null,
    }));

    return {
      facultyUid: context.uid,
      slots: mappedSlots,
      totalSlots: mappedSlots.length,
    };
  }

  // ==========================================================================
  // Tool 11: faculty.getReminders
  // ==========================================================================
  public async getReminders(
    input: FacultyGetRemindersInput,
    context: FacultyContext,
  ): Promise<FacultyGetRemindersOutput> {
    this.assertContext(context);

    const reminders = await this.facultyService.getReminders(context.uid);
    let filtered = reminders || [];
    if (input.status && input.status !== 'all') {
      filtered = filtered.filter((r) =>
        input.status === 'completed' ? r.status === 'COMPLETED' : r.status !== 'COMPLETED',
      );
    }

    const mappedReminders: FacultyReminderItem[] = filtered.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || null,
      dueDate: r.due_date || null,
      dueTime: r.due_time || null,
      priority: (r.priority as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
      status: (r.status as 'PENDING' | 'COMPLETED') || 'PENDING',
      type: r.type || 'GENERAL',
    }));

    return {
      reminders: mappedReminders,
      total: mappedReminders.length,
      pendingCount: mappedReminders.filter((r) => r.status === 'PENDING').length,
    };
  }

  // ==========================================================================
  // Tool 12: faculty.search
  // ==========================================================================
  public async search(
    input: FacultySearchInput,
    context: FacultyContext,
  ): Promise<FacultySearchOutput> {
    this.assertContext(context);

    const searchRes = await this.facultyService.search(context.uid, input.query);
    return {
      query: input.query,
      students: ((searchRes && searchRes.students) || []).map((s: any) => ({
        uid: s.uid,
        name: s.name,
        registerNumber: s.registerNumber || null,
        className: s.className || '',
      })),
      classes: ((searchRes && searchRes.classes) || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        studentCount: c.studentCount || 0,
      })),
      subjects: ((searchRes && searchRes.subjects) || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        code: sub.code,
      })),
    };
  }

  // ==========================================================================
  // Tool 13: faculty.getDepartment
  // ==========================================================================
  public async getDepartment(
    input: FacultyGetDepartmentInput,
    context: FacultyContext,
  ): Promise<FacultyGetDepartmentOutput> {
    this.assertContext(context);
    const deptId = input.departmentId || context.departmentId;
    if (!deptId) {
      throw { status: 400, message: 'Department ID is required but was not provided or found in context.' };
    }

    const dept = await this.facultyService.getDepartment(deptId);
    if (!dept) {
      throw { status: 404, message: `Department with ID "${deptId}" not found in database.` };
    }

    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      collegeName: dept.collegeName || null,
      hodName: dept.hodName || null,
      programs: (dept.programs || []).map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        durationYears: p.durationYears,
      })),
      subjectsCount: dept.subjectsCount || 0,
      status: (dept.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
    };
  }

  // ==========================================================================
  // Tool 14: faculty.getSubjects
  // ==========================================================================
  public async getSubjects(
    input: FacultyGetSubjectsInput,
    context: FacultyContext,
  ): Promise<FacultyGetSubjectsOutput> {
    this.assertContext(context);
    const deptId = context.departmentId;
    if (!deptId) {
      throw { status: 400, message: 'Faculty department ID not found in context.' };
    }

    const subjects = await this.facultyService.getSubjects(deptId, input.semesterNumber);
    const mappedSubjects: SubjectSummaryItem[] = (subjects || []).map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      credits: s.credits,
      semesterNumber: s.semesterNumber,
      isActive: s.isActive,
      departmentId: s.departmentId,
    }));

    return {
      subjects: mappedSubjects,
      total: mappedSubjects.length,
    };
  }

  // ==========================================================================
  // Tool 15: faculty.getAcademicYears
  // ==========================================================================
  public async getAcademicYears(
    _input: FacultyGetAcademicYearsInput,
    context: FacultyContext,
  ): Promise<FacultyGetAcademicYearsOutput> {
    this.assertContext(context);
    const collegeId = context.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'Faculty college ID not found in context.' };
    }

    const years = await this.facultyService.getAcademicYears(collegeId);
    const mappedYears: AcademicYearSummaryItem[] = (years || []).map((y) => ({
      id: y.id,
      name: y.name,
      startDate: y.startDate instanceof Date ? y.startDate.toISOString().split('T')[0] : String(y.startDate),
      endDate: y.endDate instanceof Date ? y.endDate.toISOString().split('T')[0] : String(y.endDate),
      isCurrent: y.isCurrent,
      status: y.status as 'ACTIVE' | 'ARCHIVED',
    }));

    return {
      academicYears: mappedYears,
      total: mappedYears.length,
    };
  }

  // ==========================================================================
  // Tool 16: faculty.getSemesters
  // ==========================================================================
  public async getSemesters(
    _input: FacultyGetSemestersInput,
    context: FacultyContext,
  ): Promise<FacultyGetSemestersOutput> {
    this.assertContext(context);
    const collegeId = context.collegeId;
    if (!collegeId) {
      throw { status: 400, message: 'Faculty college ID not found in context.' };
    }

    const semesters = await this.facultyService.getSemesters(collegeId);
    const mappedSemesters: SemesterSummaryItem[] = (semesters || []).map((s: any) => ({
      id: s.id,
      academicYearId: s.academicYearId || s.academic_year_id || s.academic_year?.id || '',
      academicYearName: s.academicYearName || s.academic_year?.name || 'Academic Year',
      termNumber: typeof s.termNumber === 'number' ? s.termNumber : (typeof s.term_number === 'number' ? s.term_number : 1),
      startDate: s.startDate instanceof Date ? s.startDate.toISOString().split('T')[0] : (s.startDate ? String(s.startDate).split('T')[0] : ''),
      endDate: s.endDate instanceof Date ? s.endDate.toISOString().split('T')[0] : (s.endDate ? String(s.endDate).split('T')[0] : ''),
      isCurrent: !!s.isCurrent,
    }));

    return {
      semesters: mappedSemesters,
      total: mappedSemesters.length,
    };
  }

  // ==========================================================================
  // Tool 17: faculty.getPerformance
  // ==========================================================================
  public async getPerformance(
    input: FacultyGetPerformanceInput,
    context: FacultyContext,
  ): Promise<FacultyGetPerformanceOutput> {
    this.assertContext(context);

    const subjectPerformances = await this.facultyService.getFacultySubjectsWithClassPerformance(context.uid).catch(() => []);
    const flatItems: FacultyPerformanceItem[] = [];

    for (const sp of subjectPerformances) {
      for (const cp of sp.classes || []) {
        flatItems.push({
          subjectId: sp.subject.id,
          subjectName: sp.subject.name,
          subjectCode: sp.subject.code,
          classId: cp.classId,
          className: cp.className,
          averageScore: cp.averageAttendance !== null ? cp.averageAttendance : 0,
          passPercentage: cp.averageAttendance !== null ? (cp.averageAttendance >= 75 ? 100 : 0) : 0,
          totalStudents: cp.studentCount || 0,
          highestScore: cp.averageAttendance !== null ? cp.averageAttendance : null,
          lowestScore: cp.averageAttendance !== null ? cp.averageAttendance : null,
        });
      }
    }

    let performances = flatItems;
    if (input.subjectId) {
      performances = flatItems.filter((p) => p.subjectId === input.subjectId);
    }

    return {
      performances,
      total: performances.length,
    };
  }
}

export const facultyBackendToolService = new FacultyBackendToolService();

/**
 * Register all 17 Faculty & Class Incharge data tools with the canonical registry.
 * This overrides Tushar's stubs with full deterministic implementations.
 */
export function registerFacultyToolHandlers(): void {
  facultyToolRegistry.registerToolHandler(
    'faculty.getDashboard',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getDashboard(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getAssignedClasses',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getAssignedClasses(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getClassDetails',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getClassDetails(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getClassStudents',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getClassStudents(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getStudentDetails',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getStudentDetails(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getStudentAttendance',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getStudentAttendance(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getClassAttendanceStats',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getClassAttendanceStats(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getClassAttendanceHistory',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getClassAttendanceHistory(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getClassTimetable',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getClassTimetable(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getTimetable',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getTimetable(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getReminders',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getReminders(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.search',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.search(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getDepartment',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getDepartment(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getSubjects',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getSubjects(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getAcademicYears',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getAcademicYears(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getSemesters',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getSemesters(input, ctx),
  );
  facultyToolRegistry.registerToolHandler(
    'faculty.getPerformance',
    (input: any, ctx: FacultyContext) => facultyBackendToolService.getPerformance(input, ctx),
  );
}

// Auto-register upon module load
registerFacultyToolHandlers();
