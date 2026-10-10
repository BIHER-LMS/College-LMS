import { z } from 'zod';
import { FACULTY_TOOL_NAMES, FacultyToolName } from './facultyAi.types';

/**
 * ============================================================================
 * Chat Request & Tool Choice Schemas
 * ============================================================================
 */

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty').max(5000),
});

export const toolChoiceSchema = z.union([
  z.literal('auto'),
  z.literal('none'),
  z.object({
    type: z.literal('tool'),
    name: z.enum(FACULTY_TOOL_NAMES),
  }),
]);

export const facultyChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required and cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
  history: z
    .array(chatMessageSchema)
    .max(30, 'Conversation history cannot exceed 30 messages')
    .optional(),
  toolChoice: toolChoiceSchema.optional().default('auto'),
});

export const directToolExecutionSchema = z.object({
  toolName: z.enum(FACULTY_TOOL_NAMES),
  arguments: z.record(z.any()).default({}),
});

/**
 * ============================================================================
 * 19 Tool Input Schemas
 * ============================================================================
 */

// 1. faculty.getDashboard
export const facultyGetDashboardInputSchema = z.object({
  refresh: z.boolean().optional(),
});

// 2. faculty.getAssignedClasses
export const facultyGetAssignedClassesInputSchema = z.object({
  isActiveOnly: z.boolean().optional(),
});

// 3. faculty.getClassDetails
export const facultyGetClassDetailsInputSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
});

// 4. faculty.getClassStudents
export const facultyGetClassStudentsInputSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
});

// 5. faculty.getStudentDetails
export const facultyGetStudentDetailsInputSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
});

// 6. faculty.getStudentAttendance
export const facultyGetStudentAttendanceInputSchema = z.object({
  studentId: z.string().min(1, 'studentId is required'),
  classId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// 7. faculty.getClassAttendanceStats
export const facultyGetClassAttendanceStatsInputSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
});

// 8. faculty.getClassAttendanceHistory
export const facultyGetClassAttendanceHistoryInputSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
  limit: z.number().int().positive().max(100).optional().default(20),
});

// 9. faculty.getClassTimetable
export const facultyGetClassTimetableInputSchema = z.object({
  classId: z.string().min(1, 'classId is required'),
});

// 10. faculty.getTimetable
export const facultyGetTimetableInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
});

// 11. faculty.getReminders
export const facultyGetRemindersInputSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
});

// 12. faculty.search
export const facultySearchInputSchema = z.object({
  query: z.string().min(1, 'query cannot be empty').max(100),
});

// 13. faculty.getDepartment
export const facultyGetDepartmentInputSchema = z.object({
  departmentId: z.string().optional(),
});

// 14. faculty.getSubjects
export const facultyGetSubjectsInputSchema = z.object({
  departmentId: z.string().optional(),
  semesterNumber: z.number().int().positive().optional(),
});

// 15. faculty.getAcademicYears
export const facultyGetAcademicYearsInputSchema = z.object({
  collegeId: z.string().optional(),
});

// 16. faculty.getSemesters
export const facultyGetSemestersInputSchema = z.object({
  collegeId: z.string().optional(),
});

// 17. faculty.getPerformance
export const facultyGetPerformanceInputSchema = z.object({
  subjectId: z.string().optional(),
});

// 18. faculty.searchKnowledge
export const facultySearchKnowledgeInputSchema = z.object({
  query: z.string().min(1, 'query is required'),
  category: z
    .enum(['ACADEMIC_POLICY', 'EXAM_REGULATION', 'SYLLABUS', 'INSTITUTIONAL', 'ALL'])
    .optional()
    .default('ALL'),
  topK: z.number().int().positive().max(10).optional().default(5),
});

// 19. faculty.getKnowledgeContext
export const facultyGetKnowledgeContextInputSchema = z.object({
  topic: z.string().min(1, 'topic is required'),
  maxTokens: z.number().int().positive().max(2000).optional().default(500),
});

export const TOOL_INPUT_SCHEMAS: Record<FacultyToolName, z.ZodType<any>> = {
  'faculty.getDashboard': facultyGetDashboardInputSchema,
  'faculty.getAssignedClasses': facultyGetAssignedClassesInputSchema,
  'faculty.getClassDetails': facultyGetClassDetailsInputSchema,
  'faculty.getClassStudents': facultyGetClassStudentsInputSchema,
  'faculty.getStudentDetails': facultyGetStudentDetailsInputSchema,
  'faculty.getStudentAttendance': facultyGetStudentAttendanceInputSchema,
  'faculty.getClassAttendanceStats': facultyGetClassAttendanceStatsInputSchema,
  'faculty.getClassAttendanceHistory': facultyGetClassAttendanceHistoryInputSchema,
  'faculty.getClassTimetable': facultyGetClassTimetableInputSchema,
  'faculty.getTimetable': facultyGetTimetableInputSchema,
  'faculty.getReminders': facultyGetRemindersInputSchema,
  'faculty.search': facultySearchInputSchema,
  'faculty.getDepartment': facultyGetDepartmentInputSchema,
  'faculty.getSubjects': facultyGetSubjectsInputSchema,
  'faculty.getAcademicYears': facultyGetAcademicYearsInputSchema,
  'faculty.getSemesters': facultyGetSemestersInputSchema,
  'faculty.getPerformance': facultyGetPerformanceInputSchema,
  'faculty.searchKnowledge': facultySearchKnowledgeInputSchema,
  'faculty.getKnowledgeContext': facultyGetKnowledgeContextInputSchema,
};

/**
 * ============================================================================
 * 19 Tool Output Schemas
 * ============================================================================
 */

export const facultyGetDashboardOutputSchema = z.object({
  faculty: z.object({
    uid: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable(),
    employeeId: z.string().nullable(),
    designation: z.string(),
    profilePhoto: z.string().nullable(),
  }),
  department: z
    .object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      code: z.string().nullable(),
      hodName: z.string().nullable(),
    })
    .nullable(),
  classIncharge: z.object({
    isAssigned: z.boolean(),
    class: z
      .object({
        id: z.string(),
        name: z.string(),
        currentSemester: z.number().nullable(),
        batch: z.string().nullable(),
        program: z.string().nullable(),
        studentCount: z.number(),
      })
      .nullable(),
  }),
  assignedSubject: z
    .object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      credits: z.number().nullable(),
      semesterNumber: z.number(),
    })
    .nullable(),
  assignedSubjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      classId: z.string(),
      className: z.string(),
    }),
  ),
  academicYear: z
    .object({
      id: z.string(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })
    .nullable(),
  semester: z
    .object({
      id: z.string(),
      termNumber: z.number(),
      startDate: z.string(),
      endDate: z.string(),
    })
    .nullable(),
  _isStub: z.boolean().optional(),
});

export const facultyGetAssignedClassesOutputSchema = z.object({
  classes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      batch: z.string().nullable(),
      program: z.string().nullable(),
      department: z.string().nullable(),
      currentSemester: z.number().nullable(),
      isActive: z.boolean(),
      inchargeFaculty: z.object({
        uid: z.string(),
        name: z.string(),
      }),
      studentCount: z.number(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetClassDetailsOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  batch: z.string().nullable(),
  program: z.string().nullable(),
  department: z.string().nullable(),
  currentSemester: z.number().nullable(),
  isActive: z.boolean(),
  inchargeFaculty: z.object({
    uid: z.string(),
    name: z.string(),
  }),
  studentCount: z.number(),
  classRep: z
    .object({
      uid: z.string(),
      name: z.string(),
      email: z.string(),
      registerNumber: z.string().nullable(),
    })
    .nullable(),
  overallAttendance: z.number().nullable(),
  overallPerformance: z.string().nullable(),
  _isStub: z.boolean().optional(),
});

export const facultyGetClassStudentsOutputSchema = z.object({
  classId: z.string(),
  students: z.array(
    z.object({
      uid: z.string(),
      name: z.string(),
      registerNumber: z.string().nullable(),
      email: z.string(),
      dob: z.string().nullable(),
      phone: z.string().nullable(),
      parentPhone: z.string().nullable(),
      profilePhoto: z.string().nullable(),
      accountStatus: z.string(),
      isClassRep: z.boolean(),
      attendancePercentage: z.number().nullable(),
      performanceGrade: z.string().nullable(),
      performanceScore: z.number().nullable(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetStudentDetailsOutputSchema = z.object({
  uid: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  displayName: z.string(),
  registerNumber: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
  profilePhoto: z.string().nullable(),
  accountStatus: z.string(),
  className: z.string(),
  classId: z.string(),
  departmentName: z.string().nullable(),
  enrollmentYear: z.number().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  _isStub: z.boolean().optional(),
});

export const facultyGetStudentAttendanceOutputSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  registerNumber: z.string().nullable(),
  classId: z.string(),
  className: z.string(),
  overallPercentage: z.number(),
  totalSessions: z.number(),
  presentSessions: z.number(),
  absentSessions: z.number(),
  isDefaulter: z.boolean(),
  recentSessions: z.array(
    z.object({
      date: z.string(),
      period: z.string(),
      subjectName: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    }),
  ),
  _isStub: z.boolean().optional(),
});

export const facultyGetClassAttendanceStatsOutputSchema = z.object({
  classId: z.string(),
  className: z.string(),
  totalStudents: z.number(),
  averageAttendancePercentage: z.number(),
  totalSessionsConducted: z.number(),
  defaultersCount: z.number(),
  goodAttendanceCount: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetClassAttendanceHistoryOutputSchema = z.object({
  classId: z.string(),
  sessions: z.array(
    z.object({
      id: z.string(),
      classId: z.string(),
      date: z.string(),
      period: z.string(),
      subjectName: z.string(),
      totalPresent: z.number(),
      totalAbsent: z.number(),
      attendancePercentage: z.number(),
      takenBy: z.string(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetClassTimetableOutputSchema = z.object({
  classId: z.string(),
  timetable: z.array(
    z.object({
      id: z.string(),
      classId: z.string(),
      dayOfWeek: z.number(),
      period: z.number(),
      startTime: z.string(),
      endTime: z.string(),
      subjectName: z.string(),
      subjectCode: z.string(),
      facultyName: z.string(),
      roomNumber: z.string().nullable(),
    }),
  ),
  totalSlots: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetTimetableOutputSchema = z.object({
  facultyUid: z.string(),
  slots: z.array(
    z.object({
      id: z.string(),
      dayOfWeek: z.number(),
      period: z.number(),
      startTime: z.string(),
      endTime: z.string(),
      subjectName: z.string(),
      subjectCode: z.string(),
      className: z.string(),
      classId: z.string(),
      roomNumber: z.string().nullable(),
    }),
  ),
  totalSlots: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetRemindersOutputSchema = z.object({
  reminders: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      dueDate: z.string().nullable(),
      dueTime: z.string().nullable(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      status: z.enum(['PENDING', 'COMPLETED']),
      type: z.string(),
    }),
  ),
  total: z.number(),
  pendingCount: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultySearchOutputSchema = z.object({
  query: z.string(),
  students: z.array(
    z.object({
      uid: z.string(),
      name: z.string(),
      registerNumber: z.string().nullable(),
      className: z.string(),
    }),
  ),
  classes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      studentCount: z.number(),
    }),
  ),
  subjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
    }),
  ),
  _isStub: z.boolean().optional(),
});

export const facultyGetDepartmentOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  collegeName: z.string().nullable(),
  hodName: z.string().nullable(),
  programs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string().nullable(),
      durationYears: z.number(),
    }),
  ),
  subjectsCount: z.number(),
  status: z.string(),
  _isStub: z.boolean().optional(),
});

export const facultyGetSubjectsOutputSchema = z.object({
  subjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      code: z.string(),
      credits: z.number(),
      semesterNumber: z.number(),
      isActive: z.boolean(),
      departmentId: z.string(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetAcademicYearsOutputSchema = z.object({
  academicYears: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      isCurrent: z.boolean(),
      status: z.string(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetSemestersOutputSchema = z.object({
  semesters: z.array(
    z.object({
      id: z.string(),
      academicYearId: z.string(),
      academicYearName: z.string(),
      termNumber: z.number(),
      startDate: z.string(),
      endDate: z.string(),
      isCurrent: z.boolean(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetPerformanceOutputSchema = z.object({
  performances: z.array(
    z.object({
      subjectId: z.string(),
      subjectName: z.string(),
      subjectCode: z.string(),
      classId: z.string(),
      className: z.string(),
      averageScore: z.number(),
      passPercentage: z.number(),
      totalStudents: z.number(),
      highestScore: z.number(),
      lowestScore: z.number(),
    }),
  ),
  total: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultySearchKnowledgeOutputSchema = z.object({
  query: z.string(),
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      snippet: z.string(),
      score: z.number(),
      category: z.string(),
      sourceUrl: z.string().optional(),
    }),
  ),
  totalMatches: z.number(),
  _isStub: z.boolean().optional(),
});

export const facultyGetKnowledgeContextOutputSchema = z.object({
  topic: z.string(),
  contextText: z.string(),
  citations: z.array(z.string()),
  lastUpdated: z.string(),
  _isStub: z.boolean().optional(),
});

export const TOOL_OUTPUT_SCHEMAS: Record<FacultyToolName, z.ZodType<any>> = {
  'faculty.getDashboard': facultyGetDashboardOutputSchema,
  'faculty.getAssignedClasses': facultyGetAssignedClassesOutputSchema,
  'faculty.getClassDetails': facultyGetClassDetailsOutputSchema,
  'faculty.getClassStudents': facultyGetClassStudentsOutputSchema,
  'faculty.getStudentDetails': facultyGetStudentDetailsOutputSchema,
  'faculty.getStudentAttendance': facultyGetStudentAttendanceOutputSchema,
  'faculty.getClassAttendanceStats': facultyGetClassAttendanceStatsOutputSchema,
  'faculty.getClassAttendanceHistory': facultyGetClassAttendanceHistoryOutputSchema,
  'faculty.getClassTimetable': facultyGetClassTimetableOutputSchema,
  'faculty.getTimetable': facultyGetTimetableOutputSchema,
  'faculty.getReminders': facultyGetRemindersOutputSchema,
  'faculty.search': facultySearchOutputSchema,
  'faculty.getDepartment': facultyGetDepartmentOutputSchema,
  'faculty.getSubjects': facultyGetSubjectsOutputSchema,
  'faculty.getAcademicYears': facultyGetAcademicYearsOutputSchema,
  'faculty.getSemesters': facultyGetSemestersOutputSchema,
  'faculty.getPerformance': facultyGetPerformanceOutputSchema,
  'faculty.searchKnowledge': facultySearchKnowledgeOutputSchema,
  'faculty.getKnowledgeContext': facultyGetKnowledgeContextOutputSchema,
};
