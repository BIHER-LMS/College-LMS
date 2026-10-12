import type { StudentContext } from '../src/modules/student/student.types';

// Mock studentService methods
vi.mock('../src/modules/student/student.service', () => {
  const mockService = {
    getDashboard: vi.fn(),
    getProfile: vi.fn(),
    getClass: vi.fn(),
    getBatch: vi.fn(),
    getProgram: vi.fn(),
    getDepartment: vi.fn(),
    getSubjects: vi.fn(),
    getClassIncharge: vi.fn(),
    getAcademicYears: vi.fn(),
    getSemesters: vi.fn(),
    getClassTimetable: vi.fn(),
    getAttendance: vi.fn(),
  };

  return {
    studentService: mockService,
    StudentService: vi.fn().mockImplementation(() => mockService),
  };
});

import { studentService } from '../src/modules/student/student.service';
import { studentToolRegistry } from '../src/modules/student/ai/toolRegistry';
import { studentDataToolService } from '../src/modules/student/services/studentDataToolService';

const mockContext: StudentContext = {
  uid: 'student-ashik-001',
  email: 'ashik.student@institution.edu',
  displayName: 'Ashik Student',
  photoURL: null,
  role: 'STUDENT',
  collegeId: 'college-alpha',
  departmentId: 'dept-cse',
  classId: 'class-cse-3a',
  registerNumber: 'REG-2026-ASHIK',
};

describe('Student Data Tools — Step 2: Ashik', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentDataToolService.registerAllDataTools();
  });

  it('1. student.getDashboard should delegate to studentService.getDashboard with context', async () => {
    const mockDashboard = {
      student: { displayName: 'Ashik Student' },
      class: { name: 'CSE 3A' },
      subjects: [],
    };
    (studentService.getDashboard as any).mockResolvedValueOnce(mockDashboard);

    const result = await studentToolRegistry.executeTool('student.getDashboard', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getDashboard).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockDashboard);
  });

  it('2. student.getProfile should delegate to studentService.getProfile', async () => {
    const mockProfile = {
      uid: mockContext.uid,
      displayName: 'Ashik Student',
      email: mockContext.email,
      registerNumber: mockContext.registerNumber,
    };
    (studentService.getProfile as any).mockResolvedValueOnce(mockProfile);

    const result = await studentToolRegistry.executeTool('student.getProfile', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getProfile).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockProfile);
  });

  it('3. student.getClass should delegate to studentService.getClass', async () => {
    const mockClass = { id: 'class-cse-3a', name: 'B.Tech CSE - 3A', currentSemester: 6 };
    (studentService.getClass as any).mockResolvedValueOnce(mockClass);

    const result = await studentToolRegistry.executeTool('student.getClass', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getClass).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockClass);
  });

  it('4. student.getBatch should delegate to studentService.getBatch', async () => {
    const mockBatch = { id: 'batch-2022', startYear: 2022, endYear: 2026, name: '2022-2026 Batch' };
    (studentService.getBatch as any).mockResolvedValueOnce(mockBatch);

    const result = await studentToolRegistry.executeTool('student.getBatch', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getBatch).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockBatch);
  });

  it('5. student.getProgram should delegate to studentService.getProgram', async () => {
    const mockProgram = { id: 'prog-btech-cse', name: 'B.Tech CSE', type: 'UG', durationYears: 4 };
    (studentService.getProgram as any).mockResolvedValueOnce(mockProgram);

    const result = await studentToolRegistry.executeTool('student.getProgram', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getProgram).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockProgram);
  });

  it('6. student.getDepartment should delegate to studentService.getDepartment', async () => {
    const mockDept = { id: 'dept-cse', name: 'Computer Science', code: 'CSE' };
    (studentService.getDepartment as any).mockResolvedValueOnce(mockDept);

    const result = await studentToolRegistry.executeTool('student.getDepartment', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getDepartment).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockDept);
  });

  it('7. student.getSubjects should pass semesterNumber argument to studentService.getSubjects', async () => {
    const mockSubjects = [
      { id: 'sub-1', code: 'CS601', name: 'Compiler Design', credits: 4, semesterNumber: 6 },
    ];
    (studentService.getSubjects as any).mockResolvedValueOnce(mockSubjects);

    const result = await studentToolRegistry.executeTool(
      'student.getSubjects',
      { semesterNumber: 6 },
      mockContext,
    );

    expect(result.status).toBe('success');
    expect(studentService.getSubjects).toHaveBeenCalledWith(mockContext, 6);
    expect(result.result).toEqual(mockSubjects);
  });

  it('8. student.getClassIncharge should delegate to studentService.getClassIncharge', async () => {
    const mockIncharge = {
      facultyUid: 'fac-incharge-99',
      name: 'Dr. Sarah Connor',
      email: 'sarah.connor@institution.edu',
      designation: 'Associate Professor',
    };
    (studentService.getClassIncharge as any).mockResolvedValueOnce(mockIncharge);

    const result = await studentToolRegistry.executeTool('student.getClassIncharge', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getClassIncharge).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockIncharge);
  });

  it('9. student.getAcademicYears should delegate to studentService.getAcademicYears', async () => {
    const mockAY = [{ id: 'ay-2025', name: '2025-2026', isCurrent: true }];
    (studentService.getAcademicYears as any).mockResolvedValueOnce(mockAY);

    const result = await studentToolRegistry.executeTool('student.getAcademicYears', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getAcademicYears).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockAY);
  });

  it('10. student.getSemesters should delegate to studentService.getSemesters', async () => {
    const mockSem = [{ id: 'sem-6', termNumber: 6, startDate: '2026-01-05', endDate: '2026-05-20' }];
    (studentService.getSemesters as any).mockResolvedValueOnce(mockSem);

    const result = await studentToolRegistry.executeTool('student.getSemesters', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getSemesters).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockSem);
  });

  it('11. student.getTimetable should delegate to studentService.getClassTimetable', async () => {
    const mockSlots = [
      { id: 'slot-1', day_of_week: 'Monday', period: 'Period 1', subject_name: 'Compiler Design' },
    ];
    (studentService.getClassTimetable as any).mockResolvedValueOnce(mockSlots);

    const result = await studentToolRegistry.executeTool('student.getTimetable', {}, mockContext);

    expect(result.status).toBe('success');
    expect(studentService.getClassTimetable).toHaveBeenCalledWith(mockContext);
    expect(result.result).toEqual(mockSlots);
  });

  it('12. student.getAttendance should pass date argument to studentService.getAttendance', async () => {
    const mockAttendance = {
      summary: {
        totalSessions: 100,
        attendedSessions: 85,
        percentage: 85.0,
        isEligible: true,
        safeMargin: 13,
      },
      subjectBreakdown: [
        { code: 'CS601', name: 'Compiler Design', held: 30, attended: 27, percentage: 90.0, status: 'SAFE' },
      ],
      dailySchedule: [],
    };
    (studentService.getAttendance as any).mockResolvedValueOnce(mockAttendance);

    const result = await studentToolRegistry.executeTool(
      'student.getAttendance',
      { date: '2026-10-11' },
      mockContext,
    );

    expect(result.status).toBe('success');
    expect(studentService.getAttendance).toHaveBeenCalledWith(mockContext, '2026-10-11');
    expect(result.result.summary.percentage).toBe(85.0);
    expect(result.result.summary.isEligible).toBe(true);
  });

  it('Zero IDOR: Client parameters are strictly rejected by Zod and never override studentContext', async () => {
    (studentService.getProfile as any).mockResolvedValue({
      uid: mockContext.uid,
      displayName: 'Ashik Student',
    });

    // Malicious injection attempt to smuggle parameters into zero-argument tool
    const maliciousArgs = { uid: 'victim-uid-888', classId: 'victim-class' };
    const result = await studentToolRegistry.executeTool(
      'student.getProfile',
      maliciousArgs,
      mockContext,
    );

    // Strict schema rejects smuggled argument parameters
    expect(result.status).toBe('error');
    expect(result.error?.code).toBe('INVALID_TOOL_ARGUMENTS');

    // Valid call only uses mockContext, never arbitrary client data
    const validResult = await studentToolRegistry.executeTool(
      'student.getProfile',
      {},
      mockContext,
    );
    expect(validResult.status).toBe('success');
    expect(studentService.getProfile).toHaveBeenCalledWith(mockContext);
  });
});
