import {
  FACULTY_TOOL_NAMES,
  FacultyToolName,
  isFacultyToolName,
  FacultyContext,
  ToolExecutionResult,
  ToolHandler,
  ToolMetadata,
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
  FacultySearchKnowledgeInput,
  FacultySearchKnowledgeOutput,
  FacultyGetKnowledgeContextInput,
  FacultyGetKnowledgeContextOutput,
} from './facultyAi.types';
import {
  TOOL_INPUT_SCHEMAS,
  TOOL_OUTPUT_SCHEMAS,
} from './facultyAi.validation';

/**
 * ============================================================================
 * Default Stub Handlers (Realistic Dummy Data)
 * ============================================================================
 * These provide deterministic, schema-compliant placeholder execution
 * during Step 1 (Tushar). Ashik (Step 2) and Jeresh (Step 3) will provide
 * live database/RAG implementations via `registerToolHandler`.
 */
export const defaultStubHandlers: {
  [K in FacultyToolName]: ToolHandler<any, any>;
} = {
  // 1. faculty.getDashboard
  'faculty.getDashboard': async (
    _input: FacultyGetDashboardInput,
    context: FacultyContext,
  ): Promise<FacultyGetDashboardOutput> => {
    return {
      faculty: {
        uid: context.uid,
        name: context.displayName || 'Prof. Faculty Member',
        email: context.email,
        phone: '+91 98765 43210',
        employeeId: 'EMP-FAC-042',
        designation: 'Assistant Professor & Class Incharge',
        profilePhoto: context.photoUrl || null,
      },
      department: {
        id: context.departmentId || 'dept-cse-01',
        name: 'Department of Computer Science and Engineering',
        code: 'CSE',
        hodName: 'Dr. Alan Turing',
      },
      classIncharge: {
        isAssigned: true,
        class: {
          id: 'cls-cse-3a',
          name: 'CSE-3A',
          currentSemester: 5,
          batch: '2023-2027',
          program: 'B.Tech Computer Science and Engineering',
          studentCount: 48,
        },
      },
      assignedSubject: {
        id: 'sub-cse-501',
        name: 'Design and Analysis of Algorithms',
        code: 'CS501',
        credits: 4,
        semesterNumber: 5,
      },
      assignedSubjects: [
        {
          id: 'sub-cse-501',
          name: 'Design and Analysis of Algorithms',
          code: 'CS501',
          classId: 'cls-cse-3a',
          className: 'CSE-3A',
        },
        {
          id: 'sub-cse-502',
          name: 'Database Management Systems Lab',
          code: 'CS502L',
          classId: 'cls-cse-3b',
          className: 'CSE-3B',
        },
      ],
      academicYear: {
        id: 'ay-2026-2027',
        name: 'Academic Year 2026-2027',
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2027-05-31T00:00:00.000Z',
      },
      semester: {
        id: 'sem-odd-2026',
        termNumber: 5,
        startDate: '2026-07-15T00:00:00.000Z',
        endDate: '2026-11-30T00:00:00.000Z',
      },
      _isStub: true,
    };
  },

  // 2. faculty.getAssignedClasses
  'faculty.getAssignedClasses': async (
    _input: FacultyGetAssignedClassesInput,
    context: FacultyContext,
  ): Promise<FacultyGetAssignedClassesOutput> => {
    return {
      classes: [
        {
          id: 'cls-cse-3a',
          name: 'CSE-3A',
          batch: '2023-2027',
          program: 'B.Tech CSE',
          department: 'Computer Science and Engineering',
          currentSemester: 5,
          isActive: true,
          inchargeFaculty: {
            uid: context.uid,
            name: context.displayName || 'You (Class Incharge)',
          },
          studentCount: 48,
        },
        {
          id: 'cls-cse-3b',
          name: 'CSE-3B',
          batch: '2023-2027',
          program: 'B.Tech CSE',
          department: 'Computer Science and Engineering',
          currentSemester: 5,
          isActive: true,
          inchargeFaculty: {
            uid: context.uid,
            name: 'You (Subject Teacher)',
          },
          studentCount: 46,
        },
      ],
      total: 2,
      _isStub: true,
    };
  },

  // 3. faculty.getClassDetails
  'faculty.getClassDetails': async (
    input: FacultyGetClassDetailsInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassDetailsOutput> => {
    return {
      id: input.classId,
      name: 'CSE-3A',
      batch: '2023-2027',
      program: 'B.Tech Computer Science and Engineering',
      department: 'Computer Science and Engineering',
      currentSemester: 5,
      isActive: true,
      inchargeFaculty: {
        uid: context.uid,
        name: context.displayName || 'Class Incharge',
      },
      studentCount: 48,
      classRep: {
        uid: 'std-rep-001',
        name: 'Rahul Sharma',
        email: 'rahul.rep@college.edu',
        registerNumber: 'REG2023CSE001',
      },
      overallAttendance: 88.5,
      overallPerformance: 'A (Very Good)',
      _isStub: true,
    };
  },

  // 4. faculty.getClassStudents
  'faculty.getClassStudents': async (
    input: FacultyGetClassStudentsInput,
    _context: FacultyContext,
  ): Promise<FacultyGetClassStudentsOutput> => {
    return {
      classId: input.classId,
      students: [
        {
          uid: 'std-cse-001',
          name: 'Rahul Sharma',
          registerNumber: 'REG2023CSE001',
          email: 'rahul.sharma@college.edu',
          dob: '2004-05-12',
          phone: '+91 98765 00001',
          parentPhone: '+91 98765 11111',
          profilePhoto: null,
          accountStatus: 'ACTIVE',
          isClassRep: true,
          attendancePercentage: 94.2,
          performanceGrade: 'A+',
          performanceScore: 92,
        },
        {
          uid: 'std-cse-002',
          name: 'Priya Patel',
          registerNumber: 'REG2023CSE002',
          email: 'priya.patel@college.edu',
          dob: '2004-08-20',
          phone: '+91 98765 00002',
          parentPhone: '+91 98765 22222',
          profilePhoto: null,
          accountStatus: 'ACTIVE',
          isClassRep: false,
          attendancePercentage: 86.0,
          performanceGrade: 'A',
          performanceScore: 84,
        },
        {
          uid: 'std-cse-003',
          name: 'Amit Verma',
          registerNumber: 'REG2023CSE003',
          email: 'amit.verma@college.edu',
          dob: '2004-02-14',
          phone: '+91 98765 00003',
          parentPhone: '+91 98765 33333',
          profilePhoto: null,
          accountStatus: 'ACTIVE',
          isClassRep: false,
          attendancePercentage: 68.5,
          performanceGrade: 'C',
          performanceScore: 62,
        },
      ],
      total: 3,
      _isStub: true,
    };
  },

  // 5. faculty.getStudentDetails
  'faculty.getStudentDetails': async (
    input: FacultyGetStudentDetailsInput,
    _context: FacultyContext,
  ): Promise<FacultyGetStudentDetailsOutput> => {
    return {
      uid: input.studentId,
      firstName: 'Rahul',
      lastName: 'Sharma',
      displayName: 'Rahul Sharma',
      registerNumber: 'REG2023CSE001',
      email: 'rahul.sharma@college.edu',
      phone: '+91 98765 00001',
      profilePhoto: null,
      accountStatus: 'ACTIVE',
      className: 'CSE-3A',
      classId: 'cls-cse-3a',
      departmentName: 'Computer Science and Engineering',
      enrollmentYear: 2023,
      city: 'Chennai',
      state: 'Tamil Nadu',
      _isStub: true,
    };
  },

  // 6. faculty.getStudentAttendance
  'faculty.getStudentAttendance': async (
    input: FacultyGetStudentAttendanceInput,
    _context: FacultyContext,
  ): Promise<FacultyGetStudentAttendanceOutput> => {
    return {
      studentId: input.studentId,
      studentName: 'Rahul Sharma',
      registerNumber: 'REG2023CSE001',
      classId: input.classId || 'cls-cse-3a',
      className: 'CSE-3A',
      overallPercentage: 92.5,
      totalSessions: 40,
      presentSessions: 37,
      absentSessions: 3,
      isDefaulter: false,
      recentSessions: [
        {
          date: '2026-10-08',
          period: 'Period 1 (09:00 - 10:00)',
          subjectName: 'Design and Analysis of Algorithms',
          status: 'PRESENT',
        },
        {
          date: '2026-10-07',
          period: 'Period 3 (11:15 - 12:15)',
          subjectName: 'Design and Analysis of Algorithms',
          status: 'PRESENT',
        },
        {
          date: '2026-10-06',
          period: 'Period 2 (10:00 - 11:00)',
          subjectName: 'Database Management Systems',
          status: 'ABSENT',
        },
      ],
      _isStub: true,
    };
  },

  // 7. faculty.getClassAttendanceStats
  'faculty.getClassAttendanceStats': async (
    input: FacultyGetClassAttendanceStatsInput,
    _context: FacultyContext,
  ): Promise<FacultyGetClassAttendanceStatsOutput> => {
    return {
      classId: input.classId,
      className: 'CSE-3A',
      totalStudents: 48,
      averageAttendancePercentage: 88.4,
      totalSessionsConducted: 42,
      defaultersCount: 3,
      goodAttendanceCount: 45,
      _isStub: true,
    };
  },

  // 8. faculty.getClassAttendanceHistory
  'faculty.getClassAttendanceHistory': async (
    input: FacultyGetClassAttendanceHistoryInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassAttendanceHistoryOutput> => {
    return {
      classId: input.classId,
      sessions: [
        {
          id: 'sess-001',
          classId: input.classId,
          date: '2026-10-09',
          period: 'Period 1',
          subjectName: 'Design and Analysis of Algorithms',
          totalPresent: 45,
          totalAbsent: 3,
          attendancePercentage: 93.75,
          takenBy: context.displayName || 'You',
        },
        {
          id: 'sess-002',
          classId: input.classId,
          date: '2026-10-08',
          period: 'Period 2',
          subjectName: 'Database Management Systems',
          totalPresent: 44,
          totalAbsent: 4,
          attendancePercentage: 91.67,
          takenBy: context.displayName || 'You',
        },
      ],
      total: 2,
      _isStub: true,
    };
  },

  // 9. faculty.getClassTimetable
  'faculty.getClassTimetable': async (
    input: FacultyGetClassTimetableInput,
    context: FacultyContext,
  ): Promise<FacultyGetClassTimetableOutput> => {
    return {
      classId: input.classId,
      timetable: [
        {
          id: 'slot-cls-1',
          classId: input.classId,
          dayOfWeek: 1,
          period: 1,
          startTime: '09:00',
          endTime: '10:00',
          subjectName: 'Design and Analysis of Algorithms',
          subjectCode: 'CS501',
          facultyName: context.displayName || 'Prof. Faculty Member',
          roomNumber: 'Room 301',
        },
        {
          id: 'slot-cls-2',
          classId: input.classId,
          dayOfWeek: 1,
          period: 2,
          startTime: '10:00',
          endTime: '11:00',
          subjectName: 'Operating Systems',
          subjectCode: 'CS502',
          facultyName: 'Dr. Grace Hopper',
          roomNumber: 'Room 301',
        },
      ],
      totalSlots: 2,
      _isStub: true,
    };
  },

  // 10. faculty.getTimetable
  'faculty.getTimetable': async (
    _input: FacultyGetTimetableInput,
    context: FacultyContext,
  ): Promise<FacultyGetTimetableOutput> => {
    return {
      facultyUid: context.uid,
      slots: [
        {
          id: 'slot-fac-1',
          dayOfWeek: 1,
          period: 1,
          startTime: '09:00',
          endTime: '10:00',
          subjectName: 'Design and Analysis of Algorithms',
          subjectCode: 'CS501',
          className: 'CSE-3A',
          classId: 'cls-cse-3a',
          roomNumber: 'Room 301',
        },
        {
          id: 'slot-fac-2',
          dayOfWeek: 2,
          period: 3,
          startTime: '11:15',
          endTime: '12:15',
          subjectName: 'Design and Analysis of Algorithms',
          subjectCode: 'CS501',
          className: 'CSE-3A',
          classId: 'cls-cse-3a',
          roomNumber: 'Room 301',
        },
        {
          id: 'slot-fac-3',
          dayOfWeek: 3,
          period: 4,
          startTime: '13:30',
          endTime: '15:30',
          subjectName: 'Database Management Systems Lab',
          subjectCode: 'CS502L',
          className: 'CSE-3B',
          classId: 'cls-cse-3b',
          roomNumber: 'Lab 2',
        },
      ],
      totalSlots: 3,
      _isStub: true,
    };
  },

  // 11. faculty.getReminders
  'faculty.getReminders': async (
    _input: FacultyGetRemindersInput,
    _context: FacultyContext,
  ): Promise<FacultyGetRemindersOutput> => {
    return {
      reminders: [
        {
          id: 'rem-001',
          title: 'Submit Midterm Exam Question Papers',
          description: 'Submit CS501 question paper to HOD office by Friday.',
          dueDate: '2026-10-16',
          dueTime: '17:00',
          priority: 'HIGH',
          status: 'PENDING',
          type: 'EXAM',
        },
        {
          id: 'rem-002',
          title: 'Review Attendance Shortage for CSE-3A',
          description: 'Identify students below 75% attendance for parent notification.',
          dueDate: '2026-10-12',
          dueTime: '14:00',
          priority: 'MEDIUM',
          status: 'PENDING',
          type: 'ATTENDANCE',
        },
      ],
      total: 2,
      pendingCount: 2,
      _isStub: true,
    };
  },

  // 12. faculty.search
  'faculty.search': async (
    input: FacultySearchInput,
    _context: FacultyContext,
  ): Promise<FacultySearchOutput> => {
    return {
      query: input.query,
      students: [
        {
          uid: 'std-cse-001',
          name: 'Rahul Sharma',
          registerNumber: 'REG2023CSE001',
          className: 'CSE-3A',
        },
      ],
      classes: [
        {
          id: 'cls-cse-3a',
          name: 'CSE-3A',
          studentCount: 48,
        },
      ],
      subjects: [
        {
          id: 'sub-cse-501',
          name: 'Design and Analysis of Algorithms',
          code: 'CS501',
        },
      ],
      _isStub: true,
    };
  },

  // 13. faculty.getDepartment
  'faculty.getDepartment': async (
    input: FacultyGetDepartmentInput,
    context: FacultyContext,
  ): Promise<FacultyGetDepartmentOutput> => {
    return {
      id: input.departmentId || context.departmentId || 'dept-cse-01',
      name: 'Department of Computer Science and Engineering',
      code: 'CSE',
      collegeName: 'Bharath Institute of Higher Education and Research',
      hodName: 'Dr. Alan Turing',
      programs: [
        {
          id: 'prog-btech-cse',
          name: 'B.Tech Computer Science and Engineering',
          type: 'UG',
          durationYears: 4,
        },
        {
          id: 'prog-mtech-cse',
          name: 'M.Tech Computer Science and Engineering',
          type: 'PG',
          durationYears: 2,
        },
      ],
      subjectsCount: 42,
      status: 'ACTIVE',
      _isStub: true,
    };
  },

  // 14. faculty.getSubjects
  'faculty.getSubjects': async (
    _input: FacultyGetSubjectsInput,
    context: FacultyContext,
  ): Promise<FacultyGetSubjectsOutput> => {
    return {
      subjects: [
        {
          id: 'sub-cse-501',
          name: 'Design and Analysis of Algorithms',
          code: 'CS501',
          credits: 4,
          semesterNumber: 5,
          isActive: true,
          departmentId: context.departmentId || 'dept-cse-01',
        },
        {
          id: 'sub-cse-502',
          name: 'Operating Systems',
          code: 'CS502',
          credits: 4,
          semesterNumber: 5,
          isActive: true,
          departmentId: context.departmentId || 'dept-cse-01',
        },
        {
          id: 'sub-cse-503',
          name: 'Database Management Systems',
          code: 'CS503',
          credits: 3,
          semesterNumber: 5,
          isActive: true,
          departmentId: context.departmentId || 'dept-cse-01',
        },
      ],
      total: 3,
      _isStub: true,
    };
  },

  // 15. faculty.getAcademicYears
  'faculty.getAcademicYears': async (
    _input: FacultyGetAcademicYearsInput,
    _context: FacultyContext,
  ): Promise<FacultyGetAcademicYearsOutput> => {
    return {
      academicYears: [
        {
          id: 'ay-2026-2027',
          name: '2026-2027',
          startDate: '2026-07-01T00:00:00.000Z',
          endDate: '2027-05-31T00:00:00.000Z',
          isCurrent: true,
          status: 'ACTIVE',
        },
        {
          id: 'ay-2025-2026',
          name: '2025-2026',
          startDate: '2025-07-01T00:00:00.000Z',
          endDate: '2026-05-31T00:00:00.000Z',
          isCurrent: false,
          status: 'COMPLETED',
        },
      ],
      total: 2,
      _isStub: true,
    };
  },

  // 16. faculty.getSemesters
  'faculty.getSemesters': async (
    _input: FacultyGetSemestersInput,
    _context: FacultyContext,
  ): Promise<FacultyGetSemestersOutput> => {
    return {
      semesters: [
        {
          id: 'sem-odd-2026',
          academicYearId: 'ay-2026-2027',
          academicYearName: '2026-2027',
          termNumber: 5,
          startDate: '2026-07-15T00:00:00.000Z',
          endDate: '2026-11-30T00:00:00.000Z',
          isCurrent: true,
        },
        {
          id: 'sem-even-2027',
          academicYearId: 'ay-2026-2027',
          academicYearName: '2026-2027',
          termNumber: 6,
          startDate: '2027-01-05T00:00:00.000Z',
          endDate: '2027-05-15T00:00:00.000Z',
          isCurrent: false,
        },
      ],
      total: 2,
      _isStub: true,
    };
  },

  // 17. faculty.getPerformance
  'faculty.getPerformance': async (
    _input: FacultyGetPerformanceInput,
    _context: FacultyContext,
  ): Promise<FacultyGetPerformanceOutput> => {
    return {
      performances: [
        {
          subjectId: 'sub-cse-501',
          subjectName: 'Design and Analysis of Algorithms',
          subjectCode: 'CS501',
          classId: 'cls-cse-3a',
          className: 'CSE-3A',
          averageScore: 78.5,
          passPercentage: 91.6,
          totalStudents: 48,
          highestScore: 98,
          lowestScore: 42,
        },
      ],
      total: 1,
      _isStub: true,
    };
  },

  // 18. faculty.searchKnowledge
  'faculty.searchKnowledge': async (
    input: FacultySearchKnowledgeInput,
    _context: FacultyContext,
  ): Promise<FacultySearchKnowledgeOutput> => {
    return {
      query: input.query,
      results: [
        {
          id: 'doc-att-policy-01',
          title: 'Institutional Attendance Policy & Condonation Rules',
          snippet:
            'Students require a minimum of 75% attendance in each course to be eligible for end-semester examinations. Condonation of shortage (65%-74%) may be granted on medical grounds upon recommendation of the Class Incharge and approval by HOD.',
          score: 0.94,
          category: 'ACADEMIC_POLICY',
          sourceUrl: '/docs/handbook#attendance',
        },
        {
          id: 'doc-internal-marks-02',
          title: 'Continuous Assessment & Internal Evaluation Guidelines',
          snippet:
            'Internal assessments comprise 40% of the course grade: 20 marks from internal tests, 10 marks from assignments/case studies, and 10 marks from attendance and active laboratory participation.',
          score: 0.88,
          category: 'EXAM_REGULATION',
          sourceUrl: '/docs/handbook#internal-assessment',
        },
      ],
      totalMatches: 2,
      _isStub: true,
    };
  },

  // 19. faculty.getKnowledgeContext
  'faculty.getKnowledgeContext': async (
    input: FacultyGetKnowledgeContextInput,
    _context: FacultyContext,
  ): Promise<FacultyGetKnowledgeContextOutput> => {
    return {
      topic: input.topic,
      contextText:
        'Official Academic Regulations Section 4.2: Every student must attend at least 75% of scheduled lectures, tutorials, and practical classes. The Class Incharge is responsible for monitoring attendance fortnightly and issuing advisories to students falling below the statutory threshold.',
      citations: ['Academic Regulations Handbook 2026-2027, Section 4.2'],
      lastUpdated: '2026-08-01T00:00:00.000Z',
      _isStub: true,
    };
  },
};

/**
 * ============================================================================
 * Tool Metadata Dictionary for All 19 Tools
 * ============================================================================
 */
export const FACULTY_TOOL_METADATA: Record<FacultyToolName, ToolMetadata> = {
  'faculty.getDashboard': {
    name: 'faculty.getDashboard',
    description: 'Retrieve faculty profile, class incharge status, assigned subjects, and current semester metadata.',
    inputDescription: 'Optional { refresh?: boolean }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getAssignedClasses': {
    name: 'faculty.getAssignedClasses',
    description: 'List all academic classes assigned to this faculty member (both as Class Incharge and Subject Teacher).',
    inputDescription: 'Optional { isActiveOnly?: boolean }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getClassDetails': {
    name: 'faculty.getClassDetails',
    description: 'Retrieve detailed information for an assigned class, including incharge, class rep, and student count.',
    inputDescription: 'Requires { classId: string }',
    requiredPermissions: ['FACULTY', 'CLASS_INCHARGE'],
  },
  'faculty.getClassStudents': {
    name: 'faculty.getClassStudents',
    description: 'List all students enrolled in the specified class with attendance percentage, academic grade, and contact details.',
    inputDescription: 'Requires { classId: string }',
    requiredPermissions: ['FACULTY', 'CLASS_INCHARGE'],
  },
  'faculty.getStudentDetails': {
    name: 'faculty.getStudentDetails',
    description: 'Retrieve comprehensive academic and profile details for an individual student in the assigned class.',
    inputDescription: 'Requires { studentId: string }',
    requiredPermissions: ['FACULTY', 'CLASS_INCHARGE'],
  },
  'faculty.getStudentAttendance': {
    name: 'faculty.getStudentAttendance',
    description: 'Retrieve student attendance summary, percentage, defaulter flag, and recent session breakdown.',
    inputDescription: 'Requires { studentId: string, classId?: string, startDate?: string, endDate?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getClassAttendanceStats': {
    name: 'faculty.getClassAttendanceStats',
    description: 'Retrieve aggregated attendance statistics for an assigned class including average percentage and defaulter count.',
    inputDescription: 'Requires { classId: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getClassAttendanceHistory': {
    name: 'faculty.getClassAttendanceHistory',
    description: 'Retrieve chronological attendance sessions conducted for a class with present/absent counts.',
    inputDescription: 'Requires { classId: string, limit?: number }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getClassTimetable': {
    name: 'faculty.getClassTimetable',
    description: 'Retrieve the master period-wise class schedule and timetable for all subjects in a class.',
    inputDescription: 'Requires { classId: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getTimetable': {
    name: 'faculty.getTimetable',
    description: 'Retrieve the personal teaching timetable and schedule for the logged-in faculty member.',
    inputDescription: 'Optional { dayOfWeek?: number }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getReminders': {
    name: 'faculty.getReminders',
    description: 'Retrieve active academic reminders, upcoming tasks, and deadlines for the faculty member.',
    inputDescription: 'Optional { type?: string, status?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.search': {
    name: 'faculty.search',
    description: 'Search across assigned classes, enrolled students, and teaching subjects by name, code, or register number.',
    inputDescription: 'Requires { query: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getDepartment': {
    name: 'faculty.getDepartment',
    description: 'Retrieve departmental overview, HOD information, active academic programs, and subject count.',
    inputDescription: 'Optional { departmentId?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getSubjects': {
    name: 'faculty.getSubjects',
    description: 'List department curriculum subjects filtered optionally by semester number.',
    inputDescription: 'Optional { departmentId?: string, semesterNumber?: number }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getAcademicYears': {
    name: 'faculty.getAcademicYears',
    description: 'Retrieve institutional academic years and mark current session.',
    inputDescription: 'Optional { collegeId?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getSemesters': {
    name: 'faculty.getSemesters',
    description: 'Retrieve institutional terms and semester date ranges.',
    inputDescription: 'Optional { collegeId?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getPerformance': {
    name: 'faculty.getPerformance',
    description: 'Retrieve subject-wise student performance, average marks, and pass percentages.',
    inputDescription: 'Optional { subjectId?: string }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.searchKnowledge': {
    name: 'faculty.searchKnowledge',
    description: 'Query institutional academic policies, evaluation regulations, syllabus documents, and exam guidelines.',
    inputDescription: 'Requires { query: string, category?: string, topK?: number }',
    requiredPermissions: ['FACULTY'],
  },
  'faculty.getKnowledgeContext': {
    name: 'faculty.getKnowledgeContext',
    description: 'Retrieve verbatim regulatory context and handbook citations for a specific academic topic.',
    inputDescription: 'Requires { topic: string, maxTokens?: number }',
    requiredPermissions: ['FACULTY'],
  },
};

/**
 * ============================================================================
 * Faculty Tool Registry Class
 * ============================================================================
 */
export class FacultyToolRegistry {
  private handlers: Map<FacultyToolName, ToolHandler<any, any>> = new Map();

  constructor() {
    this.resetToDefaultStubs();
  }

  /**
   * Reset all tool handlers back to default stubs.
   */
  public resetToDefaultStubs(): void {
    this.handlers.clear();
    for (const name of FACULTY_TOOL_NAMES) {
      this.handlers.set(name, defaultStubHandlers[name]);
    }
  }

  /**
   * Register or override a tool handler.
   * Enables Ashik (Step 2: backend data tools) and Jeresh (Step 3: RAG) to plug in
   * live implementations seamlessly.
   */
  public registerToolHandler<TInput, TOutput>(
    name: FacultyToolName,
    handler: ToolHandler<TInput, TOutput>,
  ): void {
    if (!isFacultyToolName(name)) {
      throw new Error(`Cannot register unknown tool: ${name}`);
    }
    this.handlers.set(name, handler);
  }

  /**
   * Retrieve metadata for a single tool.
   */
  public getToolMetadata(name: FacultyToolName): ToolMetadata {
    return FACULTY_TOOL_METADATA[name];
  }

  /**
   * List all 19 canonical tools and their schemas/metadata.
   */
  public listTools(): ToolMetadata[] {
    return FACULTY_TOOL_NAMES.map((name) => FACULTY_TOOL_METADATA[name]);
  }

  /**
   * Safely execute a tool with:
   * 1. Tool name validation
   * 2. Identity parameter injection defense (strips client override of uid, collegeId, departmentId)
   * 3. Zod input validation
   * 4. Trusted FacultyContext binding
   * 5. Zod output validation
   * 6. Execution timing & error containment
   */
  public async executeTool(
    name: string,
    rawArgs: Record<string, any> = {},
    context: FacultyContext,
  ): Promise<ToolExecutionResult> {
    const startTime = Date.now();

    // 1. Tool Name Validation
    if (!isFacultyToolName(name)) {
      return {
        toolName: name as any,
        arguments: rawArgs,
        status: 'error',
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool '${name}' is not registered in the canonical Faculty tool registry.`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 2. Identity Parameter Injection Defense
    // Never allow client arguments to override verified session context
    const sanitizedArgs = { ...rawArgs };
    delete sanitizedArgs.uid;
    delete sanitizedArgs.facultyUid;
    delete sanitizedArgs.collegeId;
    delete sanitizedArgs.departmentId;

    // 3. Input Validation via Zod
    const inputSchema = TOOL_INPUT_SCHEMAS[name];
    const parseResult = inputSchema.safeParse(sanitizedArgs);
    if (!parseResult.success) {
      return {
        toolName: name,
        arguments: sanitizedArgs,
        status: 'error',
        error: {
          code: 'INVALID_TOOL_ARGUMENTS',
          message: 'Tool arguments failed schema validation',
          details: parseResult.error.errors,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    // 4. Execution
    const handler = this.handlers.get(name);
    if (!handler) {
      return {
        toolName: name,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: 'HANDLER_NOT_FOUND',
          message: `No handler registered for tool '${name}'.`,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }

    try {
      const output = await handler(parseResult.data, context);

      // 5. Output Validation via Zod
      const outputSchema = TOOL_OUTPUT_SCHEMAS[name];
      const outputParse = outputSchema.safeParse(output);
      if (!outputParse.success) {
        console.warn(`[FacultyToolRegistry] Tool '${name}' output schema validation warning:`, outputParse.error.errors);
      }

      return {
        toolName: name,
        arguments: parseResult.data,
        status: 'success',
        result: output,
        executionDurationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        toolName: name,
        arguments: parseResult.data,
        status: 'error',
        error: {
          code: err.code || 'TOOL_EXECUTION_ERROR',
          message: err.message || 'An error occurred during tool execution',
          details: err.details || null,
        },
        executionDurationMs: Date.now() - startTime,
      };
    }
  }
}

export const facultyToolRegistry = new FacultyToolRegistry();
