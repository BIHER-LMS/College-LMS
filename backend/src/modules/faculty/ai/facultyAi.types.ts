import type { AuthenticatedUserContext } from '../faculty.types';

/**
 * ============================================================================
 * Canonical Faculty AI Tool Names (19 Tools)
 * ============================================================================
 * Strictly defined per 01_Tushar_Faculty_AI_Orchestrator_implementation_plan.md.
 * No variant names or drift permitted.
 */
export const FACULTY_TOOL_NAMES = [
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
  'faculty.searchKnowledge',
  'faculty.getKnowledgeContext',
] as const;

export type FacultyToolName = (typeof FACULTY_TOOL_NAMES)[number];

export function isFacultyToolName(name: string): name is FacultyToolName {
  return (FACULTY_TOOL_NAMES as readonly string[]).includes(name);
}

/**
 * ============================================================================
 * Trusted Faculty Context Interface
 * ============================================================================
 * Derived strictly from verified Bearer Firebase ID token + database profile.
 * Never trust client-supplied identity parameters.
 */
export interface FacultyContext {
  uid: string;
  email: string;
  role: string;
  departmentId: string;
  collegeId: string;
  displayName?: string | null;
  photoUrl?: string | null;
}

/**
 * Convert AuthenticatedUserContext into guaranteed FacultyContext
 */
export function toFacultyContext(user: AuthenticatedUserContext): FacultyContext {
  return {
    uid: user.uid,
    email: user.email,
    role: user.role || 'FACULTY',
    departmentId: user.department_id || '',
    collegeId: user.college_id || '',
    displayName: user.display_name,
    photoUrl: user.photo_url,
  };
}

/**
 * ============================================================================
 * Chat Request & Response Types
 * ============================================================================
 */
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ToolChoiceOption =
  | 'auto'
  | 'none'
  | { type: 'tool'; name: FacultyToolName };

export interface FacultyChatRequest {
  message: string;
  history?: ChatMessage[];
  toolChoice?: ToolChoiceOption;
}

export interface ToolExecutionResult<T = any> {
  toolName: FacultyToolName;
  arguments: Record<string, any>;
  status: 'success' | 'error';
  result?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  executionDurationMs: number;
}

export interface FacultyChatResponseData {
  message: string;
  toolsExecuted: ToolExecutionResult[];
  metadata: {
    facultyUid: string;
    departmentId: string;
    collegeId: string;
    timestamp: string;
    model: string;
  };
}

/**
 * ============================================================================
 * Tool Registry Handler & Metadata Contracts
 * ============================================================================
 */
export type ToolHandler<TInput = any, TOutput = any> = (
  input: TInput,
  context: FacultyContext,
) => Promise<TOutput>;

export interface ToolMetadata {
  name: FacultyToolName;
  description: string;
  inputDescription: string;
  requiredPermissions: string[];
}

/**
 * ============================================================================
 * 19 Individual Tool Input & Output Types
 * ============================================================================
 */

// 1. faculty.getDashboard
export interface FacultyGetDashboardInput {
  refresh?: boolean;
}
export interface FacultyGetDashboardOutput {
  faculty: {
    uid: string;
    name: string;
    email: string;
    phone: string | null;
    employeeId: string | null;
    designation: string;
    profilePhoto: string | null;
  };
  department: {
    id: string | null;
    name: string | null;
    code: string | null;
    hodName: string | null;
  } | null;
  classIncharge: {
    isAssigned: boolean;
    class: {
      id: string;
      name: string;
      currentSemester: number | null;
      batch: string | null;
      program: string | null;
      studentCount: number;
    } | null;
  };
  assignedSubject: {
    id: string;
    name: string;
    code: string;
    credits: number | null;
    semesterNumber: number;
  } | null;
  assignedSubjects: Array<{
    id: string;
    name: string;
    code: string;
    classId: string;
    className: string;
  }>;
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  } | null;
  semester: {
    id: string;
    termNumber: number;
    startDate: string;
    endDate: string;
  } | null;
  _isStub?: boolean;
}

// 2. faculty.getAssignedClasses
export interface FacultyGetAssignedClassesInput {
  isActiveOnly?: boolean;
}
export interface FacultyClassSummaryItem {
  id: string;
  name: string;
  batch: string | null;
  program: string | null;
  department: string | null;
  currentSemester: number | null;
  isActive: boolean;
  inchargeFaculty: {
    uid: string;
    name: string;
  };
  studentCount: number;
}
export interface FacultyGetAssignedClassesOutput {
  classes: FacultyClassSummaryItem[];
  total: number;
  _isStub?: boolean;
}

// 3. faculty.getClassDetails
export interface FacultyGetClassDetailsInput {
  classId: string;
}
export interface FacultyGetClassDetailsOutput {
  id: string;
  name: string;
  batch: string | null;
  program: string | null;
  department: string | null;
  currentSemester: number | null;
  isActive: boolean;
  inchargeFaculty: {
    uid: string;
    name: string;
  };
  studentCount: number;
  classRep: {
    uid: string;
    name: string;
    email: string;
    registerNumber: string | null;
  } | null;
  overallAttendance: number | null;
  overallPerformance: string | null;
  _isStub?: boolean;
}

// 4. faculty.getClassStudents
export interface FacultyGetClassStudentsInput {
  classId: string;
}
export interface ClassStudentItem {
  uid: string;
  name: string;
  registerNumber: string | null;
  email: string;
  dob: string | null;
  phone: string | null;
  parentPhone: string | null;
  profilePhoto: string | null;
  accountStatus: string;
  isClassRep: boolean;
  attendancePercentage: number | null;
  performanceGrade: string | null;
  performanceScore: number | null;
}
export interface FacultyGetClassStudentsOutput {
  classId: string;
  students: ClassStudentItem[];
  total: number;
  _isStub?: boolean;
}

// 5. faculty.getStudentDetails
export interface FacultyGetStudentDetailsInput {
  studentId: string;
}
export interface FacultyGetStudentDetailsOutput {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  registerNumber: string | null;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  accountStatus: string;
  className: string;
  classId: string;
  departmentName: string | null;
  enrollmentYear: number | null;
  city: string | null;
  state: string | null;
  _isStub?: boolean;
}

// 6. faculty.getStudentAttendance
export interface FacultyGetStudentAttendanceInput {
  studentId: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
}
export interface FacultyGetStudentAttendanceOutput {
  studentId: string;
  studentName: string;
  registerNumber: string | null;
  classId: string;
  className: string;
  overallPercentage: number;
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  isDefaulter: boolean;
  recentSessions: Array<{
    date: string;
    period: string;
    subjectName: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  }>;
  _isStub?: boolean;
}

// 7. faculty.getClassAttendanceStats
export interface FacultyGetClassAttendanceStatsInput {
  classId: string;
}
export interface FacultyGetClassAttendanceStatsOutput {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendancePercentage: number;
  totalSessionsConducted: number;
  defaultersCount: number;
  goodAttendanceCount: number;
  _isStub?: boolean;
}

// 8. faculty.getClassAttendanceHistory
export interface FacultyGetClassAttendanceHistoryInput {
  classId: string;
  limit?: number;
}
export interface AttendanceSessionSummaryItem {
  id: string;
  classId: string;
  date: string;
  period: string;
  subjectName: string;
  totalPresent: number;
  totalAbsent: number;
  attendancePercentage: number;
  takenBy: string;
}
export interface FacultyGetClassAttendanceHistoryOutput {
  classId: string;
  sessions: AttendanceSessionSummaryItem[];
  total: number;
  _isStub?: boolean;
}

// 9. faculty.getClassTimetable
export interface FacultyGetClassTimetableInput {
  classId: string;
}
export interface ClassTimetableSlotItem {
  id: string;
  classId: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  roomNumber: string | null;
}
export interface FacultyGetClassTimetableOutput {
  classId: string;
  timetable: ClassTimetableSlotItem[];
  totalSlots: number;
  _isStub?: boolean;
}

// 10. faculty.getTimetable
export interface FacultyGetTimetableInput {
  dayOfWeek?: number;
}
export interface FacultyTimetableSlotItem {
  id: string;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectCode: string;
  className: string;
  classId: string;
  roomNumber: string | null;
}
export interface FacultyGetTimetableOutput {
  facultyUid: string;
  slots: FacultyTimetableSlotItem[];
  totalSlots: number;
  _isStub?: boolean;
}

// 11. faculty.getReminders
export interface FacultyGetRemindersInput {
  type?: string;
  status?: string;
}
export interface FacultyReminderItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'COMPLETED';
  type: string;
}
export interface FacultyGetRemindersOutput {
  reminders: FacultyReminderItem[];
  total: number;
  pendingCount: number;
  _isStub?: boolean;
}

// 12. faculty.search
export interface FacultySearchInput {
  query: string;
}
export interface FacultySearchOutput {
  query: string;
  students: Array<{
    uid: string;
    name: string;
    registerNumber: string | null;
    className: string;
  }>;
  classes: Array<{
    id: string;
    name: string;
    studentCount: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  _isStub?: boolean;
}

// 13. faculty.getDepartment
export interface FacultyGetDepartmentInput {
  departmentId?: string;
}
export interface FacultyGetDepartmentOutput {
  id: string;
  name: string;
  code: string;
  collegeName: string | null;
  hodName: string | null;
  programs: Array<{
    id: string;
    name: string;
    type: string | null;
    durationYears: number;
  }>;
  subjectsCount: number;
  status: string;
  _isStub?: boolean;
}

// 14. faculty.getSubjects
export interface FacultyGetSubjectsInput {
  departmentId?: string;
  semesterNumber?: number;
}
export interface SubjectSummaryItem {
  id: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  isActive: boolean;
  departmentId: string;
}
export interface FacultyGetSubjectsOutput {
  subjects: SubjectSummaryItem[];
  total: number;
  _isStub?: boolean;
}

// 15. faculty.getAcademicYears
export interface FacultyGetAcademicYearsInput {
  collegeId?: string;
}
export interface AcademicYearSummaryItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: string;
}
export interface FacultyGetAcademicYearsOutput {
  academicYears: AcademicYearSummaryItem[];
  total: number;
  _isStub?: boolean;
}

// 16. faculty.getSemesters
export interface FacultyGetSemestersInput {
  collegeId?: string;
}
export interface SemesterSummaryItem {
  id: string;
  academicYearId: string;
  academicYearName: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}
export interface FacultyGetSemestersOutput {
  semesters: SemesterSummaryItem[];
  total: number;
  _isStub?: boolean;
}

// 17. faculty.getPerformance
export interface FacultyGetPerformanceInput {
  subjectId?: string;
}
export interface FacultyPerformanceItem {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  averageScore: number;
  passPercentage: number;
  totalStudents: number;
  highestScore: number;
  lowestScore: number;
}
export interface FacultyGetPerformanceOutput {
  performances: FacultyPerformanceItem[];
  total: number;
  _isStub?: boolean;
}

// 18. faculty.searchKnowledge
export interface FacultySearchKnowledgeInput {
  query: string;
  category?: 'ACADEMIC_POLICY' | 'EXAM_REGULATION' | 'SYLLABUS' | 'INSTITUTIONAL' | 'ALL';
  topK?: number;
}
export interface KnowledgeSearchResultItem {
  id: string;
  title: string;
  snippet: string;
  score: number;
  category: string;
  sourceUrl?: string;
}
export interface FacultySearchKnowledgeOutput {
  query: string;
  results: KnowledgeSearchResultItem[];
  totalMatches: number;
  _isStub?: boolean;
}

// 19. faculty.getKnowledgeContext
export interface FacultyGetKnowledgeContextInput {
  topic: string;
  maxTokens?: number;
}
export interface FacultyGetKnowledgeContextOutput {
  topic: string;
  contextText: string;
  citations: string[];
  lastUpdated: string;
  _isStub?: boolean;
}
