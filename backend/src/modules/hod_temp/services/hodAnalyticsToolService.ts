import { prisma } from '../config/db';
import type { HODContext } from '../middleware/authMiddleware';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { hodToolRegistry } from '../ai/toolRegistry';
import type {
  HodAttendanceSummaryInput,
  HodAttendanceSummaryOutput,
  CohortAttendanceSummary,
  HodStudentAttendanceInput,
  HodStudentAttendanceOutput,
  SubjectAttendanceItem,
  HodClassAttendanceInput,
  HodClassAttendanceOutput,
  AtRiskStudentItem,
  HodDepartmentAttendanceInput,
  HodDepartmentAttendanceOutput,
  ClassAttendanceSummaryItem,
  HodAttendanceAnalyticsInput,
  HodAttendanceAnalyticsOutput,
  AttendanceTrendPoint,
  DefaulterBuckets,
} from '../ai/hodAi.types';

/**
 * Helper to compute safe percentage clamped between 0 and 100 with 1 decimal place.
 */
function safePercentage(attended: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = Number(((attended / total) * 100).toFixed(1));
  if (isNaN(pct)) return 0;
  return Math.min(100, Math.max(0, pct));
}

/**
 * ============================================================================
 * HodAnalyticsToolService
 * ============================================================================
 * Implements deterministic attendance and analytics backend tools matching
 * the canonical HOD AI tool contract (Tools 1 to 5).
 * 
 * Author: Varun (Step 2)
 * Branch: feature/hod-analytics-tools
 * ============================================================================
 */
export class HodAnalyticsToolService {
  /**
   * Enforce verified HOD authorization context and tenant boundaries.
   */
  private assertContext(context: HODContext): void {
    if (!context || !context.departmentId || !context.collegeId) {
      throw new ForbiddenError(
        'Missing verified departmental or institutional authorization context',
      );
    }
    const role = (context.role || '').toUpperCase();
    if (!['HOD', 'ADMIN', 'COLLEGE_ADMIN'].includes(role)) {
      throw new ForbiddenError('Unauthorized: HOD role required');
    }
  }

  // ==========================================================================
  // Tool 1: hod.getAttendanceSummary
  // ==========================================================================
  async getAttendanceSummary(
    input: HodAttendanceSummaryInput,
    context: HODContext,
  ): Promise<HodAttendanceSummaryOutput> {
    this.assertContext(context);

    // 1. Validate batchId tenant scope if provided
    if (input.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: input.batchId },
        include: { program: true },
      });
      if (!batch) {
        throw new NotFoundError(`Batch not found: ${input.batchId}`);
      }
      if (batch.program.department_id !== context.departmentId) {
        throw new ForbiddenError(
          `Tenant violation: batch ${input.batchId} belongs to another department`,
        );
      }
    }

    // 2. Validate classId tenant scope if provided
    if (input.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: input.classId },
        include: { batch: { include: { program: true } } },
      });
      if (!cls) {
        throw new NotFoundError(`Class not found: ${input.classId}`);
      }
      if (cls.batch.program.department_id !== context.departmentId) {
        throw new ForbiddenError(
          `Tenant violation: class ${input.classId} belongs to another department`,
        );
      }
    }

    // 3. Query all active batches in the HOD's department
    const batches = await prisma.batch.findMany({
      where: {
        program: { department_id: context.departmentId },
        ...(input.batchId ? { id: input.batchId } : {}),
        is_active: true,
      },
      include: {
        program: true,
        classes: {
          where: {
            is_active: true,
            ...(input.classId ? { id: input.classId } : {}),
          },
          include: {
            students: {
              where: {
                role: 'STUDENT',
                college_id: context.collegeId,
                department_id: context.departmentId,
              },
              select: { uid: true },
            },
          },
        },
      },
      orderBy: { start_year: 'desc' },
    });

    const cohortNames = [
      'Year 1 Freshmen',
      'Year 2 Sophomores',
      'Year 3 Juniors',
      'Year 4 Seniors',
    ];

    const cohorts: CohortAttendanceSummary[] = [];
    let deptTotalRecords = 0;
    let deptAttendedRecords = 0;
    let totalStudents = 0;
    let totalClasses = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const classIds = batch.classes.map((c) => c.id);
      const studentCount = batch.classes.reduce(
        (sum, c) => sum + c.students.length,
        0,
      );
      totalStudents += studentCount;
      totalClasses += batch.classes.length;

      let batchTotal = 0;
      let batchAttended = 0;

      if (classIds.length > 0) {
        try {
          const rawResult: any = await prisma.$queryRawUnsafe(
            `SELECT 
               COUNT(ar.id)::int as total_records,
               COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended_records
             FROM attendance_sessions s
             JOIN attendance_records ar ON ar.attendance_session_id = s.id
             WHERE s.class_id = ANY($1::uuid[])
               AND ($2::date IS NULL OR s.date >= $2::date)
               AND ($3::date IS NULL OR s.date <= $3::date);`,
            classIds,
            input.startDate || null,
            input.endDate || null,
          );
          if (rawResult && rawResult[0]) {
            batchTotal = rawResult[0].total_records || 0;
            batchAttended = rawResult[0].attended_records || 0;
          }
        } catch {
          // If raw tables have not been populated, total remains 0
          batchTotal = 0;
          batchAttended = 0;
        }
      }

      deptTotalRecords += batchTotal;
      deptAttendedRecords += batchAttended;

      const cohortPct = safePercentage(batchAttended, batchTotal);
      const cohortName =
        cohortNames[i] || `${batch.program.name} (${batch.start_year}-${batch.end_year})`;

      cohorts.push({
        cohortName,
        batchId: batch.id,
        percentage: cohortPct,
        studentCount,
        isAlert: cohortPct < 75,
      });
    }

    const departmentAverage =
      deptTotalRecords > 0
        ? safePercentage(deptAttendedRecords, deptTotalRecords)
        : cohorts.length > 0
          ? Number(
              (
                cohorts.reduce((sum, c) => sum + c.percentage, 0) /
                cohorts.length
              ).toFixed(1),
            )
          : 0;

    return {
      departmentId: context.departmentId,
      departmentAverage,
      totalStudents,
      totalClasses,
      cohorts,
      dateRange: {
        startDate: input.startDate || null,
        endDate: input.endDate || null,
      },
    };
  }

  // ==========================================================================
  // Tool 2: hod.getStudentAttendance
  // ==========================================================================
  async getStudentAttendance(
    input: HodStudentAttendanceInput,
    context: HODContext,
  ): Promise<HodStudentAttendanceOutput> {
    this.assertContext(context);

    if (!input.studentId) {
      throw new BadRequestError('studentId is required');
    }

    // 1. Locate student across system to verify tenant boundaries
    const student = await prisma.authedUser.findFirst({
      where: {
        OR: [
          { uid: input.studentId },
          { register_number: input.studentId },
        ],
      },
      include: {
        class: true,
      },
    });

    if (!student) {
      throw new NotFoundError(
        `Student "${input.studentId}" not found in system`,
      );
    }

    // Tenant and Department Isolation Enforcement
    if (student.college_id !== context.collegeId) {
      throw new ForbiddenError(
        `Access denied: student belongs to another institution`,
      );
    }
    if (student.department_id !== context.departmentId) {
      throw new ForbiddenError(
        `Access denied: student belongs to another department`,
      );
    }

    // 2. Validate subjectId scope if provided
    if (input.subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: input.subjectId },
      });
      if (!subject) {
        throw new NotFoundError(`Subject not found: ${input.subjectId}`);
      }
      if (subject.department_id !== context.departmentId) {
        throw new ForbiddenError(
          `Tenant violation: subject ${input.subjectId} belongs to another department`,
        );
      }
    }

    // 3. Query all department subjects applicable to this student
    const subjects = await prisma.subject.findMany({
      where: {
        department_id: context.departmentId,
        ...(input.subjectId ? { id: input.subjectId } : {}),
        is_active: true,
      },
      orderBy: { code: 'asc' },
    });

    // 4. Query live attendance records for this student
    const subjectAttendanceMap = new Map<
      string,
      { attended: number; total: number }
    >();

    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT 
           s.subject_id,
           COUNT(ar.id)::int as total,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.attendance_session_id = s.id
         WHERE ar.student_uid = $1
           AND ($2::uuid IS NULL OR s.subject_id = $2::uuid)
           AND ($3::date IS NULL OR s.date >= $3::date)
           AND ($4::date IS NULL OR s.date <= $4::date)
         GROUP BY s.subject_id;`,
        student.uid,
        input.subjectId || null,
        input.startDate || null,
        input.endDate || null,
      );

      for (const row of rows || []) {
        subjectAttendanceMap.set(row.subject_id, {
          total: row.total || 0,
          attended: row.attended || 0,
        });
      }
    } catch {
      // Table may be empty or unmigrated in test environments
    }

    let overallTotal = 0;
    let overallAttended = 0;

    const subjectItems: SubjectAttendanceItem[] = subjects.map((sub) => {
      const stats = subjectAttendanceMap.get(sub.id) || {
        attended: 0,
        total: 0,
      };
      overallTotal += stats.total;
      overallAttended += stats.attended;

      return {
        subjectId: sub.id,
        subjectCode: sub.code,
        subjectName: sub.name,
        percentage: safePercentage(stats.attended, stats.total),
        attended: stats.attended,
        total: stats.total,
      };
    });

    const overallPercentage = safePercentage(overallAttended, overallTotal);

    return {
      studentId: student.uid,
      studentName: student.display_name || 'Unnamed Student',
      registerNumber: student.register_number || 'N/A',
      classId: student.class?.id || student.class_id || 'unassigned',
      className: student.class?.name || 'Unassigned Class',
      overallPercentage,
      isLowAttendance: overallPercentage < 75,
      totalSessions: overallTotal,
      attendedSessions: overallAttended,
      subjects: subjectItems,
    };
  }

  // ==========================================================================
  // Tool 3: hod.getClassAttendance
  // ==========================================================================
  async getClassAttendance(
    input: HodClassAttendanceInput,
    context: HODContext,
  ): Promise<HodClassAttendanceOutput> {
    this.assertContext(context);

    if (!input.classId) {
      throw new BadRequestError('classId is required');
    }

    // 1. Locate class and verify departmental hierarchy
    const cls = await prisma.class.findUnique({
      where: { id: input.classId },
      include: {
        batch: {
          include: {
            program: true,
          },
        },
      },
    });

    if (!cls) {
      throw new NotFoundError(`Class not found: ${input.classId}`);
    }

    if (cls.batch.program.department_id !== context.departmentId) {
      throw new ForbiddenError(
        `Access denied: class ${input.classId} belongs to another department`,
      );
    }

    // 2. Fetch Class Incharge Name
    let classInchargeName: string | null = null;
    if (cls.faculty_uid) {
      const incharge = await prisma.authedUser.findUnique({
        where: { uid: cls.faculty_uid },
        select: { display_name: true },
      });
      classInchargeName = incharge?.display_name || null;
    }

    // 3. Fetch all enrolled students in this class
    const students = await prisma.authedUser.findMany({
      where: {
        class_id: input.classId,
        role: 'STUDENT',
        college_id: context.collegeId,
        department_id: context.departmentId,
      },
      select: {
        uid: true,
        display_name: true,
        register_number: true,
      },
      orderBy: [{ register_number: 'asc' }, { display_name: 'asc' }],
    });

    // 4. Query live student attendance for this class
    const studentAttendanceMap = new Map<
      string,
      { total: number; attended: number }
    >();
    let classTotalRecords = 0;
    let classAttendedRecords = 0;

    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT 
           ar.student_uid,
           COUNT(ar.id)::int as total,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.attendance_session_id = s.id
         WHERE s.class_id = $1::uuid
           AND ($2::date IS NULL OR s.date >= $2::date)
           AND ($3::date IS NULL OR s.date <= $3::date)
         GROUP BY ar.student_uid;`,
        input.classId,
        input.startDate || null,
        input.endDate || null,
      );

      for (const row of rows || []) {
        studentAttendanceMap.set(row.student_uid, {
          total: row.total || 0,
          attended: row.attended || 0,
        });
        classTotalRecords += row.total || 0;
        classAttendedRecords += row.attended || 0;
      }
    } catch {
      // Table may be empty
    }

    // 5. Query today's attendance count
    let presentTodayCount: number | null = null;
    try {
      const todayRows: any = await prisma.$queryRawUnsafe(
        `SELECT 
           COUNT(DISTINCT ar.student_uid)::int as present_count
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.attendance_session_id = s.id
         WHERE s.class_id = $1::uuid
           AND s.date = CURRENT_DATE
           AND ar.status IN ('PRESENT', 'LATE');`,
        input.classId,
      );
      if (todayRows && todayRows[0] && todayRows[0].present_count !== undefined) {
        presentTodayCount = todayRows[0].present_count;
      }
    } catch {
      presentTodayCount = null;
    }

    // 6. Identify at-risk students (< 75%)
    const atRiskStudents: AtRiskStudentItem[] = [];

    for (const student of students) {
      const stats = studentAttendanceMap.get(student.uid) || {
        attended: 0,
        total: 0,
      };
      const pct = safePercentage(stats.attended, stats.total);

      // Only flag if student has sessions held and percentage is below 75%,
      // or if total > 0. If total == 0, percentage is 0.
      if (pct < 75) {
        atRiskStudents.push({
          studentId: student.uid,
          studentName: student.display_name || 'Unnamed Student',
          registerNumber: student.register_number || 'N/A',
          percentage: pct,
        });
      }
    }

    const averagePercentage = safePercentage(
      classAttendedRecords,
      classTotalRecords,
    );

    // Section extraction from class name
    const sectionMatch = cls.name.match(/Sec(?:tion)?\s*([A-Za-z0-9]+)/i);
    const section = sectionMatch ? sectionMatch[1] : 'A';
    const batchName = `${cls.batch.start_year}-${cls.batch.end_year}`;

    return {
      classId: cls.id,
      className: cls.name,
      batch: batchName,
      section,
      classInchargeName,
      averagePercentage,
      totalStudents: students.length,
      presentTodayCount,
      atRiskStudentsCount: atRiskStudents.length,
      atRiskStudents,
    };
  }

  // ==========================================================================
  // Tool 4: hod.getDepartmentAttendance
  // ==========================================================================
  async getDepartmentAttendance(
    input: HodDepartmentAttendanceInput,
    context: HODContext,
  ): Promise<HodDepartmentAttendanceOutput> {
    this.assertContext(context);

    // 1. Fetch department details
    const department = await prisma.department.findUnique({
      where: { id: context.departmentId },
    });
    if (!department || department.college_id !== context.collegeId) {
      throw new NotFoundError('Assigned department could not be found');
    }

    // 2. Fetch all active classes in the department
    const classes = await prisma.class.findMany({
      where: {
        batch: {
          program: {
            department_id: context.departmentId,
          },
        },
        is_active: true,
      },
      include: {
        students: {
          where: {
            role: 'STUDENT',
            college_id: context.collegeId,
            department_id: context.departmentId,
          },
          select: { uid: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const classSummaries: ClassAttendanceSummaryItem[] = [];
    let deptTotalRecords = 0;
    let deptAttendedRecords = 0;
    let totalDepartmentStudents = 0;
    let totalAtRiskDepartmentStudents = 0;

    for (const cls of classes) {
      const studentCount = cls.students.length;
      totalDepartmentStudents += studentCount;

      let clsTotal = 0;
      let clsAttended = 0;
      let atRiskInClass = 0;

      try {
        const rows: any = await prisma.$queryRawUnsafe(
          `SELECT 
             ar.student_uid,
             COUNT(ar.id)::int as total,
             COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended
           FROM attendance_sessions s
           JOIN attendance_records ar ON ar.attendance_session_id = s.id
           WHERE s.class_id = $1::uuid
             AND ($2::date IS NULL OR s.date >= $2::date)
             AND ($3::date IS NULL OR s.date <= $3::date)
           GROUP BY ar.student_uid;`,
          cls.id,
          input.startDate || null,
          input.endDate || null,
        );

        for (const row of rows || []) {
          clsTotal += row.total || 0;
          clsAttended += row.attended || 0;
          const studentPct = safePercentage(row.attended, row.total);
          if (studentPct < 75) {
            atRiskInClass++;
          }
        }
      } catch {
        clsTotal = 0;
        clsAttended = 0;
      }

      deptTotalRecords += clsTotal;
      deptAttendedRecords += clsAttended;
      totalAtRiskDepartmentStudents += atRiskInClass;

      const clsAverage = safePercentage(clsAttended, clsTotal);

      // Filtering criteria:
      // 'all': include all classes
      // 'at_risk' or 'low_attendance': include classes with < 75% average OR atRisk students
      const shouldInclude =
        input.filterBy === 'at_risk' || input.filterBy === 'low_attendance'
          ? clsAverage < 75 || atRiskInClass > 0
          : true;

      if (shouldInclude) {
        classSummaries.push({
          classId: cls.id,
          className: cls.name,
          averagePercentage: clsAverage,
          studentCount,
          atRiskCount: atRiskInClass,
        });
      }
    }

    const overallPercentage =
      deptTotalRecords > 0
        ? safePercentage(deptAttendedRecords, deptTotalRecords)
        : classSummaries.length > 0
          ? Number(
              (
                classSummaries.reduce((sum, c) => sum + c.averagePercentage, 0) /
                classSummaries.length
              ).toFixed(1),
            )
          : 0;

    return {
      departmentId: department.id,
      departmentName: department.name,
      overallPercentage,
      totalClasses: classes.length,
      totalStudents: totalDepartmentStudents,
      atRiskCount: totalAtRiskDepartmentStudents,
      classes: classSummaries,
    };
  }

  // ==========================================================================
  // Tool 5: hod.getAttendanceAnalytics
  // ==========================================================================
  async getAttendanceAnalytics(
    input: HodAttendanceAnalyticsInput,
    context: HODContext,
  ): Promise<HodAttendanceAnalyticsOutput> {
    this.assertContext(context);

    const timeframe = input.timeframe || 'semester';
    const metric = input.metric || 'trends';

    // 1. Fetch all students in HOD's department
    const students = await prisma.authedUser.findMany({
      where: {
        department_id: context.departmentId,
        college_id: context.collegeId,
        role: 'STUDENT',
      },
      select: { uid: true },
    });

    const defaulterBuckets: DefaulterBuckets = {
      below65: 0,
      between65And75: 0,
      above75: 0,
    };

    // 2. Query attendance aggregate per student
    try {
      const studentRecords: any = await prisma.$queryRawUnsafe(
        `SELECT 
           ar.student_uid,
           COUNT(ar.id)::int as total,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended
         FROM attendance_records ar
         JOIN attendance_sessions s ON s.id = ar.attendance_session_id
         JOIN classes c ON c.id = s.class_id
         JOIN batches b ON b.id = c.batch_id
         JOIN programs p ON p.id = b.program_id
         WHERE p.department_id = $1::uuid
         GROUP BY ar.student_uid;`,
        context.departmentId,
      );

      const studentStatsMap = new Map<
        string,
        { attended: number; total: number }
      >();
      for (const row of studentRecords || []) {
        studentStatsMap.set(row.student_uid, {
          attended: row.attended || 0,
          total: row.total || 0,
        });
      }

      for (const st of students) {
        const stats = studentStatsMap.get(st.uid);
        if (stats && stats.total > 0) {
          const pct = safePercentage(stats.attended, stats.total);
          if (pct < 65) {
            defaulterBuckets.below65++;
          } else if (pct < 75) {
            defaulterBuckets.between65And75++;
          } else {
            defaulterBuckets.above75++;
          }
        } else {
          // If no sessions held yet, student is in above 75 (healthy default)
          defaulterBuckets.above75++;
        }
      }
    } catch {
      // If table empty, all students default to healthy bucket
      defaulterBuckets.above75 = students.length;
    }

    // 3. Trends generation based on timeframe
    let trends: AttendanceTrendPoint[] = [];

    // Query weekly/monthly session clusters
    try {
      const trendRows: any = await prisma.$queryRawUnsafe(
        `SELECT 
           to_char(s.date, 'YYYY-MM') as month_period,
           to_char(s.date, 'YYYY-WW') as week_period,
           COUNT(DISTINCT s.id)::int as sessions_held,
           COUNT(ar.id)::int as total_records,
           COUNT(CASE WHEN ar.status IN ('PRESENT', 'LATE', 'EXCUSED') THEN 1 END)::int as attended_records
         FROM attendance_sessions s
         JOIN attendance_records ar ON ar.attendance_session_id = s.id
         JOIN classes c ON c.id = s.class_id
         JOIN batches b ON b.id = c.batch_id
         JOIN programs p ON p.id = b.program_id
         WHERE p.department_id = $1::uuid
         GROUP BY to_char(s.date, 'YYYY-MM'), to_char(s.date, 'YYYY-WW')
         ORDER BY month_period ASC, week_period ASC;`,
        context.departmentId,
      );

      if (trendRows && trendRows.length > 0) {
        trends = trendRows.map((r: any) => ({
          period:
            timeframe === 'week'
              ? `Week ${r.week_period}`
              : `Month ${r.month_period}`,
          percentage: safePercentage(r.attended_records, r.total_records),
          sessionsHeld: r.sessions_held || 0,
        }));
      }
    } catch {
      // Fall through to deterministic points
    }

    // If no live rows exist, provide clean timeline points matching the timeframe
    if (trends.length === 0) {
      if (timeframe === 'week') {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        trends = days.map((d) => ({
          period: d,
          percentage: 0,
          sessionsHeld: 0,
        }));
      } else if (timeframe === 'month') {
        trends = [1, 2, 3, 4].map((w) => ({
          period: `Week ${w}`,
          percentage: 0,
          sessionsHeld: 0,
        }));
      } else if (timeframe === 'semester') {
        trends = ['Month 1', 'Month 2', 'Month 3', 'Month 4'].map((m) => ({
          period: m,
          percentage: 0,
          sessionsHeld: 0,
        }));
      } else {
        trends = ['Semester 1', 'Semester 2'].map((s) => ({
          period: s,
          percentage: 0,
          sessionsHeld: 0,
        }));
      }
    }

    // 4. Synthesize professional analytical insights
    const totalCount =
      defaulterBuckets.below65 +
      defaulterBuckets.between65And75 +
      defaulterBuckets.above75;
    const atRiskTotal =
      defaulterBuckets.below65 + defaulterBuckets.between65And75;
    const atRiskPct = safePercentage(atRiskTotal, totalCount);

    const insights: string[] = [
      `Department total cohort comprises ${totalCount} active students.`,
      defaulterBuckets.below65 > 0
        ? `ALERT: ${defaulterBuckets.below65} student(s) are severely deficient below 65% attendance.`
        : 'Zero students are currently in the critical defaulter zone (< 65%).',
      defaulterBuckets.between65And75 > 0
        ? `WARNING: ${defaulterBuckets.between65And75} student(s) are in the warning bracket (65% - 75%) and require counseling.`
        : 'All non-critical students are maintaining compliance above 75%.',
      atRiskTotal > 0
        ? `Cumulative attendance risk stands at ${atRiskPct}% across the department.`
        : 'Departmental attendance compliance is optimal across all cohorts.',
    ];

    return {
      timeframe,
      metric,
      trends,
      defaulterBuckets,
      insights,
    };
  }
}

export const hodAnalyticsToolService = new HodAnalyticsToolService();

/**
 * Register all 5 attendance & analytics tools with Abhinav's canonical registry.
 */
export function registerAnalyticsToolHandlers(): void {
  hodToolRegistry.registerToolHandler(
    'hod.getAttendanceSummary',
    (input, ctx) => hodAnalyticsToolService.getAttendanceSummary(input, ctx),
  );
  hodToolRegistry.registerToolHandler(
    'hod.getStudentAttendance',
    (input, ctx) => hodAnalyticsToolService.getStudentAttendance(input, ctx),
  );
  hodToolRegistry.registerToolHandler(
    'hod.getClassAttendance',
    (input, ctx) => hodAnalyticsToolService.getClassAttendance(input, ctx),
  );
  hodToolRegistry.registerToolHandler(
    'hod.getDepartmentAttendance',
    (input, ctx) => hodAnalyticsToolService.getDepartmentAttendance(input, ctx),
  );
  hodToolRegistry.registerToolHandler(
    'hod.getAttendanceAnalytics',
    (input, ctx) => hodAnalyticsToolService.getAttendanceAnalytics(input, ctx),
  );
}

// Auto-register upon module load
registerAnalyticsToolHandlers();
