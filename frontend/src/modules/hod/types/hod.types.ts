export interface Department {
  id: string;
  name: string;
  code: string;
  collegeName?: string;
  collegeCode?: string;
  hodName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  facultyCount?: number;
  studentCount?: number;
  programCount?: number;
  subjectCount?: number;
  hod?: {
    uid: string;
    name: string;
    email: string;
    photoUrl?: string;
  };
}

export interface Statistics {
  facultyCount: number;
  studentCount: number;
  programCount: number;
  batchCount: number;
  classCount: number;
  subjectCount: number;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  semesters?: Semester[];
}

export interface Semester {
  id: string;
  termNumber: number;
  startDate: string;
  endDate: string;
  academicYearId?: string;
  academicYearName?: string;
}

export interface Faculty {
  uid: string;
  id?: string;
  name: string;
  employeeId?: string;
  email: string;
  phone?: string;
  designation?: string;
  photoUrl?: string;
  departmentId?: string;
  departmentName?: string;
  isClassIncharge: boolean;
  assignedClasses?: Array<{ id: string; name: string; current_semester?: number; is_active?: boolean }>;
  assignedClassName?: string;
  subjects?: Array<{ id: string; name: string; code: string; classId: string; className: string }>;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt?: string;
}

export interface Program {
  id: string;
  name: string;
  code?: string;
  degree?: string;
  durationYears: number;
  departmentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  batchCount?: number;
  classCount?: number;
  createdAt?: string;
}

export interface Batch {
  id: string;
  name: string;
  programId: string;
  programName?: string;
  startYear: number;
  endYear: number;
  status: 'ACTIVE' | 'INACTIVE';
  classCount?: number;
  classes?: Array<{ id: string; name: string; current_semester?: number }>;
  createdAt?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  batchId: string;
  batchName?: string;
  programId?: string;
  programName?: string;
  currentSemester?: number;
  semesterNumber?: number;
  facultyUid?: string | null;
  facultyId?: string | null;
  facultyName?: string;
  facultyIncharge?: {
    uid: string;
    id?: string;
    name: string;
    email: string;
    photoUrl?: string;
  } | null;
  studentCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface Student {
  id: string;
  uid?: string;
  registerNumber: string;
  name: string;
  email: string;
  phone?: string;
  programName?: string;
  batchName?: string;
  className?: string;
  classId?: string;
  currentSemester?: number;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'APPROVED';
  attendancePercentage?: number;
  attendanceRecords?: Array<{ id: string; date: string; subjectName: string; status: string }>;
  createdAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  semesterId?: string;
  departmentId?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface HODProfile {
  uid: string;
  id?: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  designation: string;
  departmentId?: string;
  departmentName: string;
  collegeName?: string;
  address?: string;
  photoUrl?: string;
  role?: string;
}

export interface DashboardData {
  department: Department;
  statistics: Statistics;
  academicYear: AcademicYear | null;
  semester: Semester | null;
  recentClasses?: Array<{
    id: string;
    name: string;
    currentSemester?: number;
    programName?: string;
    facultyIncharge?: {
      uid: string;
      display_name: string;
      email: string;
      photo_url?: string;
    } | null;
  }>;
}

export interface AttendanceCohort {
  cohort: string;
  batchName: string;
  percentage: number;
  isAlert: boolean;
}

export interface AttendanceSummary {
  departmentAverage: number;
  totalRecords: number;
  cohorts: AttendanceCohort[];
}

export interface CurriculumItem {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  facultyId: string;
  facultyName: string;
  completionPercentage: number;
  modulesBehind: number;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  scope: string;
  classification: string;
  createdBy?: string;
  authorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAcademicAlert {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  className: string;
  programName: string;
  attendancePercentage: number;
  gpa: number;
  alertType: string;
  notes?: string | null;
  status: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}