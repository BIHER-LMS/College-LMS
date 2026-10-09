import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { HODContext } from '../src/modules/hod_temp/middleware/authMiddleware';

// Mock DB and Firebase for HOD module
vi.mock('../src/modules/hod_temp/config/firebase', () => ({
  verifyFirebaseIdToken: vi.fn(),
}));

vi.mock('../src/modules/hod_temp/config/db', () => ({
  prisma: {
    authedUser: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
    department: { findMany: vi.fn(), findUnique: vi.fn() },
    batch: { findMany: vi.fn(), findUnique: vi.fn() },
    class: { findMany: vi.fn(), findUnique: vi.fn() },
    subject: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn() },
    $queryRawUnsafe: vi.fn(),
  },
}));

import app from '../src/app';
import { prisma as hodPrisma } from '../src/modules/hod_temp/config/db';
import { verifyFirebaseIdToken } from '../src/modules/hod_temp/config/firebase';
import {
  hodAnalyticsToolService,
  registerAnalyticsToolHandlers,
} from '../src/modules/hod_temp/services/hodAnalyticsToolService';
import { hodToolRegistry } from '../src/modules/hod_temp/ai/toolRegistry';

const db = hodPrisma as any;
const verifyHodToken = vi.mocked(verifyFirebaseIdToken);

const validCollegeId = 'college-alpha-001';
const validDepartmentId = 'dept-cse-101';
const validHodUid = 'hod-firebase-uid-777';

const foreignCollegeId = 'college-beta-002';
const foreignDepartmentId = 'dept-ece-202';

const mockHodContext: HODContext = {
  uid: validHodUid,
  email: 'hod.cse@institution.edu',
  displayName: 'Dr. Alan Turing',
  photoUrl: null,
  role: 'HOD',
  collegeId: validCollegeId,
  departmentId: validDepartmentId,
};

const mockDepartment = {
  id: validDepartmentId,
  name: 'Computer Science and Engineering',
  code: 'CSE',
  college_id: validCollegeId,
  hod_uid: validHodUid,
  is_active: true,
};

const mockAuthedUser = (role = 'HOD', approvalStatus = 'APPROVED') => ({
  uid: validHodUid,
  email: 'hod.cse@institution.edu',
  display_name: 'Dr. Alan Turing',
  photo_url: null,
  role,
  approval_status: approvalStatus,
  college_id: validCollegeId,
  department_id: validDepartmentId,
});

describe('HOD Attendance & Analytics Tools Suite (Varun - Step 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerAnalyticsToolHandlers();

    // Default successful auth mock
    verifyHodToken.mockResolvedValue({
      uid: validHodUid,
      email: 'hod.cse@institution.edu',
    } as any);

    db.authedUser.findUnique.mockResolvedValue(mockAuthedUser('HOD'));
    db.user.findUnique.mockResolvedValue(null);
    db.department.findUnique.mockResolvedValue(mockDepartment);
    db.department.findMany.mockResolvedValue([mockDepartment]);
  });

  // ==========================================================================
  // 1. Tool 1: hod.getAttendanceSummary
  // ==========================================================================
  describe('Tool 1: hod.getAttendanceSummary', () => {
    const mockBatches = [
      {
        id: 'batch-2024-2028',
        start_year: 2024,
        end_year: 2028,
        program_id: 'prog-cse-01',
        is_active: true,
        program: { id: 'prog-cse-01', name: 'B.Tech CSE', department_id: validDepartmentId },
        classes: [
          {
            id: 'class-cse-1a',
            name: 'CSE 1A',
            is_active: true,
            students: [{ uid: 'std-1' }, { uid: 'std-2' }],
          },
        ],
      },
      {
        id: 'batch-2023-2027',
        start_year: 2023,
        end_year: 2027,
        program_id: 'prog-cse-01',
        is_active: true,
        program: { id: 'prog-cse-01', name: 'B.Tech CSE', department_id: validDepartmentId },
        classes: [
          {
            id: 'class-cse-2a',
            name: 'CSE 2A',
            is_active: true,
            students: [{ uid: 'std-3' }],
          },
        ],
      },
    ];

    it('successfully computes attendance summary with live records across batches', async () => {
      db.batch.findMany.mockResolvedValue(mockBatches);
      db.$queryRawUnsafe
        .mockResolvedValueOnce([{ total_records: 100, attended_records: 92 }]) // batch 1
        .mockResolvedValueOnce([{ total_records: 80, attended_records: 56 }]); // batch 2 (70% - alert)

      const result = await hodAnalyticsToolService.getAttendanceSummary({}, mockHodContext);

      expect(result.departmentId).toBe(validDepartmentId);
      expect(result.totalStudents).toBe(3);
      expect(result.totalClasses).toBe(2);
      expect(result.cohorts).toHaveLength(2);
      expect(result.cohorts[0].batchId).toBe('batch-2024-2028');
      expect(result.cohorts[0].percentage).toBe(92);
      expect(result.cohorts[0].isAlert).toBe(false);

      expect(result.cohorts[1].batchId).toBe('batch-2023-2027');
      expect(result.cohorts[1].percentage).toBe(70);
      expect(result.cohorts[1].isAlert).toBe(true); // < 75%

      expect(result.departmentAverage).toBe(82.2); // (92+56) / (100+80) = 148/180 = 82.2%
      expect(result.dateRange).toEqual({ startDate: null, endDate: null });
    });

    it('supports date range filtering in attendance summary', async () => {
      db.batch.findMany.mockResolvedValue(mockBatches);
      db.$queryRawUnsafe.mockResolvedValue([{ total_records: 50, attended_records: 45 }]);

      const result = await hodAnalyticsToolService.getAttendanceSummary(
        { startDate: '2026-09-01', endDate: '2026-09-30' },
        mockHodContext,
      );

      expect(result.dateRange.startDate).toBe('2026-09-01');
      expect(result.dateRange.endDate).toBe('2026-09-30');
    });

    it('rejects batchId belonging to another department with ForbiddenError', async () => {
      db.batch.findUnique.mockResolvedValue({
        id: 'foreign-batch-1',
        program: { department_id: foreignDepartmentId },
      });

      await expect(
        hodAnalyticsToolService.getAttendanceSummary(
          { batchId: 'foreign-batch-1' },
          mockHodContext,
        ),
      ).rejects.toThrow('Tenant violation');
    });

    it('rejects classId belonging to another department with ForbiddenError', async () => {
      db.class.findUnique.mockResolvedValue({
        id: 'foreign-class-1',
        batch: { program: { department_id: foreignDepartmentId } },
      });

      await expect(
        hodAnalyticsToolService.getAttendanceSummary(
          { classId: 'foreign-class-1' },
          mockHodContext,
        ),
      ).rejects.toThrow('Tenant violation');
    });

    it('throws NotFoundError when requested batchId does not exist', async () => {
      db.batch.findUnique.mockResolvedValue(null);

      await expect(
        hodAnalyticsToolService.getAttendanceSummary(
          { batchId: 'non-existent-batch' },
          mockHodContext,
        ),
      ).rejects.toThrow('Batch not found');
    });

    it('handles zero attendance records gracefully without crashing', async () => {
      db.batch.findMany.mockResolvedValue([]);
      db.$queryRawUnsafe.mockResolvedValue([]);

      const result = await hodAnalyticsToolService.getAttendanceSummary({}, mockHodContext);

      expect(result.departmentAverage).toBe(0);
      expect(result.totalStudents).toBe(0);
      expect(result.totalClasses).toBe(0);
      expect(result.cohorts).toEqual([]);
    });
  });

  // ==========================================================================
  // 2. Tool 2: hod.getStudentAttendance
  // ==========================================================================
  describe('Tool 2: hod.getStudentAttendance', () => {
    const mockStudent = {
      uid: 'std-valid-101',
      display_name: 'Grace Hopper',
      registerNumber: 'REG-2024-001',
      register_number: 'REG-2024-001',
      college_id: validCollegeId,
      department_id: validDepartmentId,
      class_id: 'class-cse-3a',
      class: {
        id: 'class-cse-3a',
        name: 'CSE 3rd Year Sec A',
      },
    };

    const mockSubjects = [
      { id: 'sub-compilers', code: 'CS301', name: 'Compiler Design' },
      { id: 'sub-networks', code: 'CS302', name: 'Computer Networks' },
    ];

    it('retrieves detailed student attendance and subject breakdowns', async () => {
      db.authedUser.findFirst.mockResolvedValue(mockStudent);
      db.subject.findMany.mockResolvedValue(mockSubjects);
      db.$queryRawUnsafe.mockResolvedValue([
        { subject_id: 'sub-compilers', total: 20, attended: 18 },
        { subject_id: 'sub-networks', total: 20, attended: 12 }, // 60%
      ]);

      const result = await hodAnalyticsToolService.getStudentAttendance(
        { studentId: 'std-valid-101' },
        mockHodContext,
      );

      expect(result.studentId).toBe('std-valid-101');
      expect(result.studentName).toBe('Grace Hopper');
      expect(result.registerNumber).toBe('REG-2024-001');
      expect(result.className).toBe('CSE 3rd Year Sec A');
      expect(result.totalSessions).toBe(40);
      expect(result.attendedSessions).toBe(30);
      expect(result.overallPercentage).toBe(75);
      expect(result.isLowAttendance).toBe(false); // 75% is compliant

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].subjectCode).toBe('CS301');
      expect(result.subjects[0].percentage).toBe(90);
      expect(result.subjects[1].subjectCode).toBe('CS302');
      expect(result.subjects[1].percentage).toBe(60);
    });

    it('identifies low attendance (< 75%) flag accurately', async () => {
      db.authedUser.findFirst.mockResolvedValue(mockStudent);
      db.subject.findMany.mockResolvedValue(mockSubjects);
      db.$queryRawUnsafe.mockResolvedValue([
        { subject_id: 'sub-compilers', total: 20, attended: 10 },
        { subject_id: 'sub-networks', total: 20, attended: 10 },
      ]);

      const result = await hodAnalyticsToolService.getStudentAttendance(
        { studentId: 'std-valid-101' },
        mockHodContext,
      );

      expect(result.overallPercentage).toBe(50);
      expect(result.isLowAttendance).toBe(true);
    });

    it('denies access to student in another department with ForbiddenError', async () => {
      db.authedUser.findFirst.mockResolvedValue({
        ...mockStudent,
        department_id: foreignDepartmentId,
      });

      await expect(
        hodAnalyticsToolService.getStudentAttendance(
          { studentId: 'std-foreign-dept' },
          mockHodContext,
        ),
      ).rejects.toThrow('Access denied: student belongs to another department');
    });

    it('denies access to student in another college with ForbiddenError', async () => {
      db.authedUser.findFirst.mockResolvedValue({
        ...mockStudent,
        college_id: foreignCollegeId,
      });

      await expect(
        hodAnalyticsToolService.getStudentAttendance(
          { studentId: 'std-foreign-col' },
          mockHodContext,
        ),
      ).rejects.toThrow('Access denied: student belongs to another institution');
    });

    it('throws NotFoundError when student does not exist', async () => {
      db.authedUser.findFirst.mockResolvedValue(null);

      await expect(
        hodAnalyticsToolService.getStudentAttendance(
          { studentId: 'non-existent-student' },
          mockHodContext,
        ),
      ).rejects.toThrow('not found in system');
    });
  });

  // ==========================================================================
  // 3. Tool 3: hod.getClassAttendance
  // ==========================================================================
  describe('Tool 3: hod.getClassAttendance', () => {
    const mockClass = {
      id: 'class-cse-3b',
      name: 'CSE III Year Sec B',
      faculty_uid: 'fac-linus-1',
      batch: {
        start_year: 2023,
        end_year: 2027,
        program: {
          department_id: validDepartmentId,
        },
      },
    };

    const mockClassStudents = [
      { uid: 'std-1', display_name: 'Alice', register_number: 'REG-001' },
      { uid: 'std-2', display_name: 'Bob', register_number: 'REG-002' },
      { uid: 'std-3', display_name: 'Charlie', register_number: 'REG-003' },
    ];

    it('retrieves class statistics, incharge, and identifies at-risk students (< 75%)', async () => {
      db.class.findUnique.mockResolvedValue(mockClass);
      db.authedUser.findUnique.mockResolvedValue({ display_name: 'Prof. Linus Torvalds' });
      db.authedUser.findMany.mockResolvedValue(mockClassStudents);

      // Student attendance in class:
      // Alice: 90% (18/20)
      // Bob: 60% (12/20) -> At Risk
      // Charlie: 70% (14/20) -> At Risk
      db.$queryRawUnsafe
        .mockResolvedValueOnce([
          { student_uid: 'std-1', total: 20, attended: 18 },
          { student_uid: 'std-2', total: 20, attended: 12 },
          { student_uid: 'std-3', total: 20, attended: 14 },
        ])
        .mockResolvedValueOnce([{ present_count: 2 }]); // present today

      const result = await hodAnalyticsToolService.getClassAttendance(
        { classId: 'class-cse-3b' },
        mockHodContext,
      );

      expect(result.classId).toBe('class-cse-3b');
      expect(result.className).toBe('CSE III Year Sec B');
      expect(result.batch).toBe('2023-2027');
      expect(result.section).toBe('B');
      expect(result.classInchargeName).toBe('Prof. Linus Torvalds');
      expect(result.totalStudents).toBe(3);
      expect(result.presentTodayCount).toBe(2);
      expect(result.averagePercentage).toBe(73.3); // (18+12+14)/60 = 44/60 = 73.3%

      expect(result.atRiskStudentsCount).toBe(2);
      expect(result.atRiskStudents).toEqual([
        { studentId: 'std-2', studentName: 'Bob', registerNumber: 'REG-002', percentage: 60 },
        { studentId: 'std-3', studentName: 'Charlie', registerNumber: 'REG-003', percentage: 70 },
      ]);
    });

    it('denies access when class belongs to another department with ForbiddenError', async () => {
      db.class.findUnique.mockResolvedValue({
        id: 'foreign-class-mech',
        batch: {
          program: { department_id: foreignDepartmentId },
        },
      });

      await expect(
        hodAnalyticsToolService.getClassAttendance(
          { classId: 'foreign-class-mech' },
          mockHodContext,
        ),
      ).rejects.toThrow('Access denied: class foreign-class-mech belongs to another department');
    });

    it('throws NotFoundError when class does not exist', async () => {
      db.class.findUnique.mockResolvedValue(null);

      await expect(
        hodAnalyticsToolService.getClassAttendance(
          { classId: 'missing-class' },
          mockHodContext,
        ),
      ).rejects.toThrow('Class not found: missing-class');
    });
  });

  // ==========================================================================
  // 4. Tool 4: hod.getDepartmentAttendance
  // ==========================================================================
  describe('Tool 4: hod.getDepartmentAttendance', () => {
    const mockClasses = [
      {
        id: 'cls-1',
        name: 'CSE 1A',
        students: [{ uid: 's1' }, { uid: 's2' }],
      },
      {
        id: 'cls-2',
        name: 'CSE 2A',
        students: [{ uid: 's3' }, { uid: 's4' }],
      },
    ];

    it('retrieves department-wide class comparison with filterBy: "all"', async () => {
      db.department.findUnique.mockResolvedValue(mockDepartment);
      db.class.findMany.mockResolvedValue(mockClasses);

      // Class 1: 90% attendance, 0 at risk
      // Class 2: 65% attendance, 2 at risk
      db.$queryRawUnsafe
        .mockResolvedValueOnce([
          { student_uid: 's1', total: 10, attended: 9 },
          { student_uid: 's2', total: 10, attended: 9 },
        ])
        .mockResolvedValueOnce([
          { student_uid: 's3', total: 10, attended: 6 },
          { student_uid: 's4', total: 10, attended: 7 },
        ]);

      const result = await hodAnalyticsToolService.getDepartmentAttendance(
        { filterBy: 'all' },
        mockHodContext,
      );

      expect(result.departmentId).toBe(validDepartmentId);
      expect(result.departmentName).toBe('Computer Science and Engineering');
      expect(result.totalClasses).toBe(2);
      expect(result.totalStudents).toBe(4);
      expect(result.atRiskCount).toBe(2); // s3 (60%) and s4 (70%)
      expect(result.classes).toHaveLength(2);
      expect(result.classes[0].averagePercentage).toBe(90);
      expect(result.classes[1].averagePercentage).toBe(65);
      expect(result.overallPercentage).toBe(77.5); // (18 + 13) / 40 = 77.5%
    });

    it('filters classes by "at_risk" correctly', async () => {
      db.department.findUnique.mockResolvedValue(mockDepartment);
      db.class.findMany.mockResolvedValue(mockClasses);

      // Class 1: 100% attendance, 0 at risk
      // Class 2: 60% attendance, 1 at risk
      db.$queryRawUnsafe
        .mockResolvedValueOnce([
          { student_uid: 's1', total: 10, attended: 10 },
          { student_uid: 's2', total: 10, attended: 10 },
        ])
        .mockResolvedValueOnce([
          { student_uid: 's3', total: 10, attended: 6 },
          { student_uid: 's4', total: 10, attended: 8 },
        ]);

      const result = await hodAnalyticsToolService.getDepartmentAttendance(
        { filterBy: 'at_risk' },
        mockHodContext,
      );

      // Only Class 2 is at risk
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].classId).toBe('cls-2');
      expect(result.classes[0].atRiskCount).toBe(1);
    });
  });

  // ==========================================================================
  // 5. Tool 5: hod.getAttendanceAnalytics
  // ==========================================================================
  describe('Tool 5: hod.getAttendanceAnalytics', () => {
    const mockStudents = [
      { uid: 's-good-1' },
      { uid: 's-good-2' },
      { uid: 's-warn-1' },
      { uid: 's-crit-1' },
    ];

    it('buckets defaulters correctly (<65%, 65-75%, >=75%) and generates trends', async () => {
      db.authedUser.findMany.mockResolvedValue(mockStudents);

      // Aggregates:
      // s-good-1: 90% (above75)
      // s-good-2: 80% (above75)
      // s-warn-1: 70% (between65And75)
      // s-crit-1: 50% (below65)
      db.$queryRawUnsafe
        .mockResolvedValueOnce([
          { student_uid: 's-good-1', total: 20, attended: 18 },
          { student_uid: 's-good-2', total: 20, attended: 16 },
          { student_uid: 's-warn-1', total: 20, attended: 14 },
          { student_uid: 's-crit-1', total: 20, attended: 10 },
        ])
        .mockResolvedValueOnce([
          { month_period: '2026-08', week_period: '2026-32', sessions_held: 20, total_records: 80, attended_records: 64 },
          { month_period: '2026-09', week_period: '2026-36', sessions_held: 25, total_records: 100, attended_records: 75 },
        ]);

      const result = await hodAnalyticsToolService.getAttendanceAnalytics(
        { timeframe: 'semester', metric: 'trends' },
        mockHodContext,
      );

      expect(result.timeframe).toBe('semester');
      expect(result.metric).toBe('trends');
      expect(result.defaulterBuckets).toEqual({
        below65: 1,
        between65And75: 1,
        above75: 2,
      });

      expect(result.trends).toHaveLength(2);
      expect(result.trends[0].percentage).toBe(80); // 64/80
      expect(result.trends[1].percentage).toBe(75); // 75/100

      expect(result.insights.length).toBeGreaterThanOrEqual(4);
      expect(result.insights[1]).toContain('ALERT: 1 student(s) are severely deficient');
      expect(result.insights[2]).toContain('WARNING: 1 student(s) are in the warning bracket');
    });

    it('supports alternative timeframes ("week", "month", "academic_year")', async () => {
      db.authedUser.findMany.mockResolvedValue(mockStudents);
      db.$queryRawUnsafe.mockResolvedValue([]); // fallback to deterministic timeline

      const weekResult = await hodAnalyticsToolService.getAttendanceAnalytics(
        { timeframe: 'week' },
        mockHodContext,
      );
      expect(weekResult.timeframe).toBe('week');
      expect(weekResult.trends).toHaveLength(5); // Mon-Fri
      expect(weekResult.trends[0].period).toBe('Monday');

      const monthResult = await hodAnalyticsToolService.getAttendanceAnalytics(
        { timeframe: 'month' },
        mockHodContext,
      );
      expect(monthResult.timeframe).toBe('month');
      expect(monthResult.trends).toHaveLength(4); // Week 1 - 4
    });
  });

  // ==========================================================================
  // 6. Security & Tenant Boundaries
  // ==========================================================================
  describe('6. Security & Authorization Boundaries', () => {
    it('throws ForbiddenError when context is missing departmentId or collegeId', async () => {
      const invalidCtx = { ...mockHodContext, departmentId: '' };

      await expect(
        hodAnalyticsToolService.getAttendanceSummary({}, invalidCtx as any),
      ).rejects.toThrow('Missing verified departmental or institutional authorization context');
    });

    it('rejects execution when caller has unauthorized role (e.g. STUDENT, FACULTY)', async () => {
      const studentCtx = { ...mockHodContext, role: 'STUDENT' };

      await expect(
        hodAnalyticsToolService.getAttendanceSummary({}, studentCtx as any),
      ).rejects.toThrow('Unauthorized: HOD role required');
    });
  });

  // ==========================================================================
  // 7. Canonical Tool Registry Execution Pipeline
  // ==========================================================================
  describe('7. Canonical Tool Registry Execution Pipeline', () => {
    it('executes hod.getAttendanceSummary via hodToolRegistry with live handler', async () => {
      db.batch.findMany.mockResolvedValue([]);
      db.$queryRawUnsafe.mockResolvedValue([]);

      const execution = await hodToolRegistry.executeTool(
        'hod.getAttendanceSummary',
        {},
        mockHodContext,
      );

      expect(execution.status).toBe('success');
      expect(execution.toolName).toBe('hod.getAttendanceSummary');
      expect(execution.result.departmentId).toBe(validDepartmentId);
      expect(execution.result._isStub).toBeUndefined(); // Live result, not stub!
      expect(execution.executionDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('enforces tenant boundary check inside hodToolRegistry when departmentId argument is spoofed', async () => {
      await expect(
        hodToolRegistry.executeTool(
          'hod.getAttendanceSummary',
          { departmentId: foreignDepartmentId },
          mockHodContext,
        ),
      ).rejects.toThrow('Tenant isolation violation');
    });
  });

  // ==========================================================================
  // 8. End-to-End API Integration (/api/hod/ai/chat & /api/hod/ai/tools/execute)
  // ==========================================================================
  describe('8. End-to-End API Integration', () => {
    it('executes live tool via direct POST /api/hod/ai/tools/execute', async () => {
      db.batch.findMany.mockResolvedValue([]);
      db.$queryRawUnsafe.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/hod/ai/tools/execute')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send({
          toolName: 'hod.getAttendanceSummary',
          arguments: {},
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('success');
      expect(res.body.data.result.departmentId).toBe(validDepartmentId);
      expect(res.body.data.result._isStub).toBeUndefined();
    });

    it('invokes live attendance tool and synthesizes response via POST /api/hod/ai/chat', async () => {
      db.batch.findMany.mockResolvedValue([
        {
          id: 'batch-2024-2028',
          start_year: 2024,
          end_year: 2028,
          program: { name: 'CSE', department_id: validDepartmentId },
          classes: [
            { id: 'c-1', name: 'CSE 1A', is_active: true, students: [{ uid: 's1' }] },
          ],
        },
      ]);
      db.$queryRawUnsafe.mockResolvedValue([{ total_records: 100, attended_records: 92 }]);

      const res = await request(app)
        .post('/api/hod/ai/chat')
        .set('Authorization', 'Bearer valid-firebase-token')
        .send({
          message: 'What is our departmental attendance summary?',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.toolsExecuted).toHaveLength(1);
      expect(res.body.data.toolsExecuted[0].toolName).toBe('hod.getAttendanceSummary');
      expect(res.body.data.toolsExecuted[0].status).toBe('success');
      expect(res.body.data.message).toContain('Departmental Attendance Summary');
    });
  });
});
