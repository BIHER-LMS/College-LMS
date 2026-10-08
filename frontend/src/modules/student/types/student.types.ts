export interface StudentProfile {
  id?: string;
  userId?: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  studentId: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  profilePhotoUrl: string | null;
  enrollmentYear: number | null;
  profileCompletionPercentage: number;
  accountStatus: string;
  bio: string | null;
}

export interface StudentUpdateProfileDTO {
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  profilePhotoUrl?: string | null;
  bio?: string | null;
}

export interface ClassInfo {
  id: string;
  batchId: string;
  name: string;
  currentSemester: number;
  facultyUid: string | null;
  isActive: boolean;
  batch?: BatchInfo | null;
  program?: ProgramInfo | null;
  department?: DepartmentInfo | null;
  classIncharge?: ClassInchargeInfo | null;
}

export interface BatchInfo {
  id: string;
  programId: string;
  startYear: number;
  endYear: number;
  name?: string;
  isActive: boolean;
  program?: ProgramInfo | null;
}

export interface ProgramInfo {
  id: string;
  departmentId: string;
  name: string;
  type: string;
  durationYears: number;
  isActive: boolean;
  department?: DepartmentInfo | null;
}

export interface DepartmentInfo {
  id: string;
  collegeId: string;
  name: string;
  code: string;
  hodUid: string | null;
  isActive: boolean;
  collegeName?: string | null;
  hod?: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
}

export interface SubjectInfo {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  isActive: boolean;
}

export interface ClassInchargeInfo {
  facultyUid: string;
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  designation: string | null;
  department: string | null;
}

export interface AcademicYearInfo {
  id: string;
  collegeId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SemesterInfo {
  id: string;
  academicYearId: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  academicYear?: {
    id: string;
    name: string;
    isCurrent: boolean;
  } | null;
}

export interface StudentDashboardData {
  student: StudentProfile;
  class: ClassInfo | null;
  batch: BatchInfo | null;
  program: ProgramInfo | null;
  department: DepartmentInfo | null;
  classIncharge: ClassInchargeInfo | null;
  academicYear: AcademicYearInfo | null;
  semester: SemesterInfo | null;
  subjects: SubjectInfo[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ClassTimetableSlot {
  id: string;
  class_id: string;
  day_of_week: string;
  period: string;
  start_time: string | null;
  end_time: string | null;
  subject_name: string;
  subject_code: string | null;
  faculty_name: string | null;
  room: string | null;
}

export interface StudentAttendanceSummary {
  totalSessions: number;
  attendedSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  percentage: number;
  isEligible: boolean;
  safeMargin: number;
  todayTotal: number;
  todayAttended: number;
  todayPresent: number;
  todayLate: number;
  todayAbsent: number;
  todayExcused: number;
  todayEffectivePercentage: number;
}

export interface StudentSubjectAttendance {
  id: string;
  code: string;
  name: string;
  held: number;
  attended: number;
  excused: number;
  absent: number;
  percentage: number;
  status: 'SAFE' | 'CRITICAL' | 'NO_DATA';
}

export interface StudentPeriodAttendanceRecord {
  period: number;
  periodLabel: string;
  timeSlot: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  venue: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY' | 'SCHEDULED' | 'NO_SESSION';
  markedAt: string | null;
  verificationMethod: string;
  topic: string;
}

export interface StudentDayAttendance {
  dayName: string;
  dayOfWeek: string;
  dateStr: string;
  periods: StudentPeriodAttendanceRecord[];
}

export interface StudentAttendanceResponse {
  summary: StudentAttendanceSummary;
  subjectBreakdown: StudentSubjectAttendance[];
  dailySchedule: StudentDayAttendance[];
}

