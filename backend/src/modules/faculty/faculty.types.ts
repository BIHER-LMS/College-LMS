export interface AuthenticatedUserContext {
  uid: string;
  email: string;
  role: string;
  department_id: string | null;
  college_id: string | null;
  display_name?: string | null;
  photo_url?: string | null;
}

export interface FacultyContextInfo {
  facultyUid: string;
  facultyName: string;
  employeeId: string | null;
  email: string;
  phone: string | null;
  designation: string | null;
  department: string | null;
  departmentId: string | null;
  profilePhoto: string | null;
  isClassIncharge: boolean;
  assignedClass: {
    id: string;
    name: string;
    currentSemester: number | null;
    batchName: string | null;
    programName: string | null;
    studentCount: number;
  } | null;
  currentAcademicYear: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
  currentSemester: {
    id: string;
    termNumber: number;
    startDate: Date;
    endDate: Date;
  } | null;
}

export interface FacultyDashboardResponse {
  faculty: {
    uid: string;
    name: string;
    email: string;
    phone: string | null;
    employeeId: string | null;
    designation: string | null;
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
  assignedSubjects?: {
    id: string;
    name: string;
    code: string;
    classId: string;
    className: string;
  }[];
  academicYear: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  } | null;
  semester: {
    id: string;
    termNumber: number;
    startDate: Date;
    endDate: Date;
  } | null;
}

export interface FacultyProfile {
  id: string;
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  employeeId: string | null;
  designation: string | null;
  department: string | null;
  departmentId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profilePhoto: string | null;
  accountStatus: string;
}

export interface FacultyProfileUpdateInput {
  displayName?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  bio?: string | null;
  profilePhoto?: string | null;
}

export interface ClassRepresentativeInfo {
  uid: string;
  name: string;
  email: string;
  registerNumber: string | null;
  phone: string | null;
  profilePhoto: string | null;
}

export interface FacultyClassSummary {
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
  } | null;
  studentCount: number;
  classRep?: ClassRepresentativeInfo | null;
  overallAttendance?: number;
  overallPerformance?: {
    averageScore: number;
    passRate: number;
  };
}

export interface ClassStudentSummary {
  uid: string;
  name: string;
  registerNumber: string | null;
  email: string;
  dob?: string | null;
  phone: string | null;
  parentPhone?: string | null;
  profilePhoto: string | null;
  accountStatus: string;
  isClassRep?: boolean;
  attendancePercentage?: number;
  performanceGrade?: string;
  performanceScore?: number;
}

export interface StudentDetails {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
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
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  collegeName: string | null;
  hodName: string | null;
  programs: Array<{
    id: string;
    name: string;
    type: string;
    durationYears: number;
  }>;
  subjectsCount: number;
  status: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  isActive: boolean;
  departmentId: string;
}

export interface AcademicYearInfo {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: string;
}

export interface SemesterInfo {
  id: string;
  academicYearId: string;
  academicYearName: string;
  termNumber: number;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
}

export interface FacultySearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'class' | 'student' | 'subject' | 'academic';
  url: string;
  meta?: string;
}

export interface FacultySearchResults {
  classes: FacultySearchResultItem[];
  students: FacultySearchResultItem[];
  subjects: FacultySearchResultItem[];
  academicYears: FacultySearchResultItem[];
}

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface StudentAttendanceRecord {
  studentUid: string;
  displayName: string;
  registerNumber: string | null;
  photoUrl: string | null;
  status: AttendanceStatusType;
  remarks?: string | null;
}

export interface AttendanceSessionDetail {
  id?: string;
  classId: string;
  className: string;
  facultyUid: string;
  subjectId?: string | null;
  subjectName?: string | null;
  date: string;
  period: string;
  remarks?: string | null;
  records: StudentAttendanceRecord[];
}

export interface MarkAttendanceSessionInput {
  classId: string;
  subjectId?: string | null;
  date: string; // YYYY-MM-DD
  period: string; // e.g., "Period 1"
  remarks?: string | null;
  records: {
    studentUid: string;
    status: AttendanceStatusType;
    remarks?: string | null;
  }[];
}

export interface AttendanceSessionSummary {
  id: string;
  classId: string;
  className: string;
  subjectId?: string | null;
  subjectName?: string | null;
  date: string;
  period: string;
  remarks?: string | null;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  createdAt: string;
}

export interface StudentAttendanceStat {
  studentUid: string;
  displayName: string;
  registerNumber: string | null;
  email: string;
  photoUrl: string | null;
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  lateSessions: number;
  excusedSessions: number;
  percentage: number;
  isShortage: boolean; // < 75%
}

export interface ClassAttendanceStatsResponse {
  classId: string;
  className: string;
  totalSessionsConducted: number;
  averageAttendancePercentage: number;
  shortageCount: number;
  students: StudentAttendanceStat[];
}

export interface TodayClassReminder {
  classId: string;
  className: string;
  semester: number | null;
  batch: string | null;
  program: string | null;
  studentCount: number;
  isClassIncharge: boolean;
  todayDate: string;
  attendance: {
    status: 'PENDING' | 'COMPLETED';
    period: string;
    lastMarkedAt: string | null;
    totalEnrolled: number;
  };
  marks: {
    status: 'PENDING' | 'UP_TO_DATE';
    title: string;
    deadline: string | null;
  };
  actions: {
    attendanceUrl: string;
    classDetailsUrl: string;
    studentsUrl: string;
  };
}

export interface FacultyTimetableSlot {
  id?: string;
  faculty_uid?: string;
  day_of_week: string; // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  period: string; // 'Period 1', 'Period 2', ...
  start_time?: string | null;
  end_time?: string | null;
  class_id?: string | null;
  class_name: string;
  subject_id?: string | null;
  subject_name: string;
  room?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ReminderType = 'CLASS_TEST' | 'ASSIGNMENT' | 'ATTENDANCE' | 'GENERAL';
export type ReminderPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ReminderStatus = 'PENDING' | 'COMPLETED';

export interface FacultyReminder {
  id: string;
  faculty_uid: string;
  title: string;
  type: ReminderType;
  class_id?: string | null;
  class_name?: string | null;
  subject_name?: string | null;
  due_date: string; // YYYY-MM-DD
  due_time?: string | null;
  priority: ReminderPriority;
  description?: string | null;
  status: ReminderStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  title: string;
  type?: ReminderType;
  class_id?: string | null;
  class_name?: string | null;
  subject_name?: string | null;
  due_date: string;
  due_time?: string | null;
  priority?: ReminderPriority;
  description?: string | null;
}

export interface TodayRemindersSummary {
  date: string;
  dateIso: string;
  totalClassesToday: number;
  pendingAttendanceCount: number;
  pendingMarksCount: number;
  pendingRemindersCount: number;
  classes: TodayClassReminder[];
  todaySchedule: FacultyTimetableSlot[];
  reminders: FacultyReminder[];
}

export interface BulkStudentUploadItem {
  rollNumber: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  parentPhone: string;
}

export interface ClassTimetableSlot {
  id: string;
  class_id: string;
  day_of_week: string;
  period: string;
  start_time?: string | null;
  end_time?: string | null;
  subject_name: string;
  subject_code?: string | null;
  faculty_name?: string | null;
  room?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FacultySubjectClassPerformance {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterNumber: number;
  classes: Array<{
    classId: string;
    className: string;
    semester: number;
    batch: string;
    enrolledStudents: number;
    averageAttendance: number;
    ciaAverageScore: number;
    passPercentage: number;
    syllabusProgressPercentage: number;
    totalSessions: number;
  }>;
}


