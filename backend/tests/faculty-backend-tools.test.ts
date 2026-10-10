import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FacultyContext } from '../src/modules/faculty/ai/facultyAi.types';
import {
  facultyBackendToolService,
  FacultyBackendToolService,
  registerFacultyToolHandlers,
} from '../src/modules/faculty/services/facultyBackendToolService';
import {
  facultyToolRegistry,
  FACULTY_TOOL_NAMES,
} from '../src/modules/faculty/ai';
import {
  facultyGetDashboardOutputSchema,
  facultyGetAssignedClassesOutputSchema,
  facultyGetClassDetailsOutputSchema,
  facultyGetClassStudentsOutputSchema,
  facultyGetStudentDetailsOutputSchema,
  facultyGetStudentAttendanceOutputSchema,
  facultyGetClassAttendanceStatsOutputSchema,
  facultyGetClassAttendanceHistoryOutputSchema,
  facultyGetClassTimetableOutputSchema,
  facultyGetTimetableOutputSchema,
  facultyGetRemindersOutputSchema,
  facultySearchOutputSchema,
  facultyGetDepartmentOutputSchema,
  facultyGetSubjectsOutputSchema,
  facultyGetAcademicYearsOutputSchema,
  facultyGetSemestersOutputSchema,
  facultyGetPerformanceOutputSchema,
} from '../src/modules/faculty/ai/facultyAi.validation';

const validCollegeId = 'college-alpha-001';
const validDepartmentId = 'dept-cse-101';
const validFacultyUid = 'faculty-prof-888';

const mockFacultyContext: FacultyContext = {
  uid: validFacultyUid,
  email: 'ada.lovelace@institution.edu',
  displayName: 'Prof. Ada Lovelace',
  photoUrl: null,
  role: 'FACULTY',
  collegeId: validCollegeId,
  departmentId: validDepartmentId,
};

describe('Faculty & Class Incharge Backend Tools Suite (Step 2 - Ashik)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Register Ashik's live backend tool handlers for tools 1-17
    registerFacultyToolHandlers();
  });

  describe('1. Direct Service Execution & Canonical Schema Validation (Tools 1 to 17)', () => {
    it('Tool 1: getDashboard returns valid dashboard payload matching schema', async () => {
      const output = await facultyBackendToolService.getDashboard({}, mockFacultyContext);
      expect(output).toBeDefined();
      expect(output.faculty.uid).toBe(mockFacultyContext.uid);
      expect(output.department).toBeDefined();
      expect(typeof output.classIncharge.isAssigned).toBe('boolean');
      expect(output.academicYear).toBeDefined();
      expect(output.semester).toBeDefined();

      const parsed = facultyGetDashboardOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 2: getAssignedClasses returns assigned classes matching schema', async () => {
      const output = await facultyBackendToolService.getAssignedClasses({}, mockFacultyContext);
      expect(output.classes.length).toBeGreaterThan(0);
      expect(output.total).toBe(output.classes.length);
      expect(output.classes[0].inchargeFaculty).toBeDefined();

      const parsed = facultyGetAssignedClassesOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 3: getClassDetails returns full class details matching schema', async () => {
      const output = await facultyBackendToolService.getClassDetails(
        { classId: 'cls-cse-3a' },
        mockFacultyContext,
      );
      expect(output.id).toBe('cls-cse-3a');
      expect(output.name).toBeDefined();
      expect(output.studentCount).toBeGreaterThan(0);
      expect(output.classRep).toBeDefined();

      const parsed = facultyGetClassDetailsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 4: getClassStudents returns roster matching schema', async () => {
      const output = await facultyBackendToolService.getClassStudents(
        { classId: 'cls-cse-3a' },
        mockFacultyContext,
      );
      expect(output.classId).toBe('cls-cse-3a');
      expect(output.students.length).toBeGreaterThan(0);
      expect(output.total).toBe(output.students.length);
      expect(output.students[0].registerNumber).toBeDefined();
      expect(output.students[0].email).toBeDefined();

      const parsed = facultyGetClassStudentsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 5: getStudentDetails returns individual profile matching schema', async () => {
      const output = await facultyBackendToolService.getStudentDetails(
        { studentId: 'stu-cse-001' },
        mockFacultyContext,
      );
      expect(output.uid).toBe('stu-cse-001');
      expect(output.displayName).toBeDefined();
      expect(output.email).toBeDefined();
      expect(typeof output.enrollmentYear).toBe('number');

      const parsed = facultyGetStudentDetailsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 6: getStudentAttendance returns attendance breakdown matching schema', async () => {
      const output = await facultyBackendToolService.getStudentAttendance(
        { studentId: 'stu-cse-001', classId: 'cls-cse-3a' },
        mockFacultyContext,
      );
      expect(output.studentId).toBe('stu-cse-001');
      expect(output.overallPercentage).toBeGreaterThanOrEqual(0);
      expect(output.overallPercentage).toBeLessThanOrEqual(100);
      expect(output.recentSessions.length).toBeGreaterThan(0);

      const parsed = facultyGetStudentAttendanceOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 7: getClassAttendanceStats returns statistical aggregate matching schema', async () => {
      const output = await facultyBackendToolService.getClassAttendanceStats(
        { classId: 'cls-cse-3a' },
        mockFacultyContext,
      );
      expect(output.classId).toBe('cls-cse-3a');
      expect(output.totalStudents).toBeGreaterThan(0);
      expect(output.averageAttendancePercentage).toBeGreaterThan(0);
      expect(output.totalSessionsConducted).toBeGreaterThan(0);

      const parsed = facultyGetClassAttendanceStatsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 8: getClassAttendanceHistory returns historical sessions matching schema', async () => {
      const output = await facultyBackendToolService.getClassAttendanceHistory(
        { classId: 'cls-cse-3a', limit: 10 },
        mockFacultyContext,
      );
      expect(output.classId).toBe('cls-cse-3a');
      expect(output.sessions.length).toBeGreaterThan(0);
      expect(output.sessions[0].totalPresent).toBeGreaterThanOrEqual(0);
      expect(output.sessions[0].takenBy).toBeDefined();

      const parsed = facultyGetClassAttendanceHistoryOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 9: getClassTimetable returns class schedule slots matching schema', async () => {
      const output = await facultyBackendToolService.getClassTimetable(
        { classId: 'cls-cse-3a' },
        mockFacultyContext,
      );
      expect(output.classId).toBe('cls-cse-3a');
      expect(output.timetable.length).toBeGreaterThan(0);
      expect(typeof output.timetable[0].dayOfWeek).toBe('number');
      expect(typeof output.timetable[0].period).toBe('number');

      const parsed = facultyGetClassTimetableOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 10: getTimetable returns personal faculty schedule matching schema and filters by day', async () => {
      const output = await facultyBackendToolService.getTimetable(
        { dayOfWeek: 1 },
        mockFacultyContext,
      );
      expect(output.facultyUid).toBe(mockFacultyContext.uid);
      expect(output.slots.length).toBeGreaterThan(0);
      output.slots.forEach((s) => expect(s.dayOfWeek).toBe(1));

      const parsed = facultyGetTimetableOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 11: getReminders returns reminders with pending/completed filtering', async () => {
      const allReminders = await facultyBackendToolService.getReminders({}, mockFacultyContext);
      expect(allReminders.reminders.length).toBeGreaterThan(0);
      expect(allReminders.pendingCount).toBeGreaterThanOrEqual(0);

      const pendingOnly = await facultyBackendToolService.getReminders(
        { status: 'pending' },
        mockFacultyContext,
      );
      pendingOnly.reminders.forEach((r) => expect(r.status).toBe('PENDING'));

      const parsed = facultyGetRemindersOutputSchema.safeParse(allReminders);
      expect(parsed.success).toBe(true);
    });

    it('Tool 12: search returns unified search matches matching schema', async () => {
      const output = await facultyBackendToolService.search(
        { query: 'Algorithms' },
        mockFacultyContext,
      );
      expect(output.query).toBe('Algorithms');
      expect(output.classes).toBeDefined();
      expect(output.students).toBeDefined();
      expect(output.subjects).toBeDefined();

      const parsed = facultySearchOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 13: getDepartment returns department metadata matching schema', async () => {
      const output = await facultyBackendToolService.getDepartment(
        { departmentId: validDepartmentId },
        mockFacultyContext,
      );
      expect(output.id).toBe(validDepartmentId);
      expect(output.name).toBeDefined();
      expect(output.code).toBeDefined();
      expect(output.programs.length).toBeGreaterThan(0);

      const parsed = facultyGetDepartmentOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 14: getSubjects returns curriculum subjects matching schema', async () => {
      const output = await facultyBackendToolService.getSubjects(
        { semesterNumber: 5 },
        mockFacultyContext,
      );
      expect(output.subjects.length).toBeGreaterThan(0);
      expect(output.total).toBe(output.subjects.length);
      expect(output.subjects[0].semesterNumber).toBe(5);

      const parsed = facultyGetSubjectsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 15: getAcademicYears returns valid academic years list matching schema', async () => {
      const output = await facultyBackendToolService.getAcademicYears({}, mockFacultyContext);
      expect(output.academicYears.length).toBeGreaterThan(0);
      expect(output.total).toBe(output.academicYears.length);
      expect(output.academicYears.some((y) => y.isCurrent)).toBe(true);

      const parsed = facultyGetAcademicYearsOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 16: getSemesters returns semesters list matching schema', async () => {
      const output = await facultyBackendToolService.getSemesters({}, mockFacultyContext);
      expect(output.semesters.length).toBeGreaterThan(0);
      expect(output.total).toBe(output.semesters.length);

      const parsed = facultyGetSemestersOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });

    it('Tool 17: getPerformance returns class/subject performance metrics matching schema', async () => {
      const output = await facultyBackendToolService.getPerformance(
        { subjectId: 'sub-cse-501' },
        mockFacultyContext,
      );
      expect(output.performances.length).toBeGreaterThan(0);
      expect(output.performances[0].averageScore).toBeGreaterThan(0);
      expect(output.performances[0].highestScore).toBeGreaterThanOrEqual(
        output.performances[0].lowestScore,
      );

      const parsed = facultyGetPerformanceOutputSchema.safeParse(output);
      expect(parsed.success).toBe(true);
    });
  });

  describe('2. Authorization, Scoping & Boundary Security Enforcement', () => {
    it('rejects execution when faculty context is missing or empty', async () => {
      await expect(
        facultyBackendToolService.getDashboard({}, null as any),
      ).rejects.toMatchObject({ status: 401 });
    });

    it('rejects execution when caller role is unauthorized (e.g., STUDENT role)', async () => {
      const studentContext: FacultyContext = {
        ...mockFacultyContext,
        role: 'STUDENT',
      };
      await expect(
        facultyBackendToolService.getDashboard({}, studentContext),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('assertClassAccess rejects foreign / cross-class access with 403 Forbidden', async () => {
      await expect(
        facultyBackendToolService.assertClassAccess('foreign-class-xyz', mockFacultyContext),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getClassDetails({ classId: 'unauth-cls-99' }, mockFacultyContext),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getClassStudents({ classId: 'foreign-cls-99' }, mockFacultyContext),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getClassAttendanceStats(
          { classId: 'unauth-cls-99' },
          mockFacultyContext,
        ),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getClassAttendanceHistory(
          { classId: 'unauth-cls-99' },
          mockFacultyContext,
        ),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getClassTimetable({ classId: 'unauth-cls-99' }, mockFacultyContext),
      ).rejects.toMatchObject({ status: 403 });
    });

    it('rejects student attendance lookup for unauthorized foreign student with 403 Forbidden', async () => {
      await expect(
        facultyBackendToolService.getStudentDetails(
          { studentId: 'foreign-student-99' },
          mockFacultyContext,
        ),
      ).rejects.toMatchObject({ status: 403 });

      await expect(
        facultyBackendToolService.getStudentAttendance(
          { studentId: 'unauth-student-99' },
          mockFacultyContext,
        ),
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  describe('3. Canonical Faculty Tool Registry Integration (executeTool)', () => {
    it('executes Tools 1-17 through facultyToolRegistry.executeTool successfully', async () => {
      const toolNamesToTest = [
        'faculty.getDashboard',
        'faculty.getAssignedClasses',
        'faculty.getClassDetails',
        'faculty.getClassStudents',
        'faculty.getStudentDetails',
        'faculty.getStudentAttendance',
        'faculty.getClassAttendanceStats',
        'faculty.getClassAttendanceHistory',
        'faculty.getClassTimetable',
        'faculty.getTimetable',
        'faculty.getReminders',
        'faculty.search',
        'faculty.getDepartment',
        'faculty.getSubjects',
        'faculty.getAcademicYears',
        'faculty.getSemesters',
        'faculty.getPerformance',
      ] as const;

      const toolArgsMap: Record<string, Record<string, any>> = {
        'faculty.getClassDetails': { classId: 'cls-cse-3a' },
        'faculty.getClassStudents': { classId: 'cls-cse-3a' },
        'faculty.getStudentDetails': { studentId: 'stu-cse-001' },
        'faculty.getStudentAttendance': { studentId: 'stu-cse-001' },
        'faculty.getClassAttendanceStats': { classId: 'cls-cse-3a' },
        'faculty.getClassAttendanceHistory': { classId: 'cls-cse-3a' },
        'faculty.getClassTimetable': { classId: 'cls-cse-3a' },
        'faculty.getTimetable': { dayOfWeek: 1 },
        'faculty.search': { query: 'CSE' },
      };

      for (const toolName of toolNamesToTest) {
        const args = toolArgsMap[toolName] || {};
        const result = await facultyToolRegistry.executeTool(toolName, args, mockFacultyContext);
        expect(result.status).toBe('success');
        expect(result.result).toBeDefined();
        // Since Step 2 overrides stubs with real implementations, _isStub should NOT be true
        expect(result.result._isStub).toBeFalsy();
      }
    });

    it('leaves Tools 18 and 19 as stubs ready for Jeresh (Step 3: RAG)', async () => {
      const result18 = await facultyToolRegistry.executeTool(
        'faculty.searchKnowledge',
        { query: 'academic regulations' },
        mockFacultyContext,
      );
      expect(result18.status).toBe('success');
      expect(result18.result._isStub).toBe(true);

      const result19 = await facultyToolRegistry.executeTool(
        'faculty.getKnowledgeContext',
        { topic: 'attendance criteria' },
        mockFacultyContext,
      );
      expect(result19.status).toBe('success');
      expect(result19.result._isStub).toBe(true);
    });
  });
});
